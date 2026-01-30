import express from 'express';
import { jobController } from '../controllers/admin/jobController.js';
import { authenticate } from '../middleware/auth.js';
import { isSuperAdminOrBackoffice } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/admin/jobs
 * @desc    Get list of jobs
 * @access  Private (Super Admin, Backoffice)
 */
router.get('/', authenticate, isSuperAdminOrBackoffice, jobController.getJobs);

/**
 * @route   GET /api/admin/jobs/:id
 * @desc    Get job by ID
 * @access  Private (Super Admin, Backoffice)
 */
router.get('/:id', authenticate, isSuperAdminOrBackoffice, jobController.getJobById);

/**
 * @route   POST /api/admin/jobs
 * @desc    Create new job
 * @access  Private (Super Admin, Backoffice)
 */
router.post('/', authenticate, isSuperAdminOrBackoffice, jobController.createJob);

/**
 * @route   PUT /api/admin/jobs/:id
 * @desc    Update job
 * @access  Private (Super Admin, Backoffice)
 */
router.put('/:id', authenticate, isSuperAdminOrBackoffice, jobController.updateJob);

/**
 * @route   DELETE /api/admin/jobs/:id
 * @desc    Delete job (soft delete)
 * @access  Private (Super Admin, Backoffice)
 */
router.delete('/:id', authenticate, isSuperAdminOrBackoffice, jobController.deleteJob);

/**
 * @route   PATCH /api/admin/jobs/:id/toggle-pinned
 * @desc    Toggle job pinned status
 * @access  Private (Super Admin, Backoffice)
 */
router.patch('/:id/toggle-pinned', authenticate, isSuperAdminOrBackoffice, jobController.togglePinned);

/**
 * @route   PATCH /api/admin/jobs/:id/toggle-hot
 * @desc    Toggle job hot status
 * @access  Private (Super Admin, Backoffice)
 */
router.patch('/:id/toggle-hot', authenticate, isSuperAdminOrBackoffice, jobController.toggleHot);

/**
 * @route   PATCH /api/admin/jobs/:id/status
 * @desc    Update job status
 * @access  Private (Super Admin, Backoffice)
 */
router.patch('/:id/status', authenticate, isSuperAdminOrBackoffice, jobController.updateStatus);

export default router;

