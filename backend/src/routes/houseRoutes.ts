import { Router } from 'express';
import {
  getVacantHouses,
  getMyHouse,
  getAllHouses,
  getHouseById,
  createHouse,
  updateHouseStatus,
  createHouseSchema,
  updateHouseStatusSchema
} from '../controllers/houseController.js';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/roleGuard.js';
import { validateBody } from '../middlewares/validate.js';

const router = Router();

// Public / Authenticated
router.get('/vacant', authenticate, getVacantHouses);
router.get('/my', authenticate, getMyHouse);
router.get('/:id', authenticate, getHouseById);

// Admin-only
router.get('/', authenticate, requireAdmin, getAllHouses);
router.post('/', authenticate, requireAdmin, validateBody(createHouseSchema), createHouse);
router.patch('/:id/status', authenticate, requireAdmin, validateBody(updateHouseStatusSchema), updateHouseStatus);

export default router;
