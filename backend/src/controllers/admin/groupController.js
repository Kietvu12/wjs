import { Group, Admin, ActionLog } from '../../models/index.js';
import { Op } from 'sequelize';

// Helper function to map model field names to database column names
const mapOrderField = (fieldName) => {
  const fieldMap = {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'approvedAt': 'approved_at'
  };
  return fieldMap[fieldName] || fieldName;
};

/**
 * Group Management Controller
 */
export const groupController = {
  /**
   * Get list of groups
   * GET /api/admin/groups
   */
  getGroups: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      // Search by name or code
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } },
          { referralCode: { [Op.like]: `%${search}%` } }
        ];
      }

      // Filter by status
      if (status !== undefined) {
        where.status = parseInt(status);
      }

      const { count, rows } = await Group.findAndCountAll({
        where,
        include: [{
          model: Admin,
          as: 'admins',
          required: false,
          attributes: ['id', 'name', 'email']
        }],
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          groups: rows,
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
   * Get group by ID
   * GET /api/admin/groups/:id
   */
  getGroupById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const group = await Group.findByPk(id, {
        include: [{
          model: Admin,
          as: 'admins',
          required: false,
          attributes: ['id', 'name', 'email', 'role', 'isActive', 'status']
        }]
      });

      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhóm quyền'
        });
      }

      res.json({
        success: true,
        data: { group }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new group
   * POST /api/admin/groups
   */
  createGroup: async (req, res, next) => {
    try {
      const {
        name,
        code,
        referralCode,
        description,
        status = 1
      } = req.body;

      // Validate required fields
      if (!name || !code || !referralCode) {
        return res.status(400).json({
          success: false,
          message: 'Tên, mã nhóm và mã giới thiệu là bắt buộc'
        });
      }

      // Check if code already exists
      const existingGroup = await Group.findOne({ where: { code } });
      if (existingGroup) {
        return res.status(409).json({
          success: false,
          message: 'Mã nhóm đã tồn tại'
        });
      }

      // Check if referralCode already exists
      const existingReferralCode = await Group.findOne({ where: { referralCode } });
      if (existingReferralCode) {
        return res.status(409).json({
          success: false,
          message: 'Mã giới thiệu đã tồn tại'
        });
      }

      // Create group
      const group = await Group.create({
        name,
        code,
        referralCode,
        description,
        status
      });

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'Group',
        action: 'create',
        ip: req.ip || req.connection.remoteAddress,
        after: group.toJSON(),
        description: `Tạo mới nhóm quyền: ${group.name} (${group.code})`
      });

      res.status(201).json({
        success: true,
        message: 'Tạo nhóm quyền thành công',
        data: { group }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update group
   * PUT /api/admin/groups/:id
   */
  updateGroup: async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        name,
        code,
        referralCode,
        description,
        status
      } = req.body;

      const group = await Group.findByPk(id);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhóm quyền'
        });
      }

      // Store old data for log
      const oldData = group.toJSON();

      // Update fields
      if (name !== undefined) group.name = name;
      if (code !== undefined) {
        // Check if code is already taken by another group
        const existingGroup = await Group.findOne({
          where: { code, id: { [Op.ne]: id } }
        });
        if (existingGroup) {
          return res.status(409).json({
            success: false,
            message: 'Mã nhóm đã tồn tại'
          });
        }
        group.code = code;
      }
      if (referralCode !== undefined) {
        // Check if referralCode is already taken by another group
        const existingReferralCode = await Group.findOne({
          where: { referralCode, id: { [Op.ne]: id } }
        });
        if (existingReferralCode) {
          return res.status(409).json({
            success: false,
            message: 'Mã giới thiệu đã tồn tại'
          });
        }
        group.referralCode = referralCode;
      }
      if (description !== undefined) group.description = description;
      if (status !== undefined) group.status = status;

      await group.save();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'Group',
        action: 'edit',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        after: group.toJSON(),
        description: `Cập nhật nhóm quyền: ${group.name} (${group.code})`
      });

      res.json({
        success: true,
        message: 'Cập nhật nhóm quyền thành công',
        data: { group }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete group (soft delete)
   * DELETE /api/admin/groups/:id
   */
  deleteGroup: async (req, res, next) => {
    try {
      const { id } = req.params;

      const group = await Group.findByPk(id, {
        include: [{
          model: Admin,
          as: 'admins',
          required: false
        }]
      });

      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhóm quyền'
        });
      }

      // Check if group has admins
      if (group.admins && group.admins.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa nhóm quyền đang có admin. Vui lòng chuyển admin sang nhóm khác trước.'
        });
      }

      // Store old data for log
      const oldData = group.toJSON();

      // Soft delete
      await group.destroy();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'Group',
        action: 'delete',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        description: `Xóa nhóm quyền: ${group.name} (${group.code})`
      });

      res.json({
        success: true,
        message: 'Xóa nhóm quyền thành công'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all groups (for dropdown/select)
   * GET /api/admin/groups/all
   */
  getAllGroups: async (req, res, next) => {
    try {
      const groups = await Group.findAll({
        where: {
          status: 1
          // deletedAt không cần thêm vì model đã có paranoid: true, Sequelize tự động filter
        },
        attributes: ['id', 'name', 'code', 'referralCode'],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: { groups }
      });
    } catch (error) {
      next(error);
    }
  }
};

