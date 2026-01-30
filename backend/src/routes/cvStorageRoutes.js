import express from 'express';
import { cvStorageController, uploadCVFile } from '../controllers/admin/cvStorageController.js';
import { authenticate, isSuperAdminOrBackoffice } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/admin/cv-storages
 * @desc    Lấy danh sách file CV
 * @access  Private (Super Admin or Admin Backoffice)
 */
router.get('/', authenticate, isSuperAdminOrBackoffice, cvStorageController.getCVStorages);

/**
 * @route   POST /api/admin/cv-storages/:id/upload
 * @desc    Upload file CV
 * @access  Private (Super Admin or Admin Backoffice)
 */
router.post('/:id/upload', authenticate, isSuperAdminOrBackoffice, uploadCVFile, cvStorageController.uploadCVFile);

/**
 * @route   GET /api/admin/cv-storages/:id/download
 * @desc    Download file CV
 * @access  Private (Super Admin or Admin Backoffice)
 */
router.get('/:id/download', authenticate, isSuperAdminOrBackoffice, cvStorageController.downloadCVFile);

/**
 * @route   DELETE /api/admin/cv-storages/:id/file
 * @desc    Xóa file CV
 * @access  Private (Super Admin or Admin Backoffice)
 */
router.delete('/:id/file', authenticate, isSuperAdminOrBackoffice, cvStorageController.deleteCVFile);

export default router;

