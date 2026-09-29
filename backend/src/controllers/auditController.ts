import { Response, NextFunction } from 'express';
import { auditService } from '../services/auditService.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export async function getRecentAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string || '50', 10);
    const logs = await auditService.getRecentLogs(limit);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
}
