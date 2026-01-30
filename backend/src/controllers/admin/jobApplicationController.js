import {
  JobApplication,
  Job,
  JobCategory,
  Company,
  Collaborator,
  CVStorage,
  ActionLog,
  PaymentRequest,
  Admin
} from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import { calculateCommission } from '../../utils/commissionCalculator.js';

// Helper function to map model field names to database column names
const mapOrderField = (fieldName) => {
  const fieldMap = {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'appliedAt': 'applied_at',
    'interviewDate': 'interview_date',
    'nyushaDate': 'nyusha_date'
  };
  return fieldMap[fieldName] || fieldName;
};

/**
 * Job Application Management Controller (Admin)
 */
export const jobApplicationController = {
  /**
   * Get list of job applications
   * GET /api/admin/job-applications
   */
  getJobApplications: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        jobId,
        collaboratorId,
        appliedFrom,
        appliedTo,
        interviewFrom,
        interviewTo,
        nyushaFrom,
        nyushaTo,
        sortBy = 'id',
        sortOrder = 'ASC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      // Filter by status
      if (status !== undefined) {
        where.status = parseInt(status);
      }

      // Filter by job
      if (jobId) {
        where.jobId = parseInt(jobId);
      }

      // Filter by collaborator
      if (collaboratorId) {
        where.collaboratorId = parseInt(collaboratorId);
      }

      // Filter by applied date
      if (appliedFrom || appliedTo) {
        where.applied_at = {};
        if (appliedFrom) {
          where.applied_at[Op.gte] = new Date(appliedFrom);
        }
        if (appliedTo) {
          where.applied_at[Op.lte] = new Date(appliedTo);
        }
      }

      // Filter by interview date
      if (interviewFrom || interviewTo) {
        where.interview_date = {};
        if (interviewFrom) {
          where.interview_date[Op.gte] = new Date(interviewFrom);
        }
        if (interviewTo) {
          where.interview_date[Op.lte] = new Date(interviewTo);
        }
      }

      // Filter by nyusha date
      if (nyushaFrom || nyushaTo) {
        where.nyusha_date = {};
        if (nyushaFrom) {
          where.nyusha_date[Op.gte] = nyushaFrom;
        }
        if (nyushaTo) {
          where.nyusha_date[Op.lte] = nyushaTo;
        }
      }

      // Validate sortBy
      const allowedSortFields = ['id', 'status', 'appliedAt', 'interviewDate', 'nyushaDate', 'createdAt', 'updatedAt'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'ASC']);
      }

      const includeOptions = [
        {
          model: Job,
          as: 'job',
          required: false,
          attributes: ['id', 'jobCode', 'title', 'slug']
        },
        {
          model: Collaborator,
          as: 'collaborator',
          required: false,
          attributes: ['id', 'name', 'email', 'code']
        },
        {
          model: CVStorage,
          as: 'cv',
          required: false,
          attributes: ['id', 'code', 'name', 'email']
        }
      ];

      // Search by CV name, email, phone if search provided
      if (search) {
        includeOptions.push({
          model: CVStorage,
          as: 'cv',
          required: false,
          where: {
            [Op.or]: [
              { name: { [Op.like]: `%${search}%` } },
              { email: { [Op.like]: `%${search}%` } },
              { phone: { [Op.like]: `%${search}%` } }
            ]
          },
          attributes: ['id', 'code', 'name', 'email']
        });
      }

      const { count, rows } = await JobApplication.findAndCountAll({
        where,
        include: includeOptions.filter((item, index, self) => 
          index === self.findIndex(t => t.as === item.as)
        ),
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      res.json({
        success: true,
        data: {
          jobApplications: rows,
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
   * Get job application by ID
   * GET /api/admin/job-applications/:id
   */
  getJobApplicationById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const jobApplication = await JobApplication.findByPk(id, {
        include: [
          {
            model: Job,
            as: 'job',
            required: false,
            include: [
              {
                model: JobCategory,
                as: 'category',
                required: false
              },
              {
                model: Company,
                as: 'company',
                required: false
              }
            ]
          },
          {
            model: Collaborator,
            as: 'collaborator',
            required: false
          },
          {
            model: CVStorage,
            as: 'cv',
            required: false
          }
        ]
      });

      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn ứng tuyển'
        });
      }

      res.json({
        success: true,
        data: { jobApplication }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new job application
   * POST /api/admin/job-applications
   */
  createJobApplication: async (req, res, next) => {
    try {
      const {
        jobId,
        collaboratorId,
        title,
        status = 1,
        cvCode,
        monthlySalary,
        appliedAt,
        interviewDate,
        interviewRound2Date,
        nyushaDate,
        expectedPaymentDate,
        rejectNote
      } = req.body;

      // Validate required fields
      if (!jobId) {
        return res.status(400).json({
          success: false,
          message: 'ID việc làm là bắt buộc'
        });
      }

      // Validate job exists
      const job = await Job.findByPk(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Việc làm không tồn tại'
        });
      }

      // Validate collaborator if provided
      if (collaboratorId) {
        const collaborator = await Collaborator.findByPk(collaboratorId);
        if (!collaborator) {
          return res.status(404).json({
            success: false,
            message: 'CTV không tồn tại'
          });
        }
      }

      // Validate CV if provided (must not be duplicate)
      if (cvCode) {
        const cv = await CVStorage.findOne({ where: { code: cvCode } });
        if (!cv) {
          return res.status(404).json({
            success: false,
            message: 'CV không tồn tại'
          });
        }
        
        // Check if CV is duplicate
        if (cv.isDuplicate) {
          return res.status(400).json({
            success: false,
            message: 'CV này bị trùng với CV đã tồn tại, không thể dùng để tạo đơn ứng tuyển'
          });
        }
      }

      const jobApplication = await JobApplication.create({
        jobId,
        collaboratorId: collaboratorId || null,
        title,
        status,
        cvCode: cvCode || null,
        monthlySalary,
        appliedAt: appliedAt || new Date(),
        interviewDate,
        interviewRound2Date,
        nyushaDate,
        expectedPaymentDate,
        rejectNote
      });

      // Reload with relations
      await jobApplication.reload({
        include: [
          {
            model: Job,
            as: 'job',
            required: false
          },
          {
            model: Collaborator,
            as: 'collaborator',
            required: false
          },
          {
            model: CVStorage,
            as: 'cv',
            required: false
          }
        ]
      });

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'JobApplication',
        action: 'create',
        ip: req.ip || req.connection.remoteAddress,
        after: jobApplication.toJSON(),
        description: `Tạo mới đơn ứng tuyển: Job #${jobId}`
      });

      res.status(201).json({
        success: true,
        message: 'Tạo đơn ứng tuyển thành công',
        data: { jobApplication }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update job application
   * PUT /api/admin/job-applications/:id
   */
  updateJobApplication: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const jobApplication = await JobApplication.findByPk(id);
      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn ứng tuyển'
        });
      }

      const oldData = jobApplication.toJSON();

      // Validate job if being changed
      if (updateData.jobId && updateData.jobId !== jobApplication.jobId) {
        const job = await Job.findByPk(updateData.jobId);
        if (!job) {
          return res.status(404).json({
            success: false,
            message: 'Việc làm không tồn tại'
          });
        }
      }

      // Validate collaborator if being changed
      if (updateData.collaboratorId !== undefined) {
        if (updateData.collaboratorId && updateData.collaboratorId !== jobApplication.collaboratorId) {
          const collaborator = await Collaborator.findByPk(updateData.collaboratorId);
          if (!collaborator) {
            return res.status(404).json({
              success: false,
              message: 'CTV không tồn tại'
            });
          }
        }
      }

      // Validate CV if being changed (must not be duplicate)
      if (updateData.cvCode !== undefined && updateData.cvCode !== jobApplication.cvCode) {
        if (updateData.cvCode) {
          const cv = await CVStorage.findOne({ where: { code: updateData.cvCode } });
          if (!cv) {
            return res.status(404).json({
              success: false,
              message: 'CV không tồn tại'
            });
          }
          
          // Check if CV is duplicate
          if (cv.isDuplicate) {
            return res.status(400).json({
              success: false,
              message: 'CV này bị trùng với CV đã tồn tại, không thể dùng để tạo đơn ứng tuyển'
            });
          }
        }
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          jobApplication[key] = updateData[key];
        }
      });

      await jobApplication.save();

      // Nếu monthlySalary được cập nhật, tính lại amount của payment_request
      if (updateData.monthlySalary !== undefined && updateData.monthlySalary !== oldData.monthlySalary) {
        try {
          const paymentRequest = await PaymentRequest.findOne({
            where: {
              jobApplicationId: jobApplication.id,
              status: 0 // Chỉ cập nhật nếu status = 0 (Chờ duyệt)
            }
          });

          if (paymentRequest) {
            const newCommissionAmount = await calculateCommission({
              jobId: jobApplication.jobId,
              jobApplicationId: jobApplication.id,
              monthlySalary: updateData.monthlySalary || jobApplication.monthlySalary,
              collaboratorId: jobApplication.collaboratorId,
              cvCode: jobApplication.cvCode
            });

            paymentRequest.amount = newCommissionAmount;
            await paymentRequest.save();
          }
        } catch (commissionError) {
          console.error('Error updating payment request amount:', commissionError);
          // Không throw error, chỉ log
        }
      }

      // Reload with relations
      await jobApplication.reload({
        include: [
          {
            model: Job,
            as: 'job',
            required: false
          },
          {
            model: Collaborator,
            as: 'collaborator',
            required: false
          },
          {
            model: CVStorage,
            as: 'cv',
            required: false
          }
        ]
      });

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'JobApplication',
        action: 'edit',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        after: jobApplication.toJSON(),
        description: `Cập nhật đơn ứng tuyển #${id}`
      });

      res.json({
        success: true,
        message: 'Cập nhật đơn ứng tuyển thành công',
        data: { jobApplication }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update job application status
   * PATCH /api/admin/job-applications/:id/status
   */
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, rejectNote } = req.body;

      if (status === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái là bắt buộc'
        });
      }

      const jobApplication = await JobApplication.findByPk(id);
      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn ứng tuyển'
        });
      }

      const oldData = jobApplication.toJSON();

      jobApplication.status = parseInt(status);
      if (rejectNote !== undefined) {
        jobApplication.rejectNote = rejectNote;
      }

      await jobApplication.save();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'JobApplication',
        action: 'update_status',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        after: jobApplication.toJSON(),
        description: `Cập nhật trạng thái đơn ứng tuyển #${id}: ${status}`
      });

      res.json({
        success: true,
        message: 'Cập nhật trạng thái đơn ứng tuyển thành công',
        data: { jobApplication }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete job application (soft delete)
   * DELETE /api/admin/job-applications/:id
   */
  deleteJobApplication: async (req, res, next) => {
    try {
      const { id } = req.params;

      const jobApplication = await JobApplication.findByPk(id);
      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn ứng tuyển'
        });
      }

      const oldData = jobApplication.toJSON();

      // Soft delete
      await jobApplication.destroy();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'JobApplication',
        action: 'delete',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        description: `Xóa đơn ứng tuyển #${id}`
      });

      res.json({
        success: true,
        message: 'Xóa đơn ứng tuyển thành công'
      });
    } catch (error) {
      next(error);
    }
  }
};

