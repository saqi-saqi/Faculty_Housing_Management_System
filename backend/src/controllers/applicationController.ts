import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { applicationService } from '../services/applicationService.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export const submitApplicationSchema = z.object({
  houseId: z.number().int().positive('Please select a valid house')
});

export async function submitApplication(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.facultyId) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only registered faculty members can apply for university housing.' }
      });
      return;
    }

    const { houseId } = req.body;
    const result = await applicationService.submitApplication(req.user.facultyId, houseId);

    res.status(201).json({
      success: true,
      data: { applicationId: result.id, message: 'Housing application submitted successfully and queued for review.' }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'APPLICATION_SUBMISSION_FAILED', message: error.message }
    });
  }
}

export async function withdrawApplication(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.facultyId) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Faculty profile required' } });
      return;
    }

    const id = parseInt(req.params.id as string, 10);
    await applicationService.withdrawApplication(id, req.user.facultyId);

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully.'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'WITHDRAW_FAILED', message: error.message }
    });
  }
}

export async function getMyApplications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.facultyId) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Faculty profile required' } });
      return;
    }

    const apps = await applicationService.getMyApplications(req.user.facultyId);
    res.status(200).json({ success: true, data: apps });
  } catch (error) {
    next(error);
  }
}

export async function getAllApplications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const apps = await applicationService.getAllApplications();
    res.status(200).json({ success: true, data: apps });
  } catch (error) {
    next(error);
  }
}
