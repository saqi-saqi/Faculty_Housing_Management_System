import { Router } from 'express';
import { getRecentAuditLogs } from '../controllers/auditController.js';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/roleGuard.js';

const router = Router();

router.get('/', authenticate, requireAdmin, getRecentAuditLogs);

export default router;
