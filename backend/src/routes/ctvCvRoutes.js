import express from 'express';
import { cvController } from '../controllers/collaborator/cvController.js';
import { authenticateCTV } from '../middleware/ctvAuth.js';

const router = express.Router();

/**
 * @route   GET /api/ctv/cvs
 * @desc    Get list of CVs (only own CVs)
 * @access  Private (CTV)
 */
router.get('/', authenticateCTV, cvController.getCVs);

/**
 * @route   GET /api/ctv/cvs/:id
 * @desc    Get CV by ID (only own CV)
 * @access  Private (CTV)
 */
router.get('/:id', authenticateCTV, cvController.getCVById);

/**
 * @route   POST /api/ctv/cvs
 * @desc    Create new CV
 * @access  Private (CTV)
 */
router.post('/', authenticateCTV, cvController.createCV);

/**
 * @route   PUT /api/ctv/cvs/:id
 * @desc    Update CV (only own CV)
 * @access  Private (CTV)
 */
router.put('/:id', authenticateCTV, cvController.updateCV);

/**
 * @route   DELETE /api/ctv/cvs/:id
 * @desc    Delete CV (only own CV, soft delete)
 * @access  Private (CTV)
 */
router.delete('/:id', authenticateCTV, cvController.deleteCV);

/**
 * @route   GET /api/ctv/cvs/statistics
 * @desc    Get CV statistics and list (danh sách CV và thống kê đơn ứng tuyển)
 * @access  Private (CTV)
 */
router.get('/statistics', authenticateCTV, cvController.getCVStatistics);

/**
 * @route   GET /api/ctv/cvs/recent
 * @desc    Get recently updated CVs (sorted by updatedAt DESC)
 * @access  Private (CTV)
 */
router.get('/recent', authenticateCTV, cvController.getRecentCVs);

export default router;

