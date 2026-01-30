import express from 'express';
import { favoriteJobController } from '../controllers/collaborator/favoriteJobController.js';
import { authenticateCTV } from '../middleware/ctvAuth.js';

const router = express.Router();

/**
 * @route   GET /api/ctv/favorite-jobs
 * @desc    Get list of favorite jobs
 * @access  Private (CTV)
 */
router.get('/', authenticateCTV, favoriteJobController.getFavoriteJobs);

/**
 * @route   GET /api/ctv/favorite-jobs/check/:jobId
 * @desc    Check if job is favorited
 * @access  Private (CTV)
 */
router.get('/check/:jobId', authenticateCTV, favoriteJobController.checkFavoriteJob);

/**
 * @route   POST /api/ctv/favorite-jobs
 * @desc    Add job to favorites
 * @access  Private (CTV)
 */
router.post('/', authenticateCTV, favoriteJobController.addFavoriteJob);

/**
 * @route   DELETE /api/ctv/favorite-jobs/:jobId
 * @desc    Remove job from favorites
 * @access  Private (CTV)
 */
router.delete('/:jobId', authenticateCTV, favoriteJobController.removeFavoriteJob);

export default router;

