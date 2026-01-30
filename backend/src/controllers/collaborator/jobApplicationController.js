import {
  JobApplication,
  Job,
  JobCategory,
  Company,
  CVStorage,
  PaymentRequest
} from '../../models/index.js';
import { Op } from 'sequelize';
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
 * Job Application Management Controller (CTV)
 * CTV chỉ có thể quản lý đơn ứng tuyển của chính họ
 */
export const jobApplicationController = {
  /**
   * Get list of job applications (only own applications)
   * GET /api/ctv/job-applications
   */
  getJobApplications: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        jobId,
        appliedFrom,
        appliedTo,
        interviewFrom,
        interviewTo,
        nyushaFrom,
        nyushaTo,
        sortBy = 'id',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {
        collaboratorId: req.collaborator.id // Chỉ lấy đơn của CTV này
      };

      // Filter by status
      if (status !== undefined) {
        where.status = parseInt(status);
      }

      // Filter by job
      if (jobId) {
        where.jobId = parseInt(jobId);
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
        orderClause.push(['id', 'DESC']);
      }

      const { count, rows } = await JobApplication.findAndCountAll({
        where,
        include: [
          {
            model: Job,
            as: 'job',
            required: false,
            attributes: ['id', 'jobCode', 'title', 'status'],
            include: [
              {
                model: JobCategory,
                as: 'category',
                required: false,
                attributes: ['id', 'name', 'slug']
              },
              {
                model: Company,
                as: 'company',
                required: false,
                attributes: ['id', 'name', 'companyCode']
              }
            ]
          },
          {
            model: CVStorage,
            as: 'cv',
            required: false,
            attributes: ['id', 'code', 'name', 'email', 'phone']
          }
        ],
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
   * Get job application by ID (only own application)
   * GET /api/ctv/job-applications/:id
   */
  getJobApplicationById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const jobApplication = await JobApplication.findOne({
        where: {
          id,
          collaboratorId: req.collaborator.id
        },
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
            model: CVStorage,
            as: 'cv',
            required: false
          }
        ]
      });

      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn ứng tuyển hoặc bạn không có quyền truy cập'
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
   * POST /api/ctv/job-applications
   */
  createJobApplication: async (req, res, next) => {
    try {
      const {
        jobId,
        title,
        cvCode,
        monthlySalary,
        appliedAt,
        interviewDate,
        interviewRound2Date,
        nyushaDate,
        expectedPaymentDate
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

      // Validate CV if provided (must belong to this collaborator and not duplicate)
      if (cvCode) {
        const cv = await CVStorage.findOne({
          where: {
            code: cvCode,
            collaboratorId: req.collaborator.id
          }
        });
        if (!cv) {
          return res.status(404).json({
            success: false,
            message: 'CV không tồn tại hoặc không thuộc về bạn'
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

      // Create job application
      // Status: 1 = Admin đang xử lý hồ sơ, 2 = Đang tiến cử
      // Khi CTV tạo đơn tiến cử, status nên là 2 (Đang tiến cử)
      const jobApplication = await JobApplication.create({
        jobId,
        collaboratorId: req.collaborator.id,
        title: title || `Ứng tuyển ${job.title}`,
        status: 2, // Đang tiến cử (theo structure.sql: 2. Đang tiến cử)
        cvCode: cvCode || null,
        monthlySalary,
        appliedAt: appliedAt || new Date(),
        interviewDate,
        interviewRound2Date,
        nyushaDate,
        expectedPaymentDate
      });

      // Tự động tạo payment_request khi tạo job_application
      // Chỉ tạo nếu có monthlySalary và collaboratorId
      if (monthlySalary && req.collaborator.id) {
        try {
          const commissionAmount = await calculateCommission({
            jobId,
            jobApplicationId: jobApplication.id,
            monthlySalary,
            collaboratorId: req.collaborator.id,
            cvCode: cvCode || null
          });

          // Tạo payment_request với status = 0 (Chờ duyệt)
          await PaymentRequest.create({
            collaboratorId: req.collaborator.id,
            jobApplicationId: jobApplication.id,
            amount: commissionAmount,
            status: 0 // Chờ duyệt
          });
        } catch (commissionError) {
          console.error('Error creating payment request:', commissionError);
          // Không throw error, chỉ log để không ảnh hưởng đến việc tạo job_application
        }
      }

      // Reload with relations
      await jobApplication.reload({
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
            model: CVStorage,
            as: 'cv',
            required: false
          }
        ]
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
   * Update job application (only own application, limited fields)
   * PUT /api/ctv/job-applications/:id
   */
  updateJobApplication: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if job application exists and belongs to this collaborator
      const jobApplication = await JobApplication.findOne({
        where: {
          id,
          collaboratorId: req.collaborator.id
        }
      });

      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn ứng tuyển hoặc bạn không có quyền chỉnh sửa'
        });
      }

      // CTV chỉ có thể cập nhật một số trường nhất định
      // Không thể thay đổi status (admin mới có quyền)
      const allowedFields = [
        'title',
        'cvCode',
        'monthlySalary',
        'appliedAt',
        'interviewDate',
        'interviewRound2Date',
        'nyushaDate',
        'expectedPaymentDate'
      ];

      // Validate CV if being changed (must not be duplicate)
      if (updateData.cvCode && updateData.cvCode !== jobApplication.cvCode) {
        const cv = await CVStorage.findOne({
          where: {
            code: updateData.cvCode,
            collaboratorId: req.collaborator.id
          }
        });
        if (!cv) {
          return res.status(404).json({
            success: false,
            message: 'CV không tồn tại hoặc không thuộc về bạn'
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

      // Update allowed fields only
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          jobApplication[key] = updateData[key];
        }
      });

      await jobApplication.save();

      // Nếu monthlySalary được cập nhật, tính lại amount của payment_request
      if (updateData.monthlySalary !== undefined && updateData.monthlySalary !== jobApplication.monthlySalary) {
        try {
          const paymentRequest = await PaymentRequest.findOne({
            where: {
              jobApplicationId: jobApplication.id,
              collaboratorId: req.collaborator.id,
              status: 0 // Chỉ cập nhật nếu status = 0 (Chờ duyệt)
            }
          });

          if (paymentRequest) {
            const newCommissionAmount = await calculateCommission({
              jobId: jobApplication.jobId,
              jobApplicationId: jobApplication.id,
              monthlySalary: updateData.monthlySalary || jobApplication.monthlySalary,
              collaboratorId: req.collaborator.id,
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
            model: CVStorage,
            as: 'cv',
            required: false
          }
        ]
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
   * Delete job application (only own application, soft delete)
   * DELETE /api/ctv/job-applications/:id
   */
  deleteJobApplication: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if job application exists and belongs to this collaborator
      const jobApplication = await JobApplication.findOne({
        where: {
          id,
          collaboratorId: req.collaborator.id
        }
      });

      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn ứng tuyển hoặc bạn không có quyền xóa'
        });
      }

      // Check if application status allows deletion
      // Không cho phép xóa nếu đã ở trạng thái quan trọng (đã nyusha, đã thanh toán, etc.)
      const restrictedStatuses = [8, 11]; // 8: Đã nyusha, 11: Đã thanh toán
      if (restrictedStatuses.includes(jobApplication.status)) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa đơn ứng tuyển ở trạng thái này. Vui lòng liên hệ admin.'
        });
      }

      // Soft delete
      await jobApplication.destroy();

      res.json({
        success: true,
        message: 'Xóa đơn ứng tuyển thành công'
      });
    } catch (error) {
      next(error);
    }
  }
};

