import express from 'express';
import { groupController } from '../controllers/admin/groupController.js';
import { authenticate, isSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/admin/groups
 * @desc    Lấy danh sách nhóm quyền
 * @access  Private (Super Admin only)
 */
router.get('/', authenticate, isSuperAdmin, groupController.getGroups);

/**
 * @route   GET /api/admin/groups/all
 * @desc    Lấy tất cả nhóm quyền (cho dropdown)
 * @access  Private (Super Admin only)
 */
router.get('/all', authenticate, isSuperAdmin, groupController.getAllGroups);

/**
 * @route   GET /api/admin/groups/:id
 * @desc    Lấy thông tin nhóm quyền theo ID
 * @access  Private (Super Admin only)
 */
router.get('/:id', authenticate, isSuperAdmin, groupController.getGroupById);

/**
 * @route   POST /api/admin/groups
 * @desc    Tạo nhóm quyền mới
 * @access  Private (Super Admin only)
 */
router.post('/', authenticate, isSuperAdmin, groupController.createGroup);

/**
 * @route   PUT /api/admin/groups/:id
 * @desc    Cập nhật nhóm quyền
 * @access  Private (Super Admin only)
 */
router.put('/:id', authenticate, isSuperAdmin, groupController.updateGroup);

/**
 * @route   DELETE /api/admin/groups/:id
 * @desc    Xóa nhóm quyền (soft delete)
 * @access  Private (Super Admin only)
 */
router.delete('/:id', authenticate, isSuperAdmin, groupController.deleteGroup);

export default router;

