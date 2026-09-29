import { Router } from 'express';
import authRoutes from './authRoutes.js';
import houseRoutes from './houseRoutes.js';
import applicationRoutes from './applicationRoutes.js';
import allocationRoutes from './allocationRoutes.js';
import maintenanceRoutes from './maintenanceRoutes.js';
import auditRoutes from './auditRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/houses', houseRoutes);
router.use('/applications', applicationRoutes);
router.use('/allocations', allocationRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/audit', auditRoutes);

export default router;
