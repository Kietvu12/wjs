import express from 'express';
import { jobCategoryController } from '../controllers/admin/jobCategoryController.js';
import { authenticate } from '../middleware/auth.js';
import { isSuperAdminOrBackoffice } from '../middleware/auth.js';

const router = express.Router();

/**
 * Job Category Routes
 * Base path: /api/admin/job-categories
 */

// Get job category tree (hierarchical structure)
router.get('/tree', authenticate, isSuperAdminOrBackoffice, jobCategoryController.getJobCategoryTree);

// Get list of job categories
router.get('/', authenticate, isSuperAdminOrBackoffice, jobCategoryController.getJobCategories);

// Get job category by ID
router.get('/:id', authenticate, isSuperAdminOrBackoffice, jobCategoryController.getJobCategoryById);

// Create new job category
router.post('/', authenticate, isSuperAdminOrBackoffice, jobCategoryController.createJobCategory);

// Update job category
router.put('/:id', authenticate, isSuperAdminOrBackoffice, jobCategoryController.updateJobCategory);

// Delete job category
router.delete('/:id', authenticate, isSuperAdminOrBackoffice, jobCategoryController.deleteJobCategory);

export default router;

