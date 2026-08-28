import { Router } from 'express';
import authRoutes from '@/modules/auth/auth.routes.js';
import healthRoutes from '@/routes/health.routes.js';

const router = Router();

// Public routes
router.use('/auth', authRoutes);
router.use('/', healthRoutes);

export default router;
