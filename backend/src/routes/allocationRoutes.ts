import { Router } from 'express';
import {
  getSeniorityQueue,
  previewAutoAllocation,
  executeAutoAllocation,
  manualAllocate,
  vacateHouse,
  getConflicts,
  manualAllocateSchema,
  vacateSchema
} from '../controllers/allocationController.js';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/roleGuard.js';
import { validateBody } from '../middlewares/validate.js';

const router = Router();

// All allocation actions are strictly admin protected
router.use(authenticate, requireAdmin);

router.get('/queue', getSeniorityQueue);
router.get('/preview', previewAutoAllocation);
router.post('/auto', executeAutoAllocation);
router.post('/manual', validateBody(manualAllocateSchema), manualAllocate);
router.post('/vacate', validateBody(vacateSchema), vacateHouse);
router.get('/conflicts', getConflicts);

export default router;
