import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { maintenanceService } from '../services/maintenanceService.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export const createRequestSchema = z.object({
  categoryId: z.number().int().positive('Please select a valid problem category'),
  problem: z.string().min(1, 'Problem summary is required'),
  description: z.string().min(5, 'Please provide a clear description of the issue'),
  priority: z.enum(['low', 'medium', 'high', 'emergency']).optional()
});

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'resolved', 'cancelled']),
  adminNotes: z.string().optional()
});

export async function getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await maintenanceService.getCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function getMyRequests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const requests = await maintenanceService.getMyRequests(userId);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
}

export async function getMyPendingRequests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const requests = await maintenanceService.getMyPendingRequests(userId);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
}

export async function submitRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const facultyId = req.user!.facultyId;

    if (!facultyId) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'User is not linked to a verified faculty profile.' }
      });
      return;
    }

    const result = await maintenanceService.submitRequest(userId, facultyId, req.body);

    res.status(201).json({
      success: true,
      data: { requestId: result.id, message: 'Maintenance ticket created successfully.' }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'SUBMIT_REQUEST_FAILED', message: error.message }
    });
  }
}

export async function cancelRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const requestId = parseInt(req.params.id as string, 10);

    await maintenanceService.cancelRequest(requestId, userId);

    res.status(200).json({
      success: true,
      message: 'Maintenance ticket cancelled successfully.'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'CANCEL_REQUEST_FAILED', message: error.message }
    });
  }
}

export async function deleteRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const requestId = parseInt(req.params.id as string, 10);

    await maintenanceService.deleteRequest(requestId, userId);

    res.status(200).json({
      success: true,
      message: 'Maintenance ticket deleted successfully.'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'DELETE_REQUEST_FAILED', message: error.message }
    });
  }
}

export async function getAllRequests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, priority } = req.query as any;
    const requests = await maintenanceService.getAllRequests({ status, priority });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
}

export async function updateRequestStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = req.user!.userId;
    const requestId = parseInt(req.params.id as string, 10);
    const { status, adminNotes } = req.body;

    await maintenanceService.updateRequestStatus(requestId, adminId, status, adminNotes);

    res.status(200).json({
      success: true,
      message: `Request status updated to '${status}'.`
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'UPDATE_STATUS_FAILED', message: error.message }
    });
  }
}
