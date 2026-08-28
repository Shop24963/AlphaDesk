import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

// All routes are protected
router.use(protect);

// Get dashboard analytics summary
router.get('/dashboard', analyticsController.getDashboard.bind(analyticsController));

// Get equity curve data
router.get('/equity-curve', analyticsController.getEquityCurve.bind(analyticsController));

// Get performance metrics
router.get('/performance', analyticsController.getPerformance.bind(analyticsController));

// Calculate and save performance metrics
router.post('/performance/calculate', analyticsController.calculatePerformance.bind(analyticsController));

export default router;
