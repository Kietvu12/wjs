import { CollaboratorAssignment, Collaborator, Admin, ActionLog, JobApplication, CVStorage } from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';

/**
 * Collaborator Assignment Management Controller (Admin)
 */
export const collaboratorAssignmentController = {
  /**
   * Get list of assignments
   * GET /api/admin/collaborator-assignments
   * Super Admin: xem tất cả
   * AdminBackOffice: chỉ xem của mình
   */
  getAssignments: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        adminId,
        collaboratorId,
        status,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};
      const admin = req.admin;

      // AdminBackOffice chỉ xem assignments của mình
      if (admin.role === 2) {
        where.adminId = admin.id;
      }

      // Super Admin có thể filter theo adminId
      if (admin.role === 1 && adminId) {
        where.adminId = parseInt(adminId);
      }

      // Filter by collaborator
      if (collaboratorId) {
        where.collaboratorId = parseInt(collaboratorId);
      }

      // Filter by status
      if (status !== undefined) {
        where.status = parseInt(status);
      }

      // Search by collaborator name, email, code
      let collaboratorWhere = {};
      if (search) {
        collaboratorWhere[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await CollaboratorAssignment.findAndCountAll({
        where,
        include: [
          {
            model: Collaborator,
            as: 'collaborator',
            required: true,
            where: collaboratorWhere,
            attributes: ['id', 'name', 'email', 'code', 'phone', 'status', 'points']
          },
          {
            model: Admin,
            as: 'admin',
            required: true,
            attributes: ['id', 'name', 'email', 'role']
          },
          {
            model: Admin,
            as: 'assignedByAdmin',
            required: false,
            attributes: ['id', 'name', 'email']
          }
        ],
        limit: parseInt(limit),
        offset,
        order: [[sortBy, sortOrder.toUpperCase()]]
      });

      res.json({
        success: true,
        data: {
          assignments: rows,
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
   * Get unassigned collaborators
   * GET /api/admin/collaborator-assignments/unassigned
   */
  getUnassignedCollaborators: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = { status: 1 }; // Chỉ lấy CTV active

      if (status !== undefined) {
        where.status = parseInt(status);
      }

      // Search by name, email, code
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } }
        ];
      }

      // Lấy danh sách CTV đã được phân công (active)
      const assignedCollaboratorIds = await CollaboratorAssignment.findAll({
        where: { status: 1 },
        attributes: ['collaboratorId'],
        raw: true
      }).then(rows => rows.map(row => row.collaboratorId));

      // Lọc ra CTV chưa được phân công
      if (assignedCollaboratorIds.length > 0) {
        where.id = { [Op.notIn]: assignedCollaboratorIds };
      }

      const { count, rows } = await Collaborator.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          collaborators: rows,
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
   * Get assignment by ID
   * GET /api/admin/collaborator-assignments/:id
   */
  getAssignmentById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const admin = req.admin;

      const assignment = await CollaboratorAssignment.findByPk(id, {
        include: [
          {
            model: Collaborator,
            as: 'collaborator',
            required: true
          },
          {
            model: Admin,
            as: 'admin',
            required: true
          },
          {
            model: Admin,
            as: 'assignedByAdmin',
            required: false
          }
        ]
      });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phân công'
        });
      }

      // AdminBackOffice chỉ xem assignments của mình
      if (admin.role === 2 && assignment.adminId !== admin.id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem phân công này'
        });
      }

      res.json({
        success: true,
        data: { assignment }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create assignment (Super Admin only)
   * POST /api/admin/collaborator-assignments
   */
  createAssignment: async (req, res, next) => {
    try {
      const admin = req.admin;

      // Chỉ Super Admin mới được phân công
      if (admin.role !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Chỉ Super Admin mới được phân công CTV'
        });
      }

      const { collaboratorId, adminId, notes } = req.body;

      // Validate required fields
      if (!collaboratorId || !adminId) {
        return res.status(400).json({
          success: false,
          message: 'Collaborator ID và Admin ID là bắt buộc'
        });
      }

      // Parse to integers
      const parsedCollaboratorId = parseInt(collaboratorId);
      const parsedAdminId = parseInt(adminId);

      if (isNaN(parsedCollaboratorId) || isNaN(parsedAdminId)) {
        return res.status(400).json({
          success: false,
          message: 'Collaborator ID và Admin ID phải là số hợp lệ'
        });
      }

      // Kiểm tra AdminBackOffice có tồn tại và có role = 2
      const assignedAdmin = await Admin.findByPk(parsedAdminId);
      if (!assignedAdmin || assignedAdmin.role !== 2) {
        return res.status(400).json({
          success: false,
          message: 'AdminBackOffice không tồn tại hoặc không hợp lệ'
        });
      }

      // Kiểm tra CTV có tồn tại
      const collaborator = await Collaborator.findByPk(parsedCollaboratorId);
      if (!collaborator) {
        return res.status(404).json({
          success: false,
          message: 'CTV không tồn tại'
        });
      }

      // Kiểm tra CTV đã được phân công chưa (active assignment) cho admin khác
      const existingActiveAssignment = await CollaboratorAssignment.findOne({
        where: {
          collaboratorId: parsedCollaboratorId,
          status: 1
        }
      });

      if (existingActiveAssignment && existingActiveAssignment.adminId !== parsedAdminId) {
        return res.status(409).json({
          success: false,
          message: 'CTV đã được phân công cho AdminBackOffice khác',
          data: { existingAssignment: existingActiveAssignment }
        });
      }

      // Kiểm tra xem có assignment với cùng collaborator_id và admin_id không
      // Nếu có thì update thay vì tạo mới (tránh unique constraint violation)
      const existingAssignment = await CollaboratorAssignment.findOne({
        where: {
          collaboratorId: parsedCollaboratorId,
          adminId: parsedAdminId
        },
        paranoid: false // Include soft deleted records
      });

      let assignment;
      if (existingAssignment) {
        // Update assignment cũ
        await existingAssignment.update({
          assignedBy: admin.id,
          notes: notes || existingAssignment.notes,
          status: 1,
          deletedAt: null
        });
        assignment = existingAssignment;
      } else {
        // Tạo assignment mới
        try {
          assignment = await CollaboratorAssignment.create({
            collaboratorId: parsedCollaboratorId,
            adminId: parsedAdminId,
            assignedBy: admin.id,
            notes: notes || null,
            status: 1
          });
        } catch (createError) {
          // Nếu lỗi unique constraint, thử tìm và update
          if (createError.name === 'SequelizeUniqueConstraintError') {
            const conflictAssignment = await CollaboratorAssignment.findOne({
              where: {
                collaboratorId: parsedCollaboratorId,
                adminId: parsedAdminId
              },
              paranoid: false
            });
            if (conflictAssignment) {
              await conflictAssignment.update({
                assignedBy: admin.id,
                notes: notes || conflictAssignment.notes,
                status: 1,
                deletedAt: null
              });
              assignment = conflictAssignment;
            } else {
              throw createError;
            }
          } else {
            throw createError;
          }
        }
      }

      // Reload with relations
      await assignment.reload({
        include: [
          {
            model: Collaborator,
            as: 'collaborator',
            required: true
          },
          {
            model: Admin,
            as: 'admin',
            required: true
          },
          {
            model: Admin,
            as: 'assignedByAdmin',
            required: false
          }
        ]
      });

      // Log action
      await ActionLog.create({
        adminId: admin.id,
        object: 'CollaboratorAssignment',
        action: 'create',
        description: `Phân công CTV ${collaborator.name} cho AdminBackOffice ${assignedAdmin.name}`,
        before: null,
        after: assignment.toJSON()
      });

      res.status(201).json({
        success: true,
        message: 'Phân công CTV thành công',
        data: { assignment }
      });
    } catch (error) {
      console.error('Error creating collaborator assignment:', error);
      
      // Handle Sequelize validation errors
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(e => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: `Lỗi validation: ${messages}`,
          errors: error.errors
        });
      }
      
      // Handle unique constraint errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          success: false,
          message: 'CTV đã được phân công cho AdminBackOffice này rồi',
          error: error.message
        });
      }
      
      // Handle foreign key constraint errors
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Collaborator hoặc Admin không tồn tại',
          error: error.message
        });
      }
      
      next(error);
    }
  },

  /**
   * Bulk assign collaborators (Super Admin only)
   * POST /api/admin/collaborator-assignments/bulk
   */
  bulkAssign: async (req, res, next) => {
    try {
      const admin = req.admin;

      // Chỉ Super Admin mới được phân công
      if (admin.role !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Chỉ Super Admin mới được phân công CTV'
        });
      }

      const { collaboratorIds, adminId, notes } = req.body;

      // Validate required fields
      if (!collaboratorIds || !Array.isArray(collaboratorIds) || collaboratorIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Danh sách Collaborator IDs là bắt buộc'
        });
      }

      if (!adminId) {
        return res.status(400).json({
          success: false,
          message: 'Admin ID là bắt buộc'
        });
      }

      // Kiểm tra AdminBackOffice có tồn tại và có role = 2
      const assignedAdmin = await Admin.findByPk(adminId);
      if (!assignedAdmin || assignedAdmin.role !== 2) {
        return res.status(400).json({
          success: false,
          message: 'AdminBackOffice không tồn tại hoặc không hợp lệ'
        });
      }

      // Kiểm tra các CTV có tồn tại
      const collaborators = await Collaborator.findAll({
        where: { id: { [Op.in]: collaboratorIds } }
      });

      if (collaborators.length !== collaboratorIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Một số CTV không tồn tại'
        });
      }

      // Kiểm tra CTV đã được phân công chưa
      const existingAssignments = await CollaboratorAssignment.findAll({
        where: {
          collaboratorId: { [Op.in]: collaboratorIds },
          status: 1
        }
      });

      const alreadyAssignedIds = existingAssignments.map(a => a.collaboratorId);
      const newCollaboratorIds = collaboratorIds.filter(id => !alreadyAssignedIds.includes(id));

      if (newCollaboratorIds.length === 0) {
        return res.status(409).json({
          success: false,
          message: 'Tất cả CTV đã được phân công',
          data: { existingAssignments }
        });
      }

      // Tạo assignments
      const assignments = await CollaboratorAssignment.bulkCreate(
        newCollaboratorIds.map(collaboratorId => ({
          collaboratorId,
          adminId,
          assignedBy: admin.id,
          notes,
          status: 1
        }))
      );

      // Log action
      await ActionLog.create({
        adminId: admin.id,
        object: 'CollaboratorAssignment',
        action: 'create',
        description: `Phân công hàng loạt ${newCollaboratorIds.length} CTV cho AdminBackOffice ${assignedAdmin.name}`,
        before: null,
        after: assignments.map(a => a.toJSON())
      });

      res.status(201).json({
        success: true,
        message: `Phân công thành công ${newCollaboratorIds.length} CTV`,
        data: {
          assignments,
          skipped: alreadyAssignedIds.length,
          skippedIds: alreadyAssignedIds
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update assignment (transfer to another AdminBackOffice)
   * PUT /api/admin/collaborator-assignments/:id
   */
  updateAssignment: async (req, res, next) => {
    try {
      const admin = req.admin;
      const { id } = req.params;
      const { adminId, notes } = req.body;

      // Chỉ Super Admin mới được cập nhật
      if (admin.role !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Chỉ Super Admin mới được cập nhật phân công'
        });
      }

      const assignment = await CollaboratorAssignment.findByPk(id);
      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phân công'
        });
      }

      const dataBefore = assignment.toJSON();

      // Nếu có adminId mới, kiểm tra AdminBackOffice có tồn tại
      if (adminId && adminId !== assignment.adminId) {
        const newAdmin = await Admin.findByPk(adminId);
        if (!newAdmin || newAdmin.role !== 2) {
          return res.status(400).json({
            success: false,
            message: 'AdminBackOffice không tồn tại hoặc không hợp lệ'
          });
        }

        assignment.adminId = adminId;
        assignment.assignedBy = admin.id; // Cập nhật người phân công
      }

      if (notes !== undefined) {
        assignment.notes = notes;
      }

      await assignment.save();

      // Reload with relations
      await assignment.reload({
        include: [
          {
            model: Collaborator,
            as: 'collaborator',
            required: true
          },
          {
            model: Admin,
            as: 'admin',
            required: true
          },
          {
            model: Admin,
            as: 'assignedByAdmin',
            required: false
          }
        ]
      });

      // Log action
      await ActionLog.create({
        adminId: admin.id,
        object: 'CollaboratorAssignment',
        action: 'update',
        description: `Cập nhật phân công CTV`,
        before: dataBefore,
        after: assignment.toJSON()
      });

      res.json({
        success: true,
        message: 'Cập nhật phân công thành công',
        data: { assignment }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete assignment (unassign)
   * DELETE /api/admin/collaborator-assignments/:id
   */
  deleteAssignment: async (req, res, next) => {
    try {
      const admin = req.admin;
      const { id } = req.params;

      // Chỉ Super Admin mới được xóa
      if (admin.role !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Chỉ Super Admin mới được hủy phân công'
        });
      }

      const assignment = await CollaboratorAssignment.findByPk(id, {
        include: [
          {
            model: Collaborator,
            as: 'collaborator',
            required: true
          },
          {
            model: Admin,
            as: 'admin',
            required: true
          }
        ]
      });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phân công'
        });
      }

      const dataBefore = assignment.toJSON();

      // Soft delete
      await assignment.destroy();

      // Log action
      await ActionLog.create({
        adminId: admin.id,
        object: 'CollaboratorAssignment',
        action: 'delete',
        description: `Hủy phân công CTV ${assignment.collaborator.name} khỏi AdminBackOffice ${assignment.admin.name}`,
        before: dataBefore,
        after: null
      });

      res.json({
        success: true,
        message: 'Hủy phân công thành công'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get my assigned collaborators (AdminBackOffice)
   * GET /api/admin/collaborator-assignments/my-assigned
   */
  getMyAssignedCollaborators: async (req, res, next) => {
    try {
      const admin = req.admin;
      const {
        page = 1,
        limit = 10,
        search,
        status
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = { adminId: admin.id };

      if (status !== undefined) {
        where.status = parseInt(status);
      }

      // Search by collaborator name, email, code
      let collaboratorWhere = {};
      if (search) {
        collaboratorWhere[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await CollaboratorAssignment.findAndCountAll({
        where,
        include: [
          {
            model: Collaborator,
            as: 'collaborator',
            required: true,
            where: collaboratorWhere
          }
        ],
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          assignments: rows,
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
   * Get assignment history
   * GET /api/admin/collaborator-assignments/history
   */
  getAssignmentHistory: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        collaboratorId,
        adminId,
        assignedBy
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      if (collaboratorId) {
        where.collaboratorId = parseInt(collaboratorId);
      }

      if (adminId) {
        where.adminId = parseInt(adminId);
      }

      if (assignedBy) {
        where.assignedBy = parseInt(assignedBy);
      }

      const { count, rows } = await CollaboratorAssignment.findAndCountAll({
        where,
        include: [
          {
            model: Collaborator,
            as: 'collaborator',
            required: true,
            attributes: ['id', 'name', 'email', 'code']
          },
          {
            model: Admin,
            as: 'admin',
            required: true,
            attributes: ['id', 'name', 'email']
          },
          {
            model: Admin,
            as: 'assignedByAdmin',
            required: true,
            attributes: ['id', 'name', 'email']
          }
        ],
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']],
        paranoid: false // Include deleted records
      });

      res.json({
        success: true,
        data: {
          history: rows,
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
   * Get statistics for assigned collaborators
   * GET /api/admin/collaborator-assignments/statistics
   */
  getStatistics: async (req, res, next) => {
    try {
      const admin = req.admin;
      const { collaboratorId, adminId: queryAdminId } = req.query;

      let where = {};
      if (admin.role === 2) {
        // AdminBackOffice chỉ xem stats của mình
        where.adminId = admin.id;
      } else if (queryAdminId) {
        where.adminId = parseInt(queryAdminId);
      }

      if (collaboratorId) {
        where.collaboratorId = parseInt(collaboratorId);
      }

      where.status = 1; // Chỉ lấy active assignments

      const assignments = await CollaboratorAssignment.findAll({
        where,
        include: [
          {
            model: Collaborator,
            as: 'collaborator',
            required: true
          }
        ]
      });

      const collaboratorIds = assignments.map(a => a.collaboratorId);

      // Thống kê đơn ứng tuyển
      const jobApplications = await JobApplication.findAll({
        where: {
          collaboratorId: { [Op.in]: collaboratorIds }
        },
        attributes: [
          'collaboratorId',
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['collaboratorId', 'status'],
        raw: true
      });

      // Thống kê CV
      const cvs = await CVStorage.findAll({
        where: {
          collaboratorId: { [Op.in]: collaboratorIds }
        },
        attributes: [
          'collaboratorId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['collaboratorId'],
        raw: true
      });

      // Tính tỷ lệ thành công (nyusha + đã thanh toán)
      const successApplications = jobApplications.filter(
        app => app.status === 8 || app.status === 11
      );

      const statistics = assignments.map(assignment => {
        const collaboratorId = assignment.collaboratorId;
        const collaboratorApps = jobApplications.filter(app => app.collaboratorId === collaboratorId);
        const collaboratorCvs = cvs.find(cv => cv.collaboratorId === collaboratorId);
        const collaboratorSuccess = successApplications.filter(app => app.collaboratorId === collaboratorId);

        const totalApplications = collaboratorApps.reduce((sum, app) => sum + parseInt(app.count), 0);
        const successCount = collaboratorSuccess.reduce((sum, app) => sum + parseInt(app.count), 0);
        const successRate = totalApplications > 0 ? (successCount / totalApplications * 100).toFixed(2) : 0;

        return {
          assignmentId: assignment.id,
          collaboratorId,
          collaborator: assignment.collaborator,
          totalJobApplications: totalApplications,
          totalCVs: collaboratorCvs ? parseInt(collaboratorCvs.count) : 0,
          successCount,
          successRate: parseFloat(successRate)
        };
      });

      res.json({
        success: true,
        data: { statistics }
      });
    } catch (error) {
      next(error);
    }
  }
};

