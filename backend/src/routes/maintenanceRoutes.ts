import { Router } from 'express';
import {
  getCategories,
  getMyRequests,
  getMyPendingRequests,
  submitRequest,
  cancelRequest,
  deleteRequest,
  getAllRequests,
  updateRequestStatus,
  createRequestSchema,
  updateStatusSchema
} from '../controllers/maintenanceController.js';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin, requireResident } from '../middlewares/roleGuard.js';
import { validateBody } from '../middlewares/validate.js';

const router = Router();

// Resident endpoints
router.get('/categories', authenticate, getCategories);
router.get('/my', authenticate, getMyRequests);
router.get('/my/pending', authenticate, getMyPendingRequests);
router.post('/', authenticate, requireResident, validateBody(createRequestSchema), submitRequest);
router.post('/:id/cancel', authenticate, cancelRequest);
router.delete('/:id', authenticate, deleteRequest);

// Admin endpoints
router.get('/admin/all', authenticate, requireAdmin, getAllRequests);
router.patch('/admin/:id/status', authenticate, requireAdmin, validateBody(updateStatusSchema), updateRequestStatus);

export default router;
