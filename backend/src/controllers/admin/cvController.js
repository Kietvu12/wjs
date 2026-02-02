import { CVStorage, Collaborator, Admin, ActionLog, JobApplication } from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import multer from 'multer';
import config from '../../config/index.js';
import { checkDuplicateCV, handleDuplicateCV } from '../../utils/cvDuplicateChecker.js';

// Helper function to map model field names to database column names
const mapOrderField = (fieldName) => {
  const fieldMap = {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'approvedAt': 'approved_at'
  };
  return fieldMap[fieldName] || fieldName;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const uploadDir = path.join(__dirname, '../../../', config.upload.dir, 'cvs');
// Ensure upload directory exists
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `cv-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file PDF, DOC, DOCX, JPG, JPEG, PNG'));
    }
  }
}).single('cvFile');

/**
 * CV Management Controller (Admin)
 */
export const cvController = {
  /**
   * Get list of CVs
   * GET /api/admin/cvs
   */
  getCVs: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        collaboratorId,
        adminId,
        startDate,
        endDate,
        sortBy = 'id',
        sortOrder = 'ASC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      // Search by name, email, or code
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } }
        ];
      }

      // Filter by status
      if (status !== undefined) {
        where.status = parseInt(status);
      }

      // Filter by collaborator
      if (collaboratorId) {
        where.collaboratorId = parseInt(collaboratorId);
      }

      // Filter by admin - default to current admin if not specified
      if (adminId) {
        where.adminId = parseInt(adminId);
      } else if (req.admin?.id) {
        // Automatically filter by current admin if no adminId specified
        where.adminId = req.admin.id;
      }

      // Filter by date range
      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) {
          where.created_at[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.created_at[Op.lte] = new Date(endDate);
        }
      }

      // Validate sortBy
      const allowedSortFields = ['id', 'createdAt', 'updatedAt', 'name', 'code'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause - always add id as secondary sort for consistency
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'ASC']); // Secondary sort by id ascending
      }

      const { count, rows } = await CVStorage.findAndCountAll({
        where,
        include: [
          {
            model: Collaborator,
            as: 'collaborator',
            required: false,
            attributes: ['id', 'name', 'email', 'code']
          },
          {
            model: Admin,
            as: 'admin',
            required: false,
            attributes: ['id', 'name', 'email']
          }
        ],
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      // Get applications count for each CV
      const cvCodes = rows.map(cv => cv.code).filter(code => code);
      if (cvCodes.length > 0) {
        const codesPlaceholder = cvCodes.map(() => '?').join(',');
        const applicationsCounts = await sequelize.query(
          `SELECT cv_code, COUNT(*) as count 
           FROM job_applications 
           WHERE cv_code IN (${codesPlaceholder})
           AND deleted_at IS NULL
           GROUP BY cv_code`,
          {
            replacements: cvCodes,
            type: sequelize.QueryTypes.SELECT
          }
        );

        const countMap = {};
        applicationsCounts.forEach(item => {
          countMap[item.cv_code] = parseInt(item.count);
        });

        // Add applicationsCount to each CV
        rows.forEach(cv => {
          cv.dataValues.applicationsCount = countMap[cv.code] || 0;
        });
      } else {
        rows.forEach(cv => {
          cv.dataValues.applicationsCount = 0;
        });
      }

      res.json({
        success: true,
        data: {
          cvs: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / parseInt(limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get CV by ID
   * GET /api/admin/cvs/:id
   */
  getCVById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const cv = await CVStorage.findByPk(id, {
        include: [
          {
            model: Collaborator,
            as: 'collaborator',
            required: false,
            attributes: ['id', 'name', 'email', 'code', 'phone']
          },
          {
            model: Admin,
            as: 'admin',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: JobApplication,
            as: 'jobApplications',
            required: false,
            attributes: ['id', 'jobId', 'status', 'appliedAt'],
            limit: 10
          }
        ]
      });

      if (!cv) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV'
        });
      }

      res.json({
        success: true,
        data: { cv }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new CV
   * POST /api/admin/cvs
   */
  createCV: async (req, res, next) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }

        try {
          const rawData = req.body;
          
          // Generate code if not provided
          const cvCode = rawData.code || `CV-${uuidv4().substring(0, 8).toUpperCase()}`;

          // Check if code already exists
          const existingCV = await CVStorage.findOne({ where: { code: cvCode } });
          if (existingCV) {
            return res.status(409).json({
              success: false,
              message: 'Mã CV đã tồn tại'
            });
          }

          // Handle file upload
          let cvFile = null;
          if (req.file) {
            cvFile = path.relative(path.join(__dirname, '../../../'), req.file.path);
          } else if (req.files && req.files.length > 0) {
            // If multiple files, take the first one
            cvFile = path.relative(path.join(__dirname, '../../../'), req.files[0].path);
          }

          // Map frontend fields to backend model fields and parse JSON strings
          const cvData = {
            // Map name fields
            name: rawData.nameKanji || rawData.name || null,
            furigana: rawData.nameKana || rawData.furigana || null,
            
            // Map contact fields
            email: rawData.email || null,
            phone: rawData.phone || null,
            postalCode: rawData.postalCode || null,
            addressCurrent: rawData.address || rawData.addressCurrent || null,
            
            // Map personal info
            birthDate: rawData.birthDate || null,
            ages: rawData.age || rawData.ages || null,
            gender: rawData.gender ? (rawData.gender === '男' || rawData.gender === '1' ? 1 : rawData.gender === '女' || rawData.gender === '2' ? 2 : null) : null,
            
            // Parse JSON fields (educations, workExperiences, certificates)
            educations: rawData.educations 
              ? (typeof rawData.educations === 'string' 
                  ? (rawData.educations.trim() ? JSON.parse(rawData.educations) : null)
                  : Array.isArray(rawData.educations) ? rawData.educations : null)
              : null,
            workExperiences: rawData.workExperiences
              ? (typeof rawData.workExperiences === 'string'
                  ? (rawData.workExperiences.trim() ? JSON.parse(rawData.workExperiences) : null)
                  : Array.isArray(rawData.workExperiences) ? rawData.workExperiences : null)
              : null,
            certificates: rawData.certificates
              ? (typeof rawData.certificates === 'string'
                  ? (rawData.certificates.trim() ? JSON.parse(rawData.certificates) : null)
                  : Array.isArray(rawData.certificates) ? rawData.certificates : null)
              : null,
            
            // Map skills and summary
            technicalSkills: rawData.technicalSkills || null,
            careerSummary: rawData.careerSummary || null,
            strengths: rawData.strengths || null,
            motivation: rawData.motivation || null,
            
            // Map preferences
            currentIncome: rawData.currentSalary ? parseInt(rawData.currentSalary.replace(/[^\d]/g, '')) || null : null,
            desiredIncome: rawData.desiredSalary ? parseInt(rawData.desiredSalary.replace(/[^\d]/g, '')) || null : null,
            desiredWorkLocation: rawData.desiredLocation || rawData.desiredWorkLocation || null,
            desiredPosition: rawData.desiredPosition || null,
            nyushaTime: rawData.desiredStartDate || rawData.nyushaTime || null,
            
            // Other fields that might be sent
            addressOrigin: rawData.addressOrigin || null,
            passport: rawData.passport ? parseInt(rawData.passport) : null,
            currentResidence: rawData.currentResidence ? parseInt(rawData.currentResidence) : null,
            jpResidenceStatus: rawData.jpResidenceStatus ? parseInt(rawData.jpResidenceStatus) : null,
            visaExpirationDate: rawData.visaExpirationDate || null,
            otherCountry: rawData.otherCountry || null,
            spouse: rawData.spouse ? parseInt(rawData.spouse) : null,
            interviewTime: rawData.interviewTime || null,
            learnedTools: rawData.learnedTools 
              ? (typeof rawData.learnedTools === 'string' ? JSON.parse(rawData.learnedTools) : rawData.learnedTools)
              : null,
            experienceTools: rawData.experienceTools
              ? (typeof rawData.experienceTools === 'string' ? JSON.parse(rawData.experienceTools) : rawData.experienceTools)
              : null,
            jlptLevel: rawData.jlptLevel ? parseInt(rawData.jlptLevel) : null,
            experienceYears: rawData.experienceYears ? parseInt(rawData.experienceYears) : null,
            specialization: rawData.specialization ? parseInt(rawData.specialization) : null,
            qualification: rawData.qualification ? parseInt(rawData.qualification) : null,
            otherDocuments: rawData.otherDocuments || null,
            notes: rawData.notes || null,
          };

          // Remove null/undefined values to avoid overwriting with null
          Object.keys(cvData).forEach(key => {
            if (cvData[key] === null || cvData[key] === undefined) {
              delete cvData[key];
            }
          });

          // Validate collaboratorId if provided - if not exists, set to null silently
          let collaboratorId = null;
          if (rawData.collaboratorId) {
            const collaboratorIdInt = parseInt(rawData.collaboratorId);
            if (!isNaN(collaboratorIdInt) && collaboratorIdInt > 0) {
              // Check if collaborator exists
              const collaborator = await Collaborator.findByPk(collaboratorIdInt);
              if (collaborator) {
                collaboratorId = collaboratorIdInt;
              } else {
                // If collaborator doesn't exist, silently set to null
                // This allows creating CV even if CTV ID is incorrect
                collaboratorId = null;
                console.warn(`Collaborator ID ${collaboratorIdInt} not found, setting to null for CV creation`);
              }
            }
          }

          // Create CV
          const cv = await CVStorage.create({
            code: cvCode,
            collaboratorId: collaboratorId,
            adminId: req.admin.id, // Admin tạo CV
            curriculumVitae: cvFile,
            ...cvData,
            status: 1,
            isDuplicate: false,
            duplicateWithCvId: null
          });

          // Check for duplicate CV
          let duplicateResult = null;
          const cvName = cvData.name;
          const cvEmail = cvData.email;
          const cvPhone = cvData.phone;
          if (cvName || cvEmail || cvPhone) {
            const duplicateCV = await checkDuplicateCV(cvName, cvEmail, cvPhone);
            if (duplicateCV && duplicateCV.id !== cv.id) {
              duplicateResult = await handleDuplicateCV(duplicateCV, cv);
            }
          }

          // Reload with relations
          await cv.reload({
            include: [
              {
                model: Collaborator,
                as: 'collaborator',
                required: false
              },
              {
                model: Admin,
                as: 'admin',
                required: false
              }
            ]
          });

          // Log action
          await ActionLog.create({
            adminId: req.admin.id,
            object: 'CVStorage',
            action: 'create',
            ip: req.ip || req.connection.remoteAddress,
            after: cv.toJSON(),
            description: `Tạo mới CV: ${cv.code} - ${cv.name || 'N/A'}`
          });

          const responseData = {
            success: true,
            message: 'Tạo CV thành công',
            data: { cv }
          };

          // Thêm thông tin duplicate nếu có
          if (duplicateResult) {
            responseData.data.duplicateInfo = {
              isDuplicate: duplicateResult.isDuplicate,
              duplicateWithCvId: duplicateResult.duplicateWithCvId,
              oldCvUpdated: duplicateResult.oldCvUpdated,
              message: duplicateResult.message
            };
            if (duplicateResult.isDuplicate) {
              responseData.message = 'Tạo CV thành công nhưng CV bị trùng với CV đã tồn tại';
            }
          }

          res.status(201).json(responseData);
        } catch (error) {
          // Delete uploaded file if CV creation fails
          if (req.file) {
            try {
              await fs.unlink(req.file.path);
            } catch (unlinkError) {
              console.error('Error deleting file:', unlinkError);
            }
          }
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update CV
   * PUT /api/admin/cvs/:id
   */
  updateCV: async (req, res, next) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }

        try {
          const { id } = req.params;
          const rawData = req.body;

          const cv = await CVStorage.findByPk(id);
          if (!cv) {
            return res.status(404).json({
              success: false,
              message: 'Không tìm thấy CV'
            });
          }

          // Store old data for log
          const oldData = cv.toJSON();

          // Check if code is being changed and if it's unique
          if (rawData.code && rawData.code !== cv.code) {
            const existingCV = await CVStorage.findOne({
              where: { code: rawData.code, id: { [Op.ne]: id } }
            });
            if (existingCV) {
              return res.status(409).json({
                success: false,
                message: 'Mã CV đã tồn tại'
              });
            }
          }

          // Handle file upload
          if (req.file) {
            // Delete old file if exists
            if (cv.curriculumVitae) {
              try {
                const oldFilePath = path.join(__dirname, '../../../', cv.curriculumVitae);
                await fs.unlink(oldFilePath);
              } catch (unlinkError) {
                console.error('Error deleting old file:', unlinkError);
              }
            }
            cv.curriculumVitae = path.relative(path.join(__dirname, '../../../'), req.file.path);
          }

          // Validate collaboratorId if provided - if not exists, set to null silently
          if (rawData.collaboratorId !== undefined) {
            if (rawData.collaboratorId) {
              const collaboratorIdInt = parseInt(rawData.collaboratorId);
              if (!isNaN(collaboratorIdInt) && collaboratorIdInt > 0) {
                // Check if collaborator exists
                const collaborator = await Collaborator.findByPk(collaboratorIdInt);
                if (collaborator) {
                  cv.collaboratorId = collaboratorIdInt;
                } else {
                  // If collaborator doesn't exist, silently set to null
                  // This allows updating CV even if CTV ID is incorrect
                  cv.collaboratorId = null;
                  console.warn(`Collaborator ID ${collaboratorIdInt} not found, setting to null for CV update`);
                }
              } else {
                cv.collaboratorId = null;
              }
            } else {
              // Empty string or null - set to null
              cv.collaboratorId = null;
            }
          }

          // Map frontend fields to backend model fields and parse JSON strings
          const updateData = {
            // Map name fields
            name: rawData.nameKanji !== undefined ? (rawData.nameKanji || null) : undefined,
            furigana: rawData.nameKana !== undefined ? (rawData.nameKana || null) : undefined,
            
            // Map contact fields
            email: rawData.email !== undefined ? (rawData.email || null) : undefined,
            phone: rawData.phone !== undefined ? (rawData.phone || null) : undefined,
            postalCode: rawData.postalCode !== undefined ? (rawData.postalCode || null) : undefined,
            addressCurrent: rawData.address !== undefined ? (rawData.address || rawData.addressCurrent || null) : undefined,
            
            // Map personal info
            birthDate: rawData.birthDate !== undefined ? (rawData.birthDate || null) : undefined,
            ages: rawData.age !== undefined ? (rawData.age || rawData.ages || null) : undefined,
            gender: rawData.gender !== undefined 
              ? (rawData.gender ? (rawData.gender === '男' || rawData.gender === '1' ? 1 : rawData.gender === '女' || rawData.gender === '2' ? 2 : null) : null)
              : undefined,
            
            // Parse JSON fields (educations, workExperiences, certificates)
            educations: rawData.educations !== undefined
              ? (rawData.educations 
                  ? (typeof rawData.educations === 'string' 
                      ? (rawData.educations.trim() ? JSON.parse(rawData.educations) : null)
                      : Array.isArray(rawData.educations) ? rawData.educations : null)
                  : null)
              : undefined,
            workExperiences: rawData.workExperiences !== undefined
              ? (rawData.workExperiences
                  ? (typeof rawData.workExperiences === 'string'
                      ? (rawData.workExperiences.trim() ? JSON.parse(rawData.workExperiences) : null)
                      : Array.isArray(rawData.workExperiences) ? rawData.workExperiences : null)
                  : null)
              : undefined,
            certificates: rawData.certificates !== undefined
              ? (rawData.certificates
                  ? (typeof rawData.certificates === 'string'
                      ? (rawData.certificates.trim() ? JSON.parse(rawData.certificates) : null)
                      : Array.isArray(rawData.certificates) ? rawData.certificates : null)
                  : null)
              : undefined,
            
            // Map skills and summary
            technicalSkills: rawData.technicalSkills !== undefined ? (rawData.technicalSkills || null) : undefined,
            careerSummary: rawData.careerSummary !== undefined ? (rawData.careerSummary || null) : undefined,
            strengths: rawData.strengths !== undefined ? (rawData.strengths || null) : undefined,
            motivation: rawData.motivation !== undefined ? (rawData.motivation || null) : undefined,
            
            // Map preferences
            currentIncome: rawData.currentSalary !== undefined 
              ? (rawData.currentSalary ? parseInt(rawData.currentSalary.replace(/[^\d]/g, '')) || null : null)
              : undefined,
            desiredIncome: rawData.desiredSalary !== undefined
              ? (rawData.desiredSalary ? parseInt(rawData.desiredSalary.replace(/[^\d]/g, '')) || null : null)
              : undefined,
            desiredWorkLocation: rawData.desiredLocation !== undefined 
              ? (rawData.desiredLocation || rawData.desiredWorkLocation || null)
              : undefined,
            desiredPosition: rawData.desiredPosition !== undefined ? (rawData.desiredPosition || null) : undefined,
            nyushaTime: rawData.desiredStartDate !== undefined 
              ? (rawData.desiredStartDate || rawData.nyushaTime || null)
              : undefined,
            
            // Other fields
            addressOrigin: rawData.addressOrigin !== undefined ? (rawData.addressOrigin || null) : undefined,
            passport: rawData.passport !== undefined ? (rawData.passport ? parseInt(rawData.passport) : null) : undefined,
            currentResidence: rawData.currentResidence !== undefined ? (rawData.currentResidence ? parseInt(rawData.currentResidence) : null) : undefined,
            jpResidenceStatus: rawData.jpResidenceStatus !== undefined ? (rawData.jpResidenceStatus ? parseInt(rawData.jpResidenceStatus) : null) : undefined,
            visaExpirationDate: rawData.visaExpirationDate !== undefined ? (rawData.visaExpirationDate || null) : undefined,
            otherCountry: rawData.otherCountry !== undefined ? (rawData.otherCountry || null) : undefined,
            spouse: rawData.spouse !== undefined ? (rawData.spouse ? parseInt(rawData.spouse) : null) : undefined,
            interviewTime: rawData.interviewTime !== undefined ? (rawData.interviewTime || null) : undefined,
            learnedTools: rawData.learnedTools !== undefined
              ? (rawData.learnedTools 
                  ? (typeof rawData.learnedTools === 'string' ? JSON.parse(rawData.learnedTools) : rawData.learnedTools)
                  : null)
              : undefined,
            experienceTools: rawData.experienceTools !== undefined
              ? (rawData.experienceTools
                  ? (typeof rawData.experienceTools === 'string' ? JSON.parse(rawData.experienceTools) : rawData.experienceTools)
                  : null)
              : undefined,
            jlptLevel: rawData.jlptLevel !== undefined ? (rawData.jlptLevel ? parseInt(rawData.jlptLevel) : null) : undefined,
            experienceYears: rawData.experienceYears !== undefined ? (rawData.experienceYears ? parseInt(rawData.experienceYears) : null) : undefined,
            specialization: rawData.specialization !== undefined ? (rawData.specialization ? parseInt(rawData.specialization) : null) : undefined,
            qualification: rawData.qualification !== undefined ? (rawData.qualification ? parseInt(rawData.qualification) : null) : undefined,
            otherDocuments: rawData.otherDocuments !== undefined ? (rawData.otherDocuments || null) : undefined,
            notes: rawData.notes !== undefined ? (rawData.notes || null) : undefined,
          };

          // Update fields (only update if value is not undefined)
          Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
              cv[key] = updateData[key];
            }
          });

          await cv.save();

          // Reload with relations
          await cv.reload({
            include: [
              {
                model: Collaborator,
                as: 'collaborator',
                required: false
              },
              {
                model: Admin,
                as: 'admin',
                required: false
              }
            ]
          });

          // Log action
          await ActionLog.create({
            adminId: req.admin.id,
            object: 'CVStorage',
            action: 'edit',
            ip: req.ip || req.connection.remoteAddress,
            before: oldData,
            after: cv.toJSON(),
            description: `Cập nhật CV: ${cv.code} - ${cv.name || 'N/A'}`
          });

          res.json({
            success: true,
            message: 'Cập nhật CV thành công',
            data: { cv }
          });
        } catch (error) {
          // Delete uploaded file if update fails
          if (req.file) {
            try {
              await fs.unlink(req.file.path);
            } catch (unlinkError) {
              console.error('Error deleting file:', unlinkError);
            }
          }
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete CV (soft delete)
   * DELETE /api/admin/cvs/:id
   */
  deleteCV: async (req, res, next) => {
    try {
      const { id } = req.params;

      const cv = await CVStorage.findByPk(id);
      if (!cv) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV'
        });
      }

      // Store old data for log
      const oldData = cv.toJSON();

      // Soft delete
      await cv.destroy();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'CVStorage',
        action: 'delete',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        description: `Xóa CV: ${cv.code} - ${cv.name || 'N/A'}`
      });

      res.json({
        success: true,
        message: 'Xóa CV thành công'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get CV update history
   * GET /api/admin/cvs/:id/history
   */
  getCVHistory: async (req, res, next) => {
    try {
      const { id } = req.params;

      const cv = await CVStorage.findByPk(id);
      if (!cv) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV'
        });
      }

      // Get update history from action_logs
      // Search for logs where description contains CV code or id
      const history = await ActionLog.findAll({
        where: {
          object: 'CVStorage',
          [Op.or]: [
            { description: { [Op.like]: `%${cv.code}%` } },
            { after: { [Op.like]: `%"id":${id}%` } },
            { before: { [Op.like]: `%"id":${id}%` } }
          ]
        },
        include: [
          {
            model: Admin,
            as: 'admin',
            required: false,
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 50
      });

      res.json({
        success: true,
        data: {
          cv: {
            id: cv.id,
            code: cv.code,
            name: cv.name
          },
          history
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

