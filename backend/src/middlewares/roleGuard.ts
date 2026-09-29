import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { db } from '../db/connection.js';

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Access restricted to Estate Office administrators only.'
      }
    });
    return;
  }
  next();
}

export function requireFaculty(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'faculty') {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Access restricted to Faculty members.'
      }
    });
    return;
  }
  next();
}

export async function requireResident(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
    return;
  }

  if (req.user.role === 'admin') {
    // Admins bypass resident check
    return next();
  }

  if (!req.user.facultyId) {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'User is not linked to a verified faculty profile.' }
    });
    return;
  }

  // Check active tenancy
  const tenancies = await db.query(
    'SELECT id, house_id FROM tenancies WHERE faculty_id = ? AND end_date IS NULL',
    [req.user.facultyId]
  );

  if (!tenancies || tenancies.length === 0) {
    res.status(403).json({
      success: false,
      error: {
        code: 'NOT_A_RESIDENT',
        message: 'This feature is available only to faculty members with an active housing allocation.'
      }
    });
    return;
  }

  next();
}
