import { Router } from 'express';
import { asyncHandler } from '@/common/errors.js';

const router = Router();

router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  })
);

router.get(
  '/health/ready',
  asyncHandler(async (_req, res) => {
    const checks: Record<string, boolean> = {};
    let isReady = true;

    const mongoose = await import('mongoose');
    checks.mongodb = mongoose.default.connection.readyState === 1;

    if (!checks.mongodb) {
      isReady = false;
    }

    try {
      const redis = await import('@/database/redis.js');
      checks.redis = redis.isRedisConnected();
    } catch {
      checks.redis = false;
    }

    const status = isReady ? 'ready' : 'not_ready';
    const statusCode = isReady ? 200 : 503;

    res.status(statusCode).json({
      success: isReady,
      data: {
        status,
        timestamp: new Date().toISOString(),
        checks,
      },
    });
  })
);

router.get(
  '/health/live',
  asyncHandler(async (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'alive',
        timestamp: new Date().toISOString(),
      },
    });
  })
);

router.get(
  '/version',
  asyncHandler(async (_req, res) => {
    res.json({
      success: true,
      data: {
        name: 'AlphaDesk API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
      },
    });
  })
);

export default router;
