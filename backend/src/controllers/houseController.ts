import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { houseService } from '../services/houseService.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export const createHouseSchema = z.object({
  house_number: z.string().min(1, 'House number is required'),
  address: z.string().min(1, 'Address is required'),
  capacity: z.number().int().positive().optional(),
  description: z.string().optional()
});

export const updateHouseStatusSchema = z.object({
  status: z.enum(['vacant', 'occupied', 'maintenance'])
});

export async function getVacantHouses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const houses = await houseService.getVacantHouses();
    res.status(200).json({ success: true, data: houses });
  } catch (error) {
    next(error);
  }
}

export async function getAllHouses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const houses = await houseService.getAllHouses();
    res.status(200).json({ success: true, data: houses });
  } catch (error) {
    next(error);
  }
}

export async function getHouseById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    const house = await houseService.getHouseById(id);
    if (!house) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'House not found' } });
      return;
    }
    res.status(200).json({ success: true, data: house });
  } catch (error) {
    next(error);
  }
}

export async function createHouse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await houseService.createHouse(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_HOUSE_FAILED', message: error.message } });
  }
}

export async function updateHouseStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    await houseService.updateHouseStatus(id, req.body.status);
    res.status(200).json({ success: true, message: 'House status updated successfully' });
  } catch (error: any) {
    next(error);
  }
}
