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
        yearlySalary,
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
        yearlySalary,
        appliedAt: appliedAt || new Date(),
        interviewDate,
        interviewRound2Date,
        nyushaDate,
        expectedPaymentDate
      });

      // Payment request sẽ được tạo tự động sau 3 tháng từ ngày nyusha (xem logic trong updateJobApplication)

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
        'yearlySalary',
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

      // Update allowed fields only - loại bỏ monthlySalary
      Object.keys(updateData).forEach(key => {
        // Loại bỏ monthlySalary khỏi update
        if (key === 'monthlySalary' || key === 'monthly_salary') {
          return;
        }
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          jobApplication[key] = updateData[key];
        }
      });
      
      // Đảm bảo yearlySalary được cập nhật nếu có trong updateData
      if (updateData.yearlySalary !== undefined && allowedFields.includes('yearlySalary')) {
        // Parse thành number nếu là string
        const yearlySalaryValue = typeof updateData.yearlySalary === 'string' 
          ? parseFloat(updateData.yearlySalary) 
          : updateData.yearlySalary;
        jobApplication.yearlySalary = yearlySalaryValue;
        console.log(`[Update Job Application] Cập nhật yearlySalary (CTV): ${yearlySalaryValue} (từ ${updateData.yearlySalary})`);
      }

      await jobApplication.save();
      
      // Reload để đảm bảo giá trị đã được cập nhật
      await jobApplication.reload();

      // Tự động tạo payment request ngay khi status = nyusha (8) và có yearlySalary và có collaborator
      const isNyusha = jobApplication.status === 8;
      const hasYearlySalary = jobApplication.yearlySalary && jobApplication.yearlySalary > 0;
      const hasCollaborator = jobApplication.collaboratorId;
      
      console.log(`[Payment Request] Kiểm tra điều kiện tạo payment request cho job application #${jobApplication.id} (CTV):`, {
        isNyusha,
        hasYearlySalary,
        yearlySalary: jobApplication.yearlySalary,
        hasCollaborator,
        collaboratorId: jobApplication.collaboratorId
      });

      if (isNyusha && hasYearlySalary && hasCollaborator) {
        try {
          // Kiểm tra xem đã có payment request chưa
          let paymentRequest = await PaymentRequest.findOne({
            where: {
              jobApplicationId: jobApplication.id,
              collaboratorId: req.collaborator.id
            }
          });

          if (!paymentRequest) {
            // Tính toán commission amount
            console.log(`[Payment Request] Tính toán commission cho job application #${jobApplication.id} (CTV):`, {
              jobId: jobApplication.jobId,
              yearlySalary: jobApplication.yearlySalary,
              collaboratorId: jobApplication.collaboratorId,
              cvCode: jobApplication.cvCode
            });

            const commissionAmount = await calculateCommission({
              jobId: jobApplication.jobId,
              jobApplicationId: jobApplication.id,
              yearlySalary: jobApplication.yearlySalary,
              collaboratorId: req.collaborator.id,
              cvCode: jobApplication.cvCode
            });

            console.log(`[Payment Request] Commission amount tính được (CTV): ${commissionAmount}`);

            // Kiểm tra commission amount hợp lệ
            if (commissionAmount !== null && commissionAmount !== undefined && !isNaN(commissionAmount)) {
              // Tạo payment request mới
              paymentRequest = await PaymentRequest.create({
                collaboratorId: req.collaborator.id,
                jobApplicationId: jobApplication.id,
                amount: parseFloat(commissionAmount),
                status: 0 // Chờ duyệt
              });

              console.log(`[Payment Request] Tự động tạo payment request #${paymentRequest.id} cho job application #${jobApplication.id} với amount: ${paymentRequest.amount} (ngay khi nyusha - CTV)`);
            } else {
              console.error(`[Payment Request] Commission amount không hợp lệ (CTV): ${commissionAmount}`);
            }
          } else if (paymentRequest.status === 0) {
            // Nếu payment request đã tồn tại và đang chờ duyệt, cập nhật amount nếu yearlySalary thay đổi
            if (updateData.yearlySalary !== undefined && updateData.yearlySalary !== jobApplication.yearlySalary) {
              console.log(`[Payment Request] Cập nhật amount cho payment request #${paymentRequest.id} (CTV)`);
              const newCommissionAmount = await calculateCommission({
                jobId: jobApplication.jobId,
                jobApplicationId: jobApplication.id,
                yearlySalary: jobApplication.yearlySalary,
                collaboratorId: req.collaborator.id,
                cvCode: jobApplication.cvCode
              });

              console.log(`[Payment Request] New commission amount (CTV): ${newCommissionAmount}`);
              
              if (newCommissionAmount !== null && newCommissionAmount !== undefined && !isNaN(newCommissionAmount)) {
                paymentRequest.amount = parseFloat(newCommissionAmount);
                await paymentRequest.save();
                console.log(`[Payment Request] Đã cập nhật amount: ${paymentRequest.amount} (CTV)`);
              } else {
                console.error(`[Payment Request] Commission amount không hợp lệ (CTV): ${newCommissionAmount}`);
              }
            }
          }
        } catch (paymentError) {
          console.error('[Payment Request] Error creating/updating payment request (CTV):', paymentError);
          // Không throw error, chỉ log để không ảnh hưởng đến việc update job application
        }
      } else if (updateData.yearlySalary !== undefined && updateData.yearlySalary !== jobApplication.yearlySalary) {
        // Nếu chỉ cập nhật yearlySalary (không phải nyusha), cập nhật amount của payment_request nếu có
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
              yearlySalary: jobApplication.yearlySalary,
              collaboratorId: req.collaborator.id,
              cvCode: jobApplication.cvCode
            });

            if (newCommissionAmount !== null && newCommissionAmount !== undefined && !isNaN(newCommissionAmount)) {
              paymentRequest.amount = parseFloat(newCommissionAmount);
              await paymentRequest.save();
            }
          }
        } catch (commissionError) {
          console.error('Error updating payment request amount (CTV):', commissionError);
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

