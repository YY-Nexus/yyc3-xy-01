import { Router } from 'express';
import authRoutes from './auth';
import aiRoutes from './ai';
import growthRoutes from './growth';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/ai', aiRoutes);
router.use('/growth', growthRoutes);

export default router;