import {
  Job,
  JobCategory,
  Company,
  WorkingLocation,
  WorkingLocationDetail,
  SalaryRange,
  SalaryRangeDetail,
  OvertimeAllowance,
  OvertimeAllowanceDetail,
  Requirement,
  SmokingPolicy,
  SmokingPolicyDetail,
  WorkingHour,
  WorkingHourDetail,
  JobPickup,
  JobPickupId,
  Type,
  Value,
  JobValue,
  JobApplication,
  JobCampaign,
  Campaign,
  ActionLog
} from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Helper function to map model field names to database column names
const mapOrderField = (fieldName) => {
  const fieldMap = {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'deadline': 'deadline'
  };
  return fieldMap[fieldName] || fieldName;
};

/**
 * Job Management Controller (Admin)
 */
export const jobController = {
  /**
   * Get list of jobs
   * GET /api/admin/jobs
   */
  getJobs: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        jobCategoryId,
        companyId,
        isPinned,
        isHot,
        deadlineFrom,
        deadlineTo,
        sortBy = 'id',
        sortOrder = 'ASC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      // Search by title, job_code, or slug
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { jobCode: { [Op.like]: `%${search}%` } },
          { slug: { [Op.like]: `%${search}%` } }
        ];
      }

      // Filter by status
      if (status !== undefined) {
        where.status = parseInt(status);
      }

      // Filter by category
      if (jobCategoryId) {
        where.jobCategoryId = parseInt(jobCategoryId);
      }

      // Filter by company
      if (companyId) {
        where.companyId = parseInt(companyId);
      }

      // Filter by isPinned
      if (isPinned !== undefined) {
        where.isPinned = isPinned === 'true' || isPinned === '1' || isPinned === 1;
      }

      // Filter by isHot
      if (isHot !== undefined) {
        where.isHot = isHot === 'true' || isHot === '1' || isHot === 1;
      }

      // Filter by deadline
      if (deadlineFrom || deadlineTo) {
        where.deadline = {};
        if (deadlineFrom) {
          where.deadline[Op.gte] = deadlineFrom;
        }
        if (deadlineTo) {
          where.deadline[Op.lte] = deadlineTo;
        }
      }

      // Validate sortBy
      const allowedSortFields = ['id', 'title', 'jobCode', 'createdAt', 'updatedAt', 'deadline', 'viewsCount'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'ASC']);
      }

      const { count, rows } = await Job.findAndCountAll({
        where,
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
            attributes: ['id', 'name', 'companyCode', 'logo']
          },
          {
            model: JobValue,
            as: 'jobValues',
            required: false,
            include: [
              {
                model: Type,
                as: 'type',
                required: false,
                attributes: ['id', 'typename']
              },
              {
                model: Value,
                as: 'valueRef',
                required: false,
                attributes: ['id', 'valuename']
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      // Get applications count for each job
      const jobIds = rows.map(j => j.id);
      if (jobIds.length > 0) {
        const applicationsCounts = await sequelize.query(
          `SELECT job_id, COUNT(*) as count 
           FROM job_applications 
           WHERE job_id IN (${jobIds.join(',')})
           AND deleted_at IS NULL
           GROUP BY job_id`,
          { type: sequelize.QueryTypes.SELECT }
        );

        const countMap = {};
        applicationsCounts.forEach(item => {
          countMap[item.job_id] = parseInt(item.count);
        });

        rows.forEach(job => {
          job.dataValues.applicationsCount = countMap[job.id] || 0;
        });
      } else {
        rows.forEach(job => {
          job.dataValues.applicationsCount = 0;
        });
      }

      res.json({
        success: true,
        data: {
          jobs: rows,
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
   * Get job by ID
   * GET /api/admin/jobs/:id
   */
  getJobById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const job = await Job.findByPk(id, {
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
          },
          {
            model: WorkingLocation,
            as: 'workingLocations',
            required: false
          },
          {
            model: WorkingLocationDetail,
            as: 'workingLocationDetails',
            required: false
          },
          {
            model: SalaryRange,
            as: 'salaryRanges',
            required: false
          },
          {
            model: SalaryRangeDetail,
            as: 'salaryRangeDetails',
            required: false
          },
          {
            model: OvertimeAllowance,
            as: 'overtimeAllowances',
            required: false
          },
          {
            model: OvertimeAllowanceDetail,
            as: 'overtimeAllowanceDetails',
            required: false
          },
          {
            model: Requirement,
            as: 'requirements',
            required: false
          },
          {
            model: SmokingPolicy,
            as: 'smokingPolicies',
            required: false
          },
          {
            model: SmokingPolicyDetail,
            as: 'smokingPolicyDetails',
            required: false
          },
          {
            model: WorkingHour,
            as: 'workingHours',
            required: false
          },
          {
            model: WorkingHourDetail,
            as: 'workingHourDetails',
            required: false
          },
          {
            model: JobValue,
            as: 'jobValues',
            required: false,
            include: [
              {
                model: Type,
                as: 'type',
                required: false
              },
              {
                model: Value,
                as: 'valueRef',
                required: false
              }
            ]
          },
          {
            model: JobPickupId,
            as: 'jobPickupIds',
            required: false,
            include: [
              {
                model: JobPickup,
                as: 'pickup',
                required: false
              }
            ]
          },
          {
            model: JobCampaign,
            as: 'jobCampaigns',
            required: false,
            include: [
              {
                model: Campaign,
                as: 'campaign',
                required: false,
                attributes: ['id', 'name', 'status']
              }
            ]
          },
          {
            model: JobApplication,
            as: 'applications',
            required: false,
            attributes: ['id', 'status', 'appliedAt'],
            limit: 10
          }
        ]
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy việc làm'
        });
      }

      res.json({
        success: true,
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new job
   * POST /api/admin/jobs
   */
  createJob: async (req, res, next) => {
    try {
      const {
        jobCode,
        jobCategoryId,
        title,
        slug,
        description,
        instruction,
        interviewLocation,
        bonus,
        salaryReview,
        holidays,
        socialInsurance,
        transportation,
        breakTime,
        overtime,
        recruitmentType,
        contractPeriod,
        companyId,
        recruitmentProcess,
        deadline,
        status = 1,
        isPinned = false,
        isHot = false,
        jobCommissionType = 'fixed',
        requiredCvForm,
        requiredCvFormOriginalFilename,
        // Related data
        workingLocations = [],
        workingLocationDetails = [],
        salaryRanges = [],
        salaryRangeDetails = [],
        overtimeAllowances = [],
        overtimeAllowanceDetails = [],
        requirements = [],
        smokingPolicies = [],
        smokingPolicyDetails = [],
        workingHours = [],
        workingHourDetails = [],
        jobValues = [],
        jobPickupIds = [],
        campaignIds = []
      } = req.body;

      // Validate required fields
      if (!jobCode || !jobCategoryId || !title || !slug) {
        return res.status(400).json({
          success: false,
          message: 'Mã việc làm, danh mục, tiêu đề và slug là bắt buộc'
        });
      }

      // Check if job_code already exists
      const existingJob = await Job.findOne({ where: { jobCode } });
      if (existingJob) {
        return res.status(409).json({
          success: false,
          message: 'Mã việc làm đã tồn tại'
        });
      }

      // Check if slug already exists
      const existingSlug = await Job.findOne({ where: { slug } });
      if (existingSlug) {
        return res.status(409).json({
          success: false,
          message: 'Slug đã tồn tại'
        });
      }

      // Validate category
      const category = await JobCategory.findByPk(jobCategoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Danh mục việc làm không tồn tại'
        });
      }

      // Validate company if provided
      if (companyId) {
        const company = await Company.findByPk(companyId);
        if (!company) {
          return res.status(404).json({
            success: false,
            message: 'Công ty không tồn tại'
          });
        }
      }

      // Use transaction for all related data
      const transaction = await sequelize.transaction();

      try {
        // Create job
        const job = await Job.create({
          jobCode,
          jobCategoryId,
          title,
          slug,
          description,
          instruction,
          interviewLocation,
          bonus,
          salaryReview,
          holidays,
          socialInsurance,
          transportation,
          breakTime,
          overtime,
          recruitmentType,
          contractPeriod,
          companyId: companyId || null,
          recruitmentProcess,
          deadline,
          status,
          isPinned,
          isHot,
          jobCommissionType,
          requiredCvForm,
          requiredCvFormOriginalFilename
        }, { transaction });

        // Create working locations
        if (workingLocations.length > 0) {
          await WorkingLocation.bulkCreate(
            workingLocations.map(loc => ({
              jobId: job.id,
              location: loc.location,
              country: loc.country
            })),
            { transaction }
          );
        }

        // Create working location details
        if (workingLocationDetails.length > 0) {
          await WorkingLocationDetail.bulkCreate(
            workingLocationDetails.map(detail => ({
              jobId: job.id,
              content: detail.content || detail
            })),
            { transaction }
          );
        }

        // Create salary ranges
        if (salaryRanges.length > 0) {
          await SalaryRange.bulkCreate(
            salaryRanges.map(range => ({
              jobId: job.id,
              salaryRange: range.salaryRange,
              type: range.type
            })),
            { transaction }
          );
        }

        // Create salary range details
        if (salaryRangeDetails.length > 0) {
          await SalaryRangeDetail.bulkCreate(
            salaryRangeDetails.map(detail => ({
              jobId: job.id,
              content: detail.content || detail
            })),
            { transaction }
          );
        }

        // Create overtime allowances
        if (overtimeAllowances.length > 0) {
          await OvertimeAllowance.bulkCreate(
            overtimeAllowances.map(allowance => ({
              jobId: job.id,
              overtimeAllowanceRange: allowance.overtimeAllowanceRange || allowance.range
            })),
            { transaction }
          );
        }

        // Create overtime allowance details
        if (overtimeAllowanceDetails.length > 0) {
          await OvertimeAllowanceDetail.bulkCreate(
            overtimeAllowanceDetails.map(detail => ({
              jobId: job.id,
              content: detail.content || detail
            })),
            { transaction }
          );
        }

        // Create requirements
        if (requirements.length > 0) {
          await Requirement.bulkCreate(
            requirements.map(req => ({
              jobId: job.id,
              content: req.content,
              type: req.type,
              status: req.status
            })),
            { transaction }
          );
        }

        // Create smoking policies
        if (smokingPolicies.length > 0) {
          await SmokingPolicy.bulkCreate(
            smokingPolicies.map(policy => ({
              jobId: job.id,
              allow: policy.allow
            })),
            { transaction }
          );
        }

        // Create smoking policy details
        if (smokingPolicyDetails.length > 0) {
          await SmokingPolicyDetail.bulkCreate(
            smokingPolicyDetails.map(detail => ({
              jobId: job.id,
              content: detail.content || detail
            })),
            { transaction }
          );
        }

        // Create working hours
        if (workingHours.length > 0) {
          await WorkingHour.bulkCreate(
            workingHours.map(wh => ({
              jobId: job.id,
              workingHours: wh.workingHours || wh.hours
            })),
            { transaction }
          );
        }

        // Create working hour details
        if (workingHourDetails.length > 0) {
          await WorkingHourDetail.bulkCreate(
            workingHourDetails.map(detail => ({
              jobId: job.id,
              content: detail.content || detail
            })),
            { transaction }
          );
        }

        // Create job values
        if (jobValues.length > 0) {
          // Validate jobValues: nếu có type là Commission, value phải phù hợp với jobCommissionType
          for (const jv of jobValues) {
            // Kiểm tra nếu có type Commission (cần kiểm tra Type với typename = 'Commission')
            // Note: Cần validate typeId có phải là Commission type không
            // Tạm thời chỉ validate format của value
            if (jv.value) {
              // Nếu jobCommissionType là 'fixed', value phải là số (số tiền)
              // Nếu jobCommissionType là 'percent', value phải là số (phần trăm)
              const valueNum = parseFloat(jv.value);
              if (isNaN(valueNum) || valueNum < 0) {
                await transaction.rollback();
                return res.status(400).json({
                  success: false,
                  message: `Giá trị hoa hồng không hợp lệ. Phải là số dương.`
                });
              }
            }
          }

          await JobValue.bulkCreate(
            jobValues.map(jv => ({
              jobId: job.id,
              typeId: jv.typeId,
              valueId: jv.valueId,
              value: jv.value,
              isRequired: jv.isRequired || false
            })),
            { transaction }
          );
        }

        // Create job pickup ids
        if (jobPickupIds.length > 0) {
          await JobPickupId.bulkCreate(
            jobPickupIds.map(pickup => ({
              jobId: job.id,
              jobPickupId: pickup.jobPickupId || pickup.pickupId
            })),
            { transaction }
          );
        }

        // Create job-campaign associations if campaignIds provided
        if (campaignIds && campaignIds.length > 0) {
          // Validate that all campaignIds exist
          const campaigns = await Campaign.findAll({
            where: { id: { [Op.in]: campaignIds } },
            transaction
          });

          if (campaigns.length !== campaignIds.length) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message: 'Một số chiến dịch không tồn tại'
            });
          }

          // Create JobCampaign records
          await JobCampaign.bulkCreate(
            campaignIds.map(campaignId => ({
              campaignId: parseInt(campaignId),
              jobId: job.id
            })),
            { transaction }
          );
        }

        await transaction.commit();

        // Reload with all relations
        await job.reload({
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
            },
            {
              model: WorkingLocation,
              as: 'workingLocations',
              required: false
            },
            {
              model: SalaryRange,
              as: 'salaryRanges',
              required: false
            },
            {
              model: Requirement,
              as: 'requirements',
              required: false
            }
          ]
        });

        // Log action
        await ActionLog.create({
          adminId: req.admin.id,
          object: 'Job',
          action: 'create',
          ip: req.ip || req.connection.remoteAddress,
          after: job.toJSON(),
          description: `Tạo mới việc làm: ${job.title} (${job.jobCode})`
        });

        res.status(201).json({
          success: true,
          message: 'Tạo việc làm thành công',
          data: { job }
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update job
   * PUT /api/admin/jobs/:id
   */
  updateJob: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const job = await Job.findByPk(id);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy việc làm'
        });
      }

      // Store old data for log
      const oldData = job.toJSON();

      // Extract related data from updateData
      const {
        workingLocations,
        workingLocationDetails,
        salaryRanges,
        salaryRangeDetails,
        overtimeAllowances,
        overtimeAllowanceDetails,
        requirements,
        smokingPolicies,
        smokingPolicyDetails,
        workingHours,
        workingHourDetails,
        jobValues,
        jobPickupIds,
        campaignIds,
        ...jobFields
      } = updateData;

      // Use transaction
      const transaction = await sequelize.transaction();

      try {
        // Update basic job fields
        if (jobFields.jobCode !== undefined) {
          // Check if job_code is already taken by another job
          const existingJob = await Job.findOne({
            where: { jobCode: jobFields.jobCode, id: { [Op.ne]: id } }
          });
          if (existingJob) {
            await transaction.rollback();
            return res.status(409).json({
              success: false,
              message: 'Mã việc làm đã tồn tại'
            });
          }
        }

        if (jobFields.slug !== undefined) {
          // Check if slug is already taken by another job
          const existingSlug = await Job.findOne({
            where: { slug: jobFields.slug, id: { [Op.ne]: id } }
          });
          if (existingSlug) {
            await transaction.rollback();
            return res.status(409).json({
              success: false,
              message: 'Slug đã tồn tại'
            });
          }
        }

        // Update job fields
        Object.keys(jobFields).forEach(key => {
          if (jobFields[key] !== undefined) {
            job[key] = jobFields[key];
          }
        });

        await job.save({ transaction });

        // Update related data if provided
        if (workingLocations !== undefined) {
          await WorkingLocation.destroy({ where: { jobId: job.id }, transaction });
          if (workingLocations.length > 0) {
            await WorkingLocation.bulkCreate(
              workingLocations.map(loc => ({
                jobId: job.id,
                location: loc.location,
                country: loc.country
              })),
              { transaction }
            );
          }
        }

        if (workingLocationDetails !== undefined) {
          await WorkingLocationDetail.destroy({ where: { jobId: job.id }, transaction });
          if (workingLocationDetails.length > 0) {
            await WorkingLocationDetail.bulkCreate(
              workingLocationDetails.map(detail => ({
                jobId: job.id,
                content: detail.content || detail
              })),
              { transaction }
            );
          }
        }

        if (salaryRanges !== undefined) {
          await SalaryRange.destroy({ where: { jobId: job.id }, transaction });
          if (salaryRanges.length > 0) {
            await SalaryRange.bulkCreate(
              salaryRanges.map(range => ({
                jobId: job.id,
                salaryRange: range.salaryRange,
                type: range.type
              })),
              { transaction }
            );
          }
        }

        if (salaryRangeDetails !== undefined) {
          await SalaryRangeDetail.destroy({ where: { jobId: job.id }, transaction });
          if (salaryRangeDetails.length > 0) {
            await SalaryRangeDetail.bulkCreate(
              salaryRangeDetails.map(detail => ({
                jobId: job.id,
                content: detail.content || detail
              })),
              { transaction }
            );
          }
        }

        if (overtimeAllowances !== undefined) {
          await OvertimeAllowance.destroy({ where: { jobId: job.id }, transaction });
          if (overtimeAllowances.length > 0) {
            await OvertimeAllowance.bulkCreate(
              overtimeAllowances.map(allowance => ({
                jobId: job.id,
                overtimeAllowanceRange: allowance.overtimeAllowanceRange || allowance.range
              })),
              { transaction }
            );
          }
        }

        if (overtimeAllowanceDetails !== undefined) {
          await OvertimeAllowanceDetail.destroy({ where: { jobId: job.id }, transaction });
          if (overtimeAllowanceDetails.length > 0) {
            await OvertimeAllowanceDetail.bulkCreate(
              overtimeAllowanceDetails.map(detail => ({
                jobId: job.id,
                content: detail.content || detail
              })),
              { transaction }
            );
          }
        }

        if (requirements !== undefined) {
          await Requirement.destroy({ where: { jobId: job.id }, transaction });
          if (requirements.length > 0) {
            await Requirement.bulkCreate(
              requirements.map(req => ({
                jobId: job.id,
                content: req.content,
                type: req.type,
                status: req.status
              })),
              { transaction }
            );
          }
        }

        if (smokingPolicies !== undefined) {
          await SmokingPolicy.destroy({ where: { jobId: job.id }, transaction });
          if (smokingPolicies.length > 0) {
            await SmokingPolicy.bulkCreate(
              smokingPolicies.map(policy => ({
                jobId: job.id,
                allow: policy.allow
              })),
              { transaction }
            );
          }
        }

        if (smokingPolicyDetails !== undefined) {
          await SmokingPolicyDetail.destroy({ where: { jobId: job.id }, transaction });
          if (smokingPolicyDetails.length > 0) {
            await SmokingPolicyDetail.bulkCreate(
              smokingPolicyDetails.map(detail => ({
                jobId: job.id,
                content: detail.content || detail
              })),
              { transaction }
            );
          }
        }

        if (workingHours !== undefined) {
          await WorkingHour.destroy({ where: { jobId: job.id }, transaction });
          if (workingHours.length > 0) {
            await WorkingHour.bulkCreate(
              workingHours.map(wh => ({
                jobId: job.id,
                workingHours: wh.workingHours || wh.hours
              })),
              { transaction }
            );
          }
        }

        if (workingHourDetails !== undefined) {
          await WorkingHourDetail.destroy({ where: { jobId: job.id }, transaction });
          if (workingHourDetails.length > 0) {
            await WorkingHourDetail.bulkCreate(
              workingHourDetails.map(detail => ({
                jobId: job.id,
                content: detail.content || detail
              })),
              { transaction }
            );
          }
        }

        if (jobValues !== undefined) {
          await JobValue.destroy({ where: { jobId: job.id }, transaction });
          if (jobValues.length > 0) {
            await JobValue.bulkCreate(
              jobValues.map(jv => ({
                jobId: job.id,
                typeId: jv.typeId,
                valueId: jv.valueId,
                value: jv.value,
                isRequired: jv.isRequired || false
              })),
              { transaction }
            );
          }
        }

        if (jobPickupIds !== undefined) {
          await JobPickupId.destroy({ where: { jobId: job.id }, transaction });
          if (jobPickupIds.length > 0) {
            await JobPickupId.bulkCreate(
              jobPickupIds.map(pickup => ({
                jobId: job.id,
                jobPickupId: pickup.jobPickupId || pickup.pickupId
              })),
              { transaction }
            );
          }
        }

        // Update job-campaign associations if campaignIds provided
        if (campaignIds !== undefined) {
          // Delete existing associations
          await JobCampaign.destroy({
            where: { jobId: job.id },
            transaction
          });
          // Create new associations if campaignIds provided
          if (campaignIds.length > 0) {
          // Validate that all campaignIds exist
          const campaigns = await Campaign.findAll({
            where: { id: { [Op.in]: campaignIds } },
            transaction
          });

            if (campaigns.length !== campaignIds.length) {
              await transaction.rollback();
              return res.status(400).json({
                success: false,
                message: 'Một số chiến dịch không tồn tại'
              });
            }

            // Create JobCampaign records
            await JobCampaign.bulkCreate(
              campaignIds.map(campaignId => ({
                campaignId: parseInt(campaignId),
                jobId: job.id
              })),
              { transaction }
            );
          }
        }

        await transaction.commit();

        // Reload with all relations
        await job.reload({
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
            },
            {
              model: WorkingLocation,
              as: 'workingLocations',
              required: false
            },
            {
              model: SalaryRange,
              as: 'salaryRanges',
              required: false
            },
            {
              model: Requirement,
              as: 'requirements',
              required: false
            }
          ]
        });

        // Log action
        await ActionLog.create({
          adminId: req.admin.id,
          object: 'Job',
          action: 'edit',
          ip: req.ip || req.connection.remoteAddress,
          before: oldData,
          after: job.toJSON(),
          description: `Cập nhật việc làm: ${job.title} (${job.jobCode})`
        });

        res.json({
          success: true,
          message: 'Cập nhật việc làm thành công',
          data: { job }
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete job (soft delete)
   * DELETE /api/admin/jobs/:id
   */
  deleteJob: async (req, res, next) => {
    try {
      const { id } = req.params;

      const job = await Job.findByPk(id, {
        include: [
          {
            model: JobApplication,
            as: 'applications',
            required: false
          }
        ]
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy việc làm'
        });
      }

      // Check if job has applications
      if (job.applications && job.applications.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa việc làm có ứng viên đã ứng tuyển. Vui lòng đóng việc làm trước.'
        });
      }

      // Store old data for log
      const oldData = job.toJSON();

      // Soft delete
      await job.destroy();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'Job',
        action: 'delete',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        description: `Xóa việc làm: ${job.title} (${job.jobCode})`
      });

      res.json({
        success: true,
        message: 'Xóa việc làm thành công'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle job pinned status
   * PATCH /api/admin/jobs/:id/toggle-pinned
   */
  togglePinned: async (req, res, next) => {
    try {
      const { id } = req.params;

      const job = await Job.findByPk(id);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy việc làm'
        });
      }

      const oldData = job.toJSON();

      job.isPinned = !job.isPinned;
      await job.save();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'Job',
        action: job.isPinned ? 'pin' : 'unpin',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        after: job.toJSON(),
        description: `${job.isPinned ? 'Ghim' : 'Bỏ ghim'} việc làm: ${job.title} (${job.jobCode})`
      });

      res.json({
        success: true,
        message: `${job.isPinned ? 'Ghim' : 'Bỏ ghim'} việc làm thành công`,
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle job hot status
   * PATCH /api/admin/jobs/:id/toggle-hot
   */
  toggleHot: async (req, res, next) => {
    try {
      const { id } = req.params;

      const job = await Job.findByPk(id);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy việc làm'
        });
      }

      const oldData = job.toJSON();

      job.isHot = !job.isHot;
      await job.save();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'Job',
        action: job.isHot ? 'set_hot' : 'unset_hot',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        after: job.toJSON(),
        description: `${job.isHot ? 'Đánh dấu' : 'Bỏ đánh dấu'} việc làm hot: ${job.title} (${job.jobCode})`
      });

      res.json({
        success: true,
        message: `${job.isHot ? 'Đánh dấu' : 'Bỏ đánh dấu'} việc làm hot thành công`,
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update job status
   * PATCH /api/admin/jobs/:id/status
   */
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (status === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái là bắt buộc'
        });
      }

      const job = await Job.findByPk(id);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy việc làm'
        });
      }

      const oldData = job.toJSON();

      job.status = parseInt(status);
      await job.save();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'Job',
        action: 'update_status',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        after: job.toJSON(),
        description: `Cập nhật trạng thái việc làm: ${job.title} (${job.jobCode}) - Status: ${status}`
      });

      res.json({
        success: true,
        message: 'Cập nhật trạng thái việc làm thành công',
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  }
};

