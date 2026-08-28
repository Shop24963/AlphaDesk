import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { authenticate } from '../../auth/middleware/auth.middleware.js';

const router = Router();

// All routes are protected
router.use(authenticate);

// Get dashboard analytics summary
router.get('/dashboard', analyticsController.getDashboard.bind(analyticsController));

// Get equity curve data
router.get('/equity-curve', analyticsController.getEquityCurve.bind(analyticsController));

// Get performance metrics
router.get('/performance', analyticsController.getPerformance.bind(analyticsController));

// Calculate and save performance metrics
router.post('/performance/calculate', analyticsController.calculatePerformance.bind(analyticsController));

// Get portfolio analytics with risk metrics
router.get('/portfolio', analyticsController.getPortfolioAnalytics.bind(analyticsController));

// Get analytics history
router.get('/history', analyticsController.getAnalyticsHistory.bind(analyticsController));

// Save custom analytics
router.post('/save', analyticsController.saveAnalytics.bind(analyticsController));

export { router as analyticsRoutes };
