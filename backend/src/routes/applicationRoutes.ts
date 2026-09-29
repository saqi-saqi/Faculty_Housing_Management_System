import { Router } from 'express';
import {
  submitApplication,
  withdrawApplication,
  getMyApplications,
  getAllApplications,
  submitApplicationSchema
} from '../controllers/applicationController.js';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin, requireFaculty } from '../middlewares/roleGuard.js';
import { validateBody } from '../middlewares/validate.js';

const router = Router();

// Faculty endpoints
router.post('/', authenticate, requireFaculty, validateBody(submitApplicationSchema), submitApplication);
router.post('/:id/withdraw', authenticate, requireFaculty, withdrawApplication);
router.get('/my', authenticate, requireFaculty, getMyApplications);

// Admin endpoint
router.get('/', authenticate, requireAdmin, getAllApplications);

export default router;
