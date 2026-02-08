import { CVStorage, JobApplication } from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import multer from 'multer';
import config from '../../config/index.js';
import { checkDuplicateCV, handleDuplicateCV } from '../../utils/cvDuplicateChecker.js';

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

// Helper function to map model field names to database column names
const mapOrderField = (fieldName) => {
  const fieldMap = {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  };
  return fieldMap[fieldName] || fieldName;
};

/**
 * CV Management Controller (CTV)
 * CTV chỉ có thể quản lý CV của chính họ
 */
export const cvController = {
  /**
   * Get list of CVs (only own CVs)
   * GET /api/ctv/cvs
   */
  getCVs: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        sortBy = 'id',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {
        collaboratorId: req.collaborator.id // Chỉ lấy CV của CTV này
      };

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

      // Validate sortBy
      const allowedSortFields = ['id', 'createdAt', 'updatedAt', 'name', 'code'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'DESC']);
      }

      const { count, rows } = await CVStorage.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      // Get applications count and latest status for each CV using Sequelize model
      const cvCodes = rows.map(cv => cv.code).filter(code => code); // Filter out null/undefined codes
      let countMap = {};
      let latestStatusMap = {};
      
      if (cvCodes.length > 0) {
        // Count job applications grouped by cvCode using Sequelize
        const applications = await JobApplication.findAll({
          attributes: [
            'cvCode',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          where: {
            cvCode: {
              [Op.in]: cvCodes
            }
          },
          group: ['cvCode'],
          raw: true,
          paranoid: true // Only count non-deleted records
        });
        
        // Build count map
        applications.forEach((item) => {
          if (item.cvCode) {
            countMap[item.cvCode] = parseInt(item.count) || 0;
          }
        });

        // Get latest application status for each CV
        // Use a subquery approach to get the most recent application for each CV
        for (const cvCode of cvCodes) {
          const latestApp = await JobApplication.findOne({
            where: {
              cvCode: cvCode,
              status: {
                [Op.not]: null
              }
            },
            order: [['updated_at', 'DESC']],
            attributes: ['status'],
            raw: true,
            paranoid: true
          });
          
          if (latestApp) {
            latestStatusMap[cvCode] = latestApp.status;
          }
        }
      }

      // Attach applications count and latest status to each CV
      const cvsWithCount = rows.map(cv => {
        const cvData = cv.toJSON();
        cvData.applicationsCount = countMap[cv.code] || 0;
        cvData.latestApplicationStatus = latestStatusMap[cv.code] || null;
        return cvData;
      });

      res.json({
        success: true,
        data: {
          cvs: cvsWithCount,
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
   * Get CV by ID (only own CV)
   * GET /api/ctv/cvs/:id
   */
  getCVById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const cv = await CVStorage.findByPk(id, {
        where: {
          collaboratorId: req.collaborator.id
        }
      });

      if (!cv) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV hoặc bạn không có quyền truy cập'
        });
      }

      // Get applications count
      const applicationsCount = await JobApplication.count({
        where: { cvCode: cv.code }
      });

      const cvData = cv.toJSON();
      cvData.applicationsCount = applicationsCount;

      res.json({
        success: true,
        data: { cv: cvData }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new CV
   * POST /api/ctv/cvs
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
          
          // Generate unique code
          const code = `CV${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

          // Handle file upload (multer uses .single so only one file, but check req.files for array)
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
            // These come as JSON strings from FormData, need to parse them
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

          // Create CV
          const cv = await CVStorage.create({
            collaboratorId: req.collaborator.id,
            code,
            ...cvData,
            curriculumVitae: cvFile,
            isDuplicate: false,
            duplicateWithCvId: null
          });

          // Check for duplicate CV
          let duplicateResult = null;
          if (cvData.name || cvData.email || cvData.phone) {
            const duplicateCV = await checkDuplicateCV(cvData.name, cvData.email, cvData.phone);
            if (duplicateCV && duplicateCV.id !== cv.id) {
              duplicateResult = await handleDuplicateCV(duplicateCV, cv);
            }
          }

          // Reload CV to get updated data
          await cv.reload();

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
   * Update CV (only own CV)
   * PUT /api/ctv/cvs/:id
   */
  updateCV: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if CV exists and belongs to this collaborator
      const cv = await CVStorage.findByPk(id);
      if (!cv || cv.collaboratorId !== req.collaborator.id) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV hoặc bạn không có quyền chỉnh sửa'
        });
      }

      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }

        try {
          const updateData = req.body;

          // Handle file upload
          if (req.file) {
            // Delete old file if exists
            if (cv.cvFile) {
              try {
                const oldFilePath = path.join(__dirname, '../../../', cv.cvFile);
                await fs.unlink(oldFilePath);
              } catch (unlinkError) {
                console.error('Error deleting old file:', unlinkError);
              }
            }
            updateData.cvFile = path.relative(path.join(__dirname, '../../../'), req.file.path);
          }

          // Update CV
          Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined && key !== 'id' && key !== 'code' && key !== 'collaboratorId') {
              cv[key] = updateData[key];
            }
          });

          await cv.save();

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
   * Delete CV (only own CV, soft delete)
   * DELETE /api/ctv/cvs/:id
   */
  deleteCV: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if CV exists and belongs to this collaborator
      const cv = await CVStorage.findByPk(id);
      if (!cv || cv.collaboratorId !== req.collaborator.id) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV hoặc bạn không có quyền xóa'
        });
      }

      // Check if CV has applications
      const applicationsCount = await JobApplication.count({
        where: { cvCode: cv.code }
      });

      if (applicationsCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Không thể xóa CV vì đã có ${applicationsCount} đơn ứng tuyển liên quan`
        });
      }

      // Soft delete
      await cv.destroy();

      res.json({
        success: true,
        message: 'Xóa CV thành công'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get CV statistics and list
   * GET /api/ctv/cvs/statistics
   * Trả về danh sách CV và thống kê đơn ứng tuyển
   */
  getCVStatistics: async (req, res, next) => {
    try {
      const collaboratorId = req.collaborator.id;

      // Lấy danh sách CV của CTV này
      const cvs = await CVStorage.findAll({
        where: {
          collaboratorId: collaboratorId
        },
        attributes: ['id', 'code', 'name', 'email', 'phone', 'status', 'createdAt', 'updatedAt'],
        order: [['created_at', 'DESC']]
      });

      // Đếm tổng số đơn ứng tuyển đã tạo
      const totalApplications = await JobApplication.count({
        where: {
          collaboratorId: collaboratorId
        }
      });

      // Đếm số đơn đã đến vòng phỏng vấn (status = 4)
      const interviewedApplications = await JobApplication.count({
        where: {
          collaboratorId: collaboratorId,
          status: 4
        }
      });

      // Đếm số đơn đã được tuyển (status = 8)
      const hiredApplications = await JobApplication.count({
        where: {
          collaboratorId: collaboratorId,
          status: 8
        }
      });

      res.json({
        success: true,
        data: {
          cvs: cvs.map(cv => cv.toJSON()),
          statistics: {
            totalCVs: cvs.length,
            totalApplications: totalApplications,
            interviewedApplications: interviewedApplications,
            hiredApplications: hiredApplications
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get recently updated CVs (sorted by updatedAt DESC)
   * GET /api/ctv/cvs/recent
   */
  getRecentCVs: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        isDuplicate,
        sortBy = 'updatedAt',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {
        collaboratorId: req.collaborator.id // Chỉ lấy CV của CTV này
      };

      // Search by name, email, or code
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } }
        ];
      }

      // Filter by duplicate status
      if (isDuplicate !== undefined) {
        where.isDuplicate = isDuplicate === '1' || isDuplicate === 'true';
      }

      // Validate sortBy
      const allowedSortFields = ['id', 'createdAt', 'updatedAt', 'name', 'code'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'updatedAt';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause - always prioritize updatedAt DESC
      const orderClause = [['updated_at', 'DESC']];
      if (sortField !== 'updatedAt') {
        orderClause.push([dbSortField, orderDirection]);
      }
      orderClause.push(['id', 'DESC']);

      const { count, rows } = await CVStorage.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      // Get applications count for each CV
      const cvCodes = rows.map(cv => cv.code).filter(code => code);
      let countMap = {};
      
      if (cvCodes.length > 0) {
        const applications = await JobApplication.findAll({
          attributes: [
            'cvCode',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          where: {
            cvCode: {
              [Op.in]: cvCodes
            }
          },
          group: ['cvCode'],
          raw: true,
          paranoid: true
        });
        
        applications.forEach((item) => {
          if (item.cvCode) {
            countMap[item.cvCode] = parseInt(item.count) || 0;
          }
        });
      }

      // Attach applications count to each CV
      const cvsWithCount = rows.map(cv => {
        const cvData = cv.toJSON();
        cvData.applicationsCount = countMap[cv.code] || 0;
        return cvData;
      });

      res.json({
        success: true,
        data: {
          cvs: cvsWithCount,
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
  }
};

