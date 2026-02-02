import {
  Job,
  JobCategory,
  Company,
  JobValue,
  Type,
  Value,
  FavoriteJob,
  SearchHistory,
  JobCampaign,
  JobPickupId,
  Requirement,
  WorkingLocationDetail,
  SalaryRange,
  SalaryRangeDetail,
  OvertimeAllowanceDetail,
  SmokingPolicy,
  SmokingPolicyDetail,
  WorkingHourDetail,
  CompanyBusinessField,
  CompanyOffice,
  Benefit,
  JobRecruitingCompany,
  JobRecruitingCompanyService,
  JobRecruitingCompanyBusinessSector
} from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';

// Helper function to map model field names to database column names
const mapOrderField = (fieldName) => {
  const fieldMap = {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'deadline': 'deadline',
    'viewsCount': 'views_count'
  };
  return fieldMap[fieldName] || fieldName;
};

/**
 * Job Management Controller (CTV)
 * CTV có thể xem danh sách job, lọc, lưu yêu thích và lịch sử tìm kiếm
 */
export const jobController = {
  /**
   * Get list of jobs (with filters)
   * GET /api/ctv/jobs
   */
  getJobs: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status = 1, // Mặc định chỉ lấy job đã published
        jobCategoryId,
        companyId,
        isPinned,
        isHot,
        deadlineFrom,
        deadlineTo,
        minSalary,
        maxSalary,
        workingLocation,
        recruitmentType,
        sortBy = 'id',
        sortOrder = 'DESC',
        saveSearch = false // Có lưu lịch sử tìm kiếm không
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      // Chỉ lấy job đã published (status = 1) hoặc theo filter
      if (status !== undefined) {
        where.status = parseInt(status);
      } else {
        where.status = 1; // Mặc định chỉ lấy job đã published
      }

      // Search by title, job_code, or slug
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { jobCode: { [Op.like]: `%${search}%` } },
          { slug: { [Op.like]: `%${search}%` } }
        ];
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

      // Filter by recruitment type
      if (recruitmentType) {
        where.recruitmentType = parseInt(recruitmentType);
      }

      // Validate sortBy
      const allowedSortFields = ['id', 'title', 'jobCode', 'createdAt', 'updatedAt', 'deadline', 'viewsCount'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'DESC']);
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
            model: JobRecruitingCompany,
            as: 'recruitingCompany',
            required: false,
            include: [
              {
                model: JobRecruitingCompanyService,
                as: 'services',
                required: false,
                attributes: ['id', 'serviceName', 'order'],
                order: [['order', 'ASC']]
              },
              {
                model: JobRecruitingCompanyBusinessSector,
                as: 'businessSectors',
                required: false,
                attributes: ['id', 'sectorName', 'order'],
                order: [['order', 'ASC']]
              }
            ]
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
          },
          {
            model: Requirement,
            as: 'requirements',
            required: false,
            attributes: ['id', 'content', 'type', 'status'],
            where: {
              type: { [Op.in]: ['technique', 'education'] }
            },
            required: false
          },
          {
            model: WorkingLocationDetail,
            as: 'workingLocationDetails',
            required: false,
            attributes: ['id', 'content']
          },
          {
            model: SalaryRange,
            as: 'salaryRanges',
            required: false,
            attributes: ['id', 'salaryRange', 'type']
          },
          {
            model: SalaryRangeDetail,
            as: 'salaryRangeDetails',
            required: false,
            attributes: ['id', 'content']
          },
          {
            model: JobCampaign,
            as: 'jobCampaigns',
            required: false,
            attributes: ['id', 'campaignId', 'jobId'],
            paranoid: true // Chỉ lấy những record chưa bị soft-delete
          }
        ],
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      // Get favorite status for each job
      const jobIds = rows.map(j => j.id);
      let favoriteMap = {};
      if (jobIds.length > 0) {
        const favorites = await FavoriteJob.findAll({
          where: {
            collaboratorId: req.collaborator.id,
            jobId: { [Op.in]: jobIds }
          },
          attributes: ['jobId']
        });
        favorites.forEach(fav => {
          favoriteMap[fav.jobId] = true;
        });
      }

      // Attach favorite status to each job
      const jobsWithFavorite = rows.map(job => {
        const jobData = job.toJSON();
        jobData.isFavorite = favoriteMap[job.id] || false;
        return jobData;
      });

      // Lưu lịch sử tìm kiếm nếu có từ khóa hoặc filter
      if (saveSearch === 'true' || saveSearch === '1') {
        const filters = {
          search,
          status,
          jobCategoryId,
          companyId,
          isPinned,
          isHot,
          deadlineFrom,
          deadlineTo,
          minSalary,
          maxSalary,
          workingLocation,
          recruitmentType,
          sortBy,
          sortOrder
        };

        // Chỉ lưu nếu có từ khóa hoặc có filter
        if (search || Object.keys(filters).some(key => filters[key] !== undefined && key !== 'search')) {
          await SearchHistory.create({
            collaboratorId: req.collaborator.id,
            keyword: search || null,
            filters: filters,
            resultCount: count
          });
        }
      }

      res.json({
        success: true,
        data: {
          jobs: jobsWithFavorite,
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
   * GET /api/ctv/jobs/:id
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
            required: false,
            include: [
              {
                model: CompanyBusinessField,
                as: 'businessFields',
                required: false,
                attributes: ['id', 'content']
              },
              {
                model: CompanyOffice,
                as: 'offices',
                required: false,
                attributes: ['id', 'address', 'isHeadOffice']
              }
            ]
          },
          {
            model: JobRecruitingCompany,
            as: 'recruitingCompany',
            required: false,
            include: [
              {
                model: JobRecruitingCompanyService,
                as: 'services',
                required: false,
                order: [['order', 'ASC']]
              },
              {
                model: JobRecruitingCompanyBusinessSector,
                as: 'businessSectors',
                required: false,
                order: [['order', 'ASC']]
              }
            ]
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
          },
          {
            model: JobCampaign,
            as: 'jobCampaigns',
            required: false,
            attributes: ['id', 'campaignId', 'jobId'],
            paranoid: true
          },
          {
            model: Requirement,
            as: 'requirements',
            required: false,
            attributes: ['id', 'content', 'type', 'status']
          },
          {
            model: WorkingLocationDetail,
            as: 'workingLocationDetails',
            required: false,
            attributes: ['id', 'content']
          },
          {
            model: SalaryRange,
            as: 'salaryRanges',
            required: false,
            attributes: ['id', 'salaryRange', 'type']
          },
          {
            model: SalaryRangeDetail,
            as: 'salaryRangeDetails',
            required: false,
            attributes: ['id', 'content']
          },
          {
            model: OvertimeAllowanceDetail,
            as: 'overtimeAllowanceDetails',
            required: false,
            attributes: ['id', 'content']
          },
          {
            model: SmokingPolicyDetail,
            as: 'smokingPolicyDetails',
            required: false,
            attributes: ['id', 'content']
          },
          {
            model: WorkingHourDetail,
            as: 'workingHourDetails',
            required: false,
            attributes: ['id', 'content']
          },
          {
            model: Benefit,
            as: 'benefits',
            required: false,
            attributes: ['id', 'content']
          },
          {
            model: SmokingPolicy,
            as: 'smokingPolicies',
            required: false,
            attributes: ['id', 'allow']
          }
        ]
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy việc làm'
        });
      }

      // Check if job is published
      if (job.status !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Việc làm này chưa được công bố'
        });
      }

      // Check favorite status
      const favorite = await FavoriteJob.findOne({
        where: {
          collaboratorId: req.collaborator.id,
          jobId: job.id
        }
      });

      const jobData = job.toJSON();
      jobData.isFavorite = !!favorite;

      // Tăng views count
      await job.increment('viewsCount');

      res.json({
        success: true,
        data: { job: jobData }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get jobs by campaign ID
   * GET /api/ctv/jobs/by-campaign/:campaignId
   */
  getJobsByCampaign: async (req, res, next) => {
    try {
      const { campaignId } = req.params;
      const {
        page = 1,
        limit = 10,
        sortBy = 'id',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Lấy job IDs từ job_campaigns (chỉ lấy những job chưa bị xóa)
      const jobCampaigns = await JobCampaign.findAll({
        where: {
          campaignId: parseInt(campaignId)
        },
        attributes: ['jobId'],
        paranoid: true // Chỉ lấy những record chưa bị soft-delete
      });

      const jobIds = jobCampaigns.map(jc => jc.jobId);
      
      // Debug: Log số lượng jobs trong campaign
      console.log(`[GetJobsByCampaign] Campaign ID: ${campaignId}, Job IDs found: ${jobIds.length}`, jobIds);

      if (jobIds.length === 0) {
        return res.json({
          success: true,
          data: {
            jobs: [],
            pagination: {
              total: 0,
              page: parseInt(page),
              limit: parseInt(limit),
              totalPages: 0
            }
          }
        });
      }

      // Validate sortBy
      const allowedSortFields = ['id', 'createdAt', 'updatedAt', 'deadline', 'viewsCount', 'title'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'DESC']);
      }

      const { count, rows } = await Job.findAndCountAll({
        where: {
          id: { [Op.in]: jobIds },
          status: 1 // Chỉ lấy job đã published
        },
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
            model: JobRecruitingCompany,
            as: 'recruitingCompany',
            required: false,
            include: [
              {
                model: JobRecruitingCompanyService,
                as: 'services',
                required: false,
                attributes: ['id', 'serviceName', 'order'],
                order: [['order', 'ASC']]
              },
              {
                model: JobRecruitingCompanyBusinessSector,
                as: 'businessSectors',
                required: false,
                attributes: ['id', 'sectorName', 'order'],
                order: [['order', 'ASC']]
              }
            ]
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
          },
          {
            model: Requirement,
            as: 'requirements',
            required: false,
            attributes: ['id', 'content', 'type', 'status'],
            where: {
              type: { [Op.in]: ['technique', 'education'] }
            },
            required: false
          },
          {
            model: WorkingLocationDetail,
            as: 'workingLocationDetails',
            required: false,
            attributes: ['id', 'content']
          },
          {
            model: SalaryRangeDetail,
            as: 'salaryRangeDetails',
            required: false,
            attributes: ['id', 'content']
          }
        ],
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      // Check favorite status for each job
      const collaboratorId = req.collaborator.id;
      const favoriteJobs = await FavoriteJob.findAll({
        where: {
          collaboratorId,
          jobId: { [Op.in]: rows.map(job => job.id) }
        }
      });

      const favoriteJobIds = new Set(favoriteJobs.map(f => f.jobId));

      const jobsWithFavorite = rows.map(job => {
        const jobData = job.toJSON();
        jobData.isFavorite = favoriteJobIds.has(job.id);
        return jobData;
      });

      // Debug: Log số lượng jobs trả về
      console.log(`[GetJobsByCampaign] Campaign ID: ${campaignId}, Jobs returned: ${jobsWithFavorite.length}, Total: ${count}`);

      res.json({
        success: true,
        data: {
          jobs: jobsWithFavorite,
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
   * Get jobs by job pickup ID
   * GET /api/ctv/jobs/by-job-pickup/:jobPickupId
   */
  getJobsByJobPickup: async (req, res, next) => {
    try {
      const { jobPickupId } = req.params;
      const {
        page = 1,
        limit = 10,
        sortBy = 'id',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Lấy job IDs từ job_pickups_id (chỉ lấy những job chưa bị xóa)
      const jobPickupIds = await JobPickupId.findAll({
        where: {
          jobPickupId: parseInt(jobPickupId)
        },
        attributes: ['jobId'],
        paranoid: true // Chỉ lấy những record chưa bị soft-delete
      });

      const jobIds = jobPickupIds.map(jpi => jpi.jobId);
      
      // Debug: Log số lượng jobs trong job pickup
      console.log(`[GetJobsByJobPickup] Job Pickup ID: ${jobPickupId}, Job IDs found: ${jobIds.length}`, jobIds);

      if (jobIds.length === 0) {
        return res.json({
          success: true,
          data: {
            jobs: [],
            pagination: {
              total: 0,
              page: parseInt(page),
              limit: parseInt(limit),
              totalPages: 0
            }
          }
        });
      }

      // Validate sortBy
      const allowedSortFields = ['id', 'createdAt', 'updatedAt', 'deadline', 'viewsCount', 'title'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'DESC']);
      }

      const { count, rows } = await Job.findAndCountAll({
        where: {
          id: { [Op.in]: jobIds },
          status: 1 // Chỉ lấy job đã published
        },
        paranoid: true, // Chỉ lấy jobs chưa bị soft-delete
        include: [
          {
            model: JobCategory,
            as: 'category',
            attributes: ['id', 'name', 'slug'],
            required: false
          },
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name', 'logo'],
            required: false
          },
          {
            model: JobRecruitingCompany,
            as: 'recruitingCompany',
            required: false,
            include: [
              {
                model: JobRecruitingCompanyService,
                as: 'services',
                required: false,
                attributes: ['id', 'serviceName', 'order'],
                order: [['order', 'ASC']]
              },
              {
                model: JobRecruitingCompanyBusinessSector,
                as: 'businessSectors',
                required: false,
                attributes: ['id', 'sectorName', 'order'],
                order: [['order', 'ASC']]
              }
            ]
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
          },
          {
            model: Requirement,
            as: 'requirements',
            required: false,
            attributes: ['id', 'content', 'type', 'status'],
            where: {
              type: { [Op.in]: ['technique', 'education'] }
            },
            required: false
          },
          {
            model: WorkingLocationDetail,
            as: 'workingLocationDetails',
            required: false,
            attributes: ['id', 'content']
          },
          {
            model: SalaryRange,
            as: 'salaryRanges',
            required: false,
            attributes: ['id', 'salaryRange', 'type']
          },
          {
            model: SalaryRangeDetail,
            as: 'salaryRangeDetails',
            required: false,
            attributes: ['id', 'content']
          },
          {
            model: JobCampaign,
            as: 'jobCampaigns',
            required: false,
            attributes: ['id', 'campaignId', 'jobId'],
            paranoid: true // Chỉ lấy những record chưa bị soft-delete
          }
        ],
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      // Check favorite status for each job
      const collaboratorId = req.collaborator.id;
      const favoriteJobs = await FavoriteJob.findAll({
        where: {
          collaboratorId,
          jobId: { [Op.in]: rows.map(job => job.id) }
        },
        attributes: ['jobId']
      });

      const favoriteJobIds = new Set(favoriteJobs.map(f => f.jobId));

      const jobsWithFavorite = rows.map(job => {
        const jobData = job.toJSON();
        jobData.isFavorite = favoriteJobIds.has(job.id);
        return jobData;
      });

      // Debug: Log số lượng jobs trả về
      console.log(`[GetJobsByJobPickup] Job Pickup ID: ${jobPickupId}, Jobs returned: ${jobsWithFavorite.length}, Total: ${count}`);

      res.json({
        success: true,
        data: {
          jobs: jobsWithFavorite,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('[Backend] Error in getJobsByJobPickup:', error);
      next(error);
    }
  }
};

