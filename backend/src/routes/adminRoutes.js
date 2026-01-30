import express from 'express';
import { adminController } from '../controllers/admin/adminController.js';
import { authenticate, isSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/admin/auth/login
 * @desc    Đăng nhập admin
 * @access  Public
 */
router.post('/auth/login', adminController.login);

/**
 * @route   POST /api/admin/auth/logout
 * @desc    Đăng xuất admin
 * @access  Private
 */
router.post('/auth/logout', authenticate, adminController.logout);

/**
 * @route   GET /api/admin/auth/me
 * @desc    Lấy thông tin admin hiện tại
 * @access  Private
 */
router.get('/auth/me', authenticate, adminController.getProfile);

/**
 * @route   GET /api/admin/admins
 * @desc    Lấy danh sách admin
 * @access  Private (Super Admin only)
 */
router.get('/admins', authenticate, isSuperAdmin, adminController.getAdmins);

/**
 * @route   GET /api/admin/admins/:id
 * @desc    Lấy thông tin admin theo ID
 * @access  Private (Super Admin only)
 */
router.get('/admins/:id', authenticate, isSuperAdmin, adminController.getAdminById);

/**
 * @route   POST /api/admin/admins
 * @desc    Tạo admin mới
 * @access  Private (Super Admin only)
 */
router.post('/admins', authenticate, isSuperAdmin, adminController.createAdmin);

/**
 * @route   PUT /api/admin/admins/:id
 * @desc    Cập nhật thông tin admin
 * @access  Private (Super Admin only)
 */
router.put('/admins/:id', authenticate, isSuperAdmin, adminController.updateAdmin);

/**
 * @route   DELETE /api/admin/admins/:id
 * @desc    Xóa admin (soft delete)
 * @access  Private (Super Admin only)
 */
router.delete('/admins/:id', authenticate, isSuperAdmin, adminController.deleteAdmin);

/**
 * @route   POST /api/admin/admins/:id/reset-password
 * @desc    Đặt lại mật khẩu admin
 * @access  Private (Super Admin only)
 */
router.post('/admins/:id/reset-password', authenticate, isSuperAdmin, adminController.resetPassword);

/**
 * @route   PATCH /api/admin/admins/:id/toggle-status
 * @desc    Kích hoạt/Vô hiệu hóa admin
 * @access  Private (Super Admin only)
 */
router.patch('/admins/:id/toggle-status', authenticate, isSuperAdmin, adminController.toggleStatus);

export default router;

