import express from 'express';
import { scheduleController } from '../controllers/collaborator/scheduleController.js';
import { authenticateCTV } from '../middleware/ctvAuth.js';

const router = express.Router();

/**
 * @route   GET /api/ctv/calendars/schedule
 * @desc    Get schedule (interviews and naitei) for CTV
 * @access  Private (CTV)
 */
router.get('/schedule', authenticateCTV, scheduleController.getSchedule);

export default router;

