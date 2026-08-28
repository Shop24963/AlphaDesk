import { Router } from 'express';
import { authRoutes } from '@/modules/auth/auth.routes.js';
import healthRoutes from '@/routes/health.routes.js';
import marketRoutes from '@/modules/market/market.routes.js';
import { stockRoutes } from '@/modules/stocks/stock.routes.js';
import { watchlistRoutes } from '@/modules/watchlists/watchlist.routes.js';
import { alertRoutes } from '@/modules/alerts/alert.routes.js';
import { strategyRoutes } from '@/modules/strategies/strategy.routes.js';
import { portfolioRoutes } from '@/modules/portfolio/portfolio.routes.js';
import { backtestRoutes } from '@/modules/backtesting/backtest.routes.js';
import { tradingRoutes } from '@/modules/trading/trading.routes.js';
import { screenerRoutes } from '@/modules/screener/screener.routes.js';
import { journalRoutes } from '@/modules/journal/journal.routes.js';
import { analyticsRoutes } from '@/modules/analytics/analytics.routes.js';
import { notificationRoutes } from '@/modules/notifications/notification.routes.js';
import { calculatorRoutes } from '@/modules/calculators/calculators.routes.js';
import { aiRoutes } from '@/modules/ai-admin/ai.routes.js';

const router = Router();

// Public routes
router.use('/auth', authRoutes);
router.use('/', healthRoutes);

// Market data routes (public for basic data)
router.use('/market', marketRoutes);
router.use('/stocks', stockRoutes);
router.use('/screener', screenerRoutes);
router.use('/calculators', calculatorRoutes);
router.use('/ai', aiRoutes);

// Protected routes (authentication required in each module)
router.use('/watchlists', watchlistRoutes);
router.use('/alerts', alertRoutes);
router.use('/strategies', strategyRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/backtesting', backtestRoutes);
router.use('/trading', tradingRoutes);
router.use('/journal', journalRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);

export default router;
