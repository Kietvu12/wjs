import { FavoriteJob, Job, JobCategory, Company } from '../../models/index.js';
import { Op } from 'sequelize';

// Helper function to map model field names to database column names
const mapOrderField = (fieldName) => {
  const fieldMap = {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  };
  return fieldMap[fieldName] || fieldName;
};

/**
 * Favorite Job Management Controller (CTV)
 */
export const favoriteJobController = {
  /**
   * Get list of favorite jobs
   * GET /api/ctv/favorite-jobs
   */
  getFavoriteJobs: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Validate sortBy
      const allowedSortFields = ['id', 'createdAt', 'updatedAt'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'DESC']);
      }

      const { count, rows } = await FavoriteJob.findAndCountAll({
        where: {
          collaboratorId: req.collaborator.id
        },
        include: [
          {
            model: Job,
            as: 'job',
            required: true,
            where: {
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
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      // Transform data
      const favoriteJobs = rows.map(fav => {
        const favData = fav.toJSON();
        favData.job.isFavorite = true;
        return favData;
      });

      res.json({
        success: true,
        data: {
          favoriteJobs,
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
   * Add job to favorites
   * POST /api/ctv/favorite-jobs
   */
  addFavoriteJob: async (req, res, next) => {
    try {
      const { jobId } = req.body;

      if (!jobId) {
        return res.status(400).json({
          success: false,
          message: 'ID việc làm là bắt buộc'
        });
      }

      // Validate job exists and is published
      const job = await Job.findByPk(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Việc làm không tồn tại'
        });
      }

      if (job.status !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Không thể lưu việc làm chưa được công bố'
        });
      }

      // Check if already favorited
      const existing = await FavoriteJob.findOne({
        where: {
          collaboratorId: req.collaborator.id,
          jobId: jobId
        }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Việc làm đã có trong danh sách yêu thích'
        });
      }

      // Create favorite
      const favorite = await FavoriteJob.create({
        collaboratorId: req.collaborator.id,
        jobId: jobId
      });

      // Reload with relations
      await favorite.reload({
        include: [
          {
            model: Job,
            as: 'job',
            required: true,
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
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Đã thêm vào danh sách yêu thích',
        data: { favoriteJob: favorite }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove job from favorites
   * DELETE /api/ctv/favorite-jobs/:jobId
   */
  removeFavoriteJob: async (req, res, next) => {
    try {
      const { jobId } = req.params;

      const favorite = await FavoriteJob.findOne({
        where: {
          collaboratorId: req.collaborator.id,
          jobId: parseInt(jobId)
        }
      });

      if (!favorite) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy trong danh sách yêu thích'
        });
      }

      await favorite.destroy();

      res.json({
        success: true,
        message: 'Đã xóa khỏi danh sách yêu thích'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check if job is favorited
   * GET /api/ctv/favorite-jobs/check/:jobId
   */
  checkFavoriteJob: async (req, res, next) => {
    try {
      const { jobId } = req.params;

      const favorite = await FavoriteJob.findOne({
        where: {
          collaboratorId: req.collaborator.id,
          jobId: parseInt(jobId)
        }
      });

      res.json({
        success: true,
        data: {
          isFavorite: !!favorite
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

