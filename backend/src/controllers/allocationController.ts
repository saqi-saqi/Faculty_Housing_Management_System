import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { allocationService } from '../services/allocationService.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export const manualAllocateSchema = z.object({
  applicationId: z.number().int().positive(),
  houseId: z.number().int().positive(),
  notes: z.string().optional()
});

export const vacateSchema = z.object({
  tenancyId: z.number().int().positive(),
  notes: z.string().optional()
});

export async function getSeniorityQueue(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const queue = await allocationService.getSortedApplicationQueue();
    res.status(200).json({ success: true, data: queue });
  } catch (error) {
    next(error);
  }
}

export async function previewAutoAllocation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const preview = await allocationService.previewAutoAllocation();
    res.status(200).json({ success: true, data: preview });
  } catch (error) {
    next(error);
  }
}

export async function executeAutoAllocation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = req.user?.userId || 1;
    const result = await allocationService.executeAutoAllocation(adminId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'AUTO_ALLOCATION_FAILED', message: error.message }
    });
  }
}

export async function manualAllocate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = req.user?.userId || 1;
    const { applicationId, houseId, notes } = req.body;
    const result = await allocationService.allocateManually(adminId, applicationId, houseId, notes);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'MANUAL_ALLOCATION_FAILED', message: error.message }
    });
  }
}

export async function vacateHouse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = req.user?.userId || 1;
    const { tenancyId, notes } = req.body;
    const result = await allocationService.vacateHouse(adminId, tenancyId, notes);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'VACATE_FAILED', message: error.message }
    });
  }
}

export async function getConflicts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const conflicts = await allocationService.getConflictingApplicants();
    res.status(200).json({ success: true, data: conflicts });
  } catch (error) {
    next(error);
  }
}
