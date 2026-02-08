import {
  JobApplication,
  Job,
  JobCategory,
  Company,
  Collaborator,
  CVStorage,
  ActionLog,
  PaymentRequest,
  Admin,
  CollaboratorAssignment
} from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import { calculateCommission } from '../../utils/commissionCalculator.js';
import { statusMessageService } from '../../services/statusMessageService.js';

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
 * Kiểm tra xem AdminBackOffice có quyền cập nhật job application của CTV này không
 * @param {Object} admin - Admin object
 * @param {Object} jobApplication - JobApplication object
 * @returns {Promise<boolean>} - true nếu có quyền, false nếu không
 */
const checkAdminBackOfficePermission = async (admin, jobApplication) => {
  // SuperAdmin (role = 1) có quyền tất cả
  if (admin.role === 1) {
    return true;
  }

  // AdminBackOffice (role = 2) chỉ có quyền với CTV được phân công
  if (admin.role === 2) {
    // Nếu job application không có collaboratorId, không cho phép
    if (!jobApplication.collaboratorId) {
      return false;
    }

    // Kiểm tra xem CTV có được phân công cho admin này không
    const assignment = await CollaboratorAssignment.findOne({
      where: {
        collaboratorId: jobApplication.collaboratorId,
        adminId: admin.id,
        status: 1 // Active assignment
      }
    });

    return assignment !== null;
  }

  // Các role khác không có quyền
  return false;
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
          model: Admin,
          as: 'admin',
          required: false,
          attributes: ['id', 'name', 'email']
        },
        {
          model: Admin,
          as: 'adminResponsible',
          required: false,
          attributes: ['id', 'name', 'email']
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
            model: Admin,
            as: 'admin',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: Admin,
            as: 'adminResponsible',
            required: false,
            attributes: ['id', 'name', 'email']
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

      // Logic phân biệt adminId và adminResponsibleId:
      // - adminId: ID của admin tạo đơn (tương ứng với CTV thuộc admin đó) - chỉ set khi CTV tự tạo đơn và admin quản lý CTV đó
      // - adminResponsibleId: ID của admin phụ trách (khi admin tạo đơn từ trang admin, có thể có hoặc không có collaboratorId)
      // 
      // Khi AdminBackOffice tạo đơn từ trang AddNominationPage (/api/admin/job-applications):
      // - Luôn set adminResponsibleId = req.admin.id (admin phụ trách tạo đơn)
      // - adminId = null (không phải admin tạo đơn cho CTV của mình)
      // - collaboratorId có thể có hoặc không (tùy vào việc có chọn CTV hay không)
      const adminIdValue = null; // Admin tạo đơn từ trang admin không set adminId
      const adminResponsibleIdValue = req.admin?.id || null; // Luôn set admin phụ trách

      const jobApplication = await JobApplication.create({
        jobId,
        collaboratorId: collaboratorId || null,
        adminId: adminIdValue,
        adminResponsibleId: adminResponsibleIdValue,
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
            model: Admin,
            as: 'admin',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: Admin,
            as: 'adminResponsible',
            required: false,
            attributes: ['id', 'name', 'email']
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

      // Kiểm tra quyền AdminBackOffice
      const hasPermission = await checkAdminBackOfficePermission(req.admin, jobApplication);
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền cập nhật đơn ứng tuyển này. Chỉ có thể cập nhật đơn của CTV được phân công cho bạn.'
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

      // Update fields - loại bỏ monthlySalary, chỉ cho phép yearlySalary
      Object.keys(updateData).forEach(key => {
        // Loại bỏ monthlySalary khỏi update
        if (key === 'monthlySalary' || key === 'monthly_salary') {
          return;
        }
        if (updateData[key] !== undefined) {
          jobApplication[key] = updateData[key];
        }
      });
      
      // Đảm bảo yearlySalary được cập nhật nếu có trong updateData
      if (updateData.yearlySalary !== undefined) {
        // Parse thành number nếu là string
        const yearlySalaryValue = typeof updateData.yearlySalary === 'string' 
          ? parseFloat(updateData.yearlySalary) 
          : updateData.yearlySalary;
        jobApplication.yearlySalary = yearlySalaryValue;
        console.log(`[Update Job Application] Cập nhật yearlySalary: ${yearlySalaryValue} (từ ${updateData.yearlySalary})`);
      }

      await jobApplication.save();
      
      // Check if status is nyusha (8) and has yearlySalary - create payment request immediately
      const isNyusha = jobApplication.status === 8;
      const hasYearlySalary = jobApplication.yearlySalary && jobApplication.yearlySalary > 0;
      const hasCollaborator = jobApplication.collaboratorId;
      
      console.log(`[Payment Request] Kiểm tra điều kiện tạo payment request cho job application #${jobApplication.id}:`, {
        isNyusha,
        hasYearlySalary,
        yearlySalary: jobApplication.yearlySalary,
        hasCollaborator,
        collaboratorId: jobApplication.collaboratorId
      });

      // Tự động tạo payment request ngay khi status = nyusha (8) và có yearlySalary và có collaborator
      if (isNyusha && hasYearlySalary && hasCollaborator) {
        try {
          // Kiểm tra xem đã có payment request chưa
          let paymentRequest = await PaymentRequest.findOne({
            where: {
              jobApplicationId: jobApplication.id
            }
          });

          if (!paymentRequest) {
            // Tính toán commission amount
            console.log(`[Payment Request] Tính toán commission cho job application #${jobApplication.id}:`, {
              jobId: jobApplication.jobId,
              yearlySalary: jobApplication.yearlySalary,
              collaboratorId: jobApplication.collaboratorId,
              cvCode: jobApplication.cvCode
            });

            const commissionAmount = await calculateCommission({
              jobId: jobApplication.jobId,
              jobApplicationId: jobApplication.id,
              yearlySalary: jobApplication.yearlySalary,
              collaboratorId: jobApplication.collaboratorId,
              cvCode: jobApplication.cvCode
            });

            console.log(`[Payment Request] Commission amount tính được: ${commissionAmount}`);

            // Kiểm tra commission amount hợp lệ
            if (commissionAmount === null || commissionAmount === undefined || isNaN(commissionAmount)) {
              console.error(`[Payment Request] Commission amount không hợp lệ: ${commissionAmount}`);
              throw new Error(`Không thể tính được số tiền hoa hồng. Commission amount: ${commissionAmount}`);
            }

            // Tạo payment request mới
            paymentRequest = await PaymentRequest.create({
              collaboratorId: jobApplication.collaboratorId,
              jobApplicationId: jobApplication.id,
              amount: parseFloat(commissionAmount),
              status: 0 // Chờ duyệt
            });

            console.log(`[Payment Request] Tự động tạo payment request #${paymentRequest.id} cho job application #${jobApplication.id} với amount: ${paymentRequest.amount} (ngay khi nyusha)`);
          } else if (paymentRequest.status === 0) {
            // Nếu payment request đã tồn tại và đang chờ duyệt, cập nhật amount nếu yearlySalary thay đổi
            if (updateData.yearlySalary !== undefined && updateData.yearlySalary !== oldData.yearlySalary) {
              console.log(`[Payment Request] Cập nhật amount cho payment request #${paymentRequest.id}`);
              const newCommissionAmount = await calculateCommission({
                jobId: jobApplication.jobId,
                jobApplicationId: jobApplication.id,
                yearlySalary: jobApplication.yearlySalary,
                collaboratorId: jobApplication.collaboratorId,
                cvCode: jobApplication.cvCode
              });

              console.log(`[Payment Request] New commission amount: ${newCommissionAmount}`);
              
              if (newCommissionAmount !== null && newCommissionAmount !== undefined && !isNaN(newCommissionAmount)) {
                paymentRequest.amount = parseFloat(newCommissionAmount);
                await paymentRequest.save();
                console.log(`[Payment Request] Đã cập nhật amount: ${paymentRequest.amount}`);
              } else {
                console.error(`[Payment Request] Commission amount không hợp lệ: ${newCommissionAmount}`);
              }
            }
          }
        } catch (paymentError) {
          console.error('[Payment Request] Error creating/updating payment request:', paymentError);
          console.error('[Payment Request] Error stack:', paymentError.stack);
          // Không throw error, chỉ log để không ảnh hưởng đến việc update job application
        }
      } else if (updateData.yearlySalary !== undefined && updateData.yearlySalary !== oldData.yearlySalary) {
        // Nếu chỉ cập nhật yearlySalary (không phải nyusha), cập nhật amount của payment_request nếu có
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
              yearlySalary: jobApplication.yearlySalary,
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
            model: Admin,
            as: 'admin',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: Admin,
            as: 'adminResponsible',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: CVStorage,
            as: 'cv',
            required: false
          }
        ]
      });

      const newData = jobApplication.toJSON();

      // Tự động tạo tin nhắn nếu có thay đổi status
      if (updateData.status !== undefined && oldData.status !== parseInt(updateData.status)) {
        try {
          await statusMessageService.createStatusMessage({
            jobApplicationId: id,
            oldStatus: oldData.status,
            newStatus: parseInt(updateData.status),
            adminId: req.admin.id,
            note: updateData.rejectNote || null
          });
        } catch (messageError) {
          console.error('[Job Application] Error creating status message:', messageError);
        }
      } else if (updateData.status === undefined) {
        // Nếu không thay đổi status, kiểm tra các thay đổi khác
        try {
          await statusMessageService.createUpdateMessage({
            jobApplicationId: id,
            oldData,
            newData,
            adminId: req.admin.id
          });
        } catch (messageError) {
          console.error('[Job Application] Error creating update message:', messageError);
        }
      }

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

      // Kiểm tra quyền AdminBackOffice
      const hasPermission = await checkAdminBackOfficePermission(req.admin, jobApplication);
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền cập nhật trạng thái đơn ứng tuyển này. Chỉ có thể cập nhật đơn của CTV được phân công cho bạn.'
        });
      }

      const oldData = jobApplication.toJSON();
      const oldStatus = jobApplication.status;

      jobApplication.status = parseInt(status);
      if (rejectNote !== undefined) {
        jobApplication.rejectNote = rejectNote;
      }

      await jobApplication.save();

      // Cập nhật CV status/phase dựa trên job application status
      if (jobApplication.cvCode) {
        try {
          const cv = await CVStorage.findOne({
            where: { code: jobApplication.cvCode }
          });

          if (cv) {
            // Map job application status sang CV phase/status
            // Status mapping:
            // 1: Admin đang xử lý hồ sơ -> CV status giữ nguyên
            // 2: Đang tiến cử -> CV status = 1 (active)
            // 3-7: Các giai đoạn -> CV status = 1 (active)
            // 8: Đã nyusha -> CV status = 1 (active)
            // 9-11: Thanh toán -> CV status = 1 (active)
            // 12, 15, 16, 17: Từ chối/Hủy -> CV status có thể giữ nguyên hoặc = 2 (archived)
            
            let newCVStatus = cv.status; // Giữ nguyên mặc định
            
            if (jobApplication.status >= 2 && jobApplication.status <= 11) {
              // Các status tích cực -> active
              newCVStatus = 1;
            } else if (jobApplication.status === 12 || jobApplication.status === 15 || 
                       jobApplication.status === 16 || jobApplication.status === 17) {
              // Từ chối/Hủy -> có thể archive hoặc giữ nguyên
              // Tạm thời giữ nguyên, có thể thay đổi logic sau
              newCVStatus = cv.status;
            }

            if (cv.status !== newCVStatus) {
              cv.status = newCVStatus;
              await cv.save();
              console.log(`[Job Application] Đã cập nhật CV status: ${cv.code} -> ${newCVStatus}`);
            }
          }
        } catch (cvError) {
          console.error('[Job Application] Error updating CV status:', cvError);
          // Không throw error, chỉ log
        }
      }

      // Tự động tạo payment request ngay khi status = nyusha (8)
      const isNyusha = jobApplication.status === 8;
      const hasYearlySalary = jobApplication.yearlySalary && jobApplication.yearlySalary > 0;
      const hasCollaborator = jobApplication.collaboratorId;

      if (isNyusha && hasYearlySalary && hasCollaborator) {
        try {
          // Kiểm tra xem đã có payment request chưa
          let paymentRequest = await PaymentRequest.findOne({
            where: {
              jobApplicationId: jobApplication.id
            }
          });

          if (!paymentRequest) {
            // Tính toán commission amount
            console.log(`[Payment Request] Tính toán commission cho job application #${jobApplication.id} (updateStatus):`, {
              jobId: jobApplication.jobId,
              yearlySalary: jobApplication.yearlySalary,
              collaboratorId: jobApplication.collaboratorId,
              cvCode: jobApplication.cvCode
            });

            const commissionAmount = await calculateCommission({
              jobId: jobApplication.jobId,
              jobApplicationId: jobApplication.id,
              yearlySalary: jobApplication.yearlySalary,
              collaboratorId: jobApplication.collaboratorId,
              cvCode: jobApplication.cvCode
            });

            console.log(`[Payment Request] Commission amount tính được (updateStatus): ${commissionAmount}`);

            // Kiểm tra commission amount hợp lệ
            if (commissionAmount === null || commissionAmount === undefined || isNaN(commissionAmount)) {
              console.error(`[Payment Request] Commission amount không hợp lệ (updateStatus): ${commissionAmount}`);
              throw new Error(`Không thể tính được số tiền hoa hồng. Commission amount: ${commissionAmount}`);
            }

            // Tạo payment request mới
            paymentRequest = await PaymentRequest.create({
              collaboratorId: jobApplication.collaboratorId,
              jobApplicationId: jobApplication.id,
              amount: parseFloat(commissionAmount),
              status: 0 // Chờ duyệt
            });

            console.log(`[Payment Request] Tự động tạo payment request #${paymentRequest.id} cho job application #${jobApplication.id} khi cập nhật status với amount: ${paymentRequest.amount} (ngay khi nyusha)`);
          }
        } catch (paymentError) {
          console.error('[Payment Request] Error creating payment request (updateStatus):', paymentError);
          console.error('[Payment Request] Error stack (updateStatus):', paymentError.stack);
          // Không throw error, chỉ log để không ảnh hưởng đến việc update status
        }
      }

      // Tự động tạo tin nhắn trạng thái nếu có thay đổi
      if (oldStatus !== parseInt(status)) {
        try {
          await statusMessageService.createStatusMessage({
            jobApplicationId: id,
            oldStatus,
            newStatus: parseInt(status),
            adminId: req.admin.id,
            note: rejectNote || null
          });
        } catch (messageError) {
          console.error('[Job Application] Error creating status message:', messageError);
          // Không throw error để không ảnh hưởng đến việc update status
        }
      }

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

