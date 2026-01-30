import { CVStorage, Collaborator, Admin, ActionLog } from '../../models/index.js';
import { Op } from 'sequelize';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import config from '../../config/index.js';

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
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), config.upload.dir, 'cvs');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `cv-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG'));
    }
  }
});

export const uploadCVFile = upload.single('cvFile');

/**
 * CV File Management Controller (Admin)
 */
export const cvStorageController = {
  /**
   * Get list of CV files
   * GET /api/admin/cv-storages
   */
  getCVStorages: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        collaboratorId,
        adminId,
        status,
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

      // Filter by collaborator
      if (collaboratorId) {
        where.collaboratorId = parseInt(collaboratorId);
      }

      // Filter by admin
      if (adminId) {
        where.adminId = parseInt(adminId);
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

      // Build order clause - always add id as secondary sort for consistency
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'ASC']); // Secondary sort by id ascending
      }

      const { count, rows } = await CVStorage.findAndCountAll({
        where,
        attributes: ['id', 'code', 'name', 'email', 'phone', 'curriculumVitae', 'otherDocuments', 'status', 'createdAt', 'updatedAt'],
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

      res.json({
        success: true,
        data: {
          cvStorages: rows,
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
   * Upload CV file
   * POST /api/admin/cv-storages/:id/upload
   */
  uploadCVFile: async (req, res, next) => {
    try {
      const { id } = req.params;
      const fileType = req.body.fileType || 'curriculumVitae'; // curriculumVitae or otherDocuments

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn file để upload'
        });
      }

      const cv = await CVStorage.findByPk(id);
      if (!cv) {
        // Delete uploaded file if CV not found
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV'
        });
      }

      const oldData = cv.toJSON();

      // Delete old file if exists
      if (fileType === 'curriculumVitae' && cv.curriculumVitae) {
        const oldFilePath = path.join(process.cwd(), config.upload.dir, 'cvs', path.basename(cv.curriculumVitae));
        await fs.unlink(oldFilePath).catch(() => {});
      } else if (fileType === 'otherDocuments' && cv.otherDocuments) {
        const oldFilePath = path.join(process.cwd(), config.upload.dir, 'cvs', path.basename(cv.otherDocuments));
        await fs.unlink(oldFilePath).catch(() => {});
      }

      // Save file path relative to upload directory
      const filePath = `/uploads/cvs/${req.file.filename}`;

      if (fileType === 'curriculumVitae') {
        cv.curriculumVitae = filePath;
      } else {
        cv.otherDocuments = filePath;
      }

      await cv.save();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'CVStorage',
        action: 'upload_file',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        after: cv.toJSON(),
        description: `Upload file CV: ${req.file.originalname} cho CV ${cv.code}`
      });

      res.json({
        success: true,
        message: 'Upload file thành công',
        data: {
          cv: {
            id: cv.id,
            code: cv.code,
            curriculumVitae: cv.curriculumVitae,
            otherDocuments: cv.otherDocuments
          },
          file: {
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            path: filePath
          }
        }
      });
    } catch (error) {
      // Delete uploaded file on error
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      next(error);
    }
  },

  /**
   * Download CV file
   * GET /api/admin/cv-storages/:id/download
   */
  downloadCVFile: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { fileType = 'curriculumVitae' } = req.query;

      const cv = await CVStorage.findByPk(id);
      if (!cv) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV'
        });
      }

      const filePath = fileType === 'curriculumVitae' ? cv.curriculumVitae : cv.otherDocuments;

      if (!filePath) {
        return res.status(404).json({
          success: false,
          message: 'File không tồn tại'
        });
      }

      // Construct full file path
      const fullPath = path.join(process.cwd(), filePath);

      // Check if file exists
      try {
        await fs.access(fullPath);
      } catch {
        return res.status(404).json({
          success: false,
          message: 'File không tồn tại trên server'
        });
      }

      // Get file stats
      const stats = await fs.stat(fullPath);
      const filename = path.basename(filePath);

      // Set headers
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Length', stats.size);

      // Stream file
      const fileStream = await fs.readFile(fullPath);
      res.send(fileStream);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete CV file
   * DELETE /api/admin/cv-storages/:id/file
   */
  deleteCVFile: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { fileType = 'curriculumVitae' } = req.query;

      const cv = await CVStorage.findByPk(id);
      if (!cv) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV'
        });
      }

      const oldData = cv.toJSON();
      const filePath = fileType === 'curriculumVitae' ? cv.curriculumVitae : cv.otherDocuments;

      if (!filePath) {
        return res.status(404).json({
          success: false,
          message: 'File không tồn tại'
        });
      }

      // Delete file from filesystem
      const fullPath = path.join(process.cwd(), filePath);
      try {
        await fs.unlink(fullPath);
      } catch (error) {
        // File might not exist, continue anyway
      }

      // Update CV record
      if (fileType === 'curriculumVitae') {
        cv.curriculumVitae = null;
      } else {
        cv.otherDocuments = null;
      }

      await cv.save();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'CVStorage',
        action: 'delete_file',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        after: cv.toJSON(),
        description: `Xóa file CV: ${filePath} cho CV ${cv.code}`
      });

      res.json({
        success: true,
        message: 'Xóa file thành công'
      });
    } catch (error) {
      next(error);
    }
  }
};

