import Queue from 'bull';
import Redis from 'ioredis';
import { env } from '../../config/env.js';

// Redis connection for Bull
const redisConnection = new Redis(env.REDIS_URL);

// Create queues
export const backtestQueue = new Queue('backtesting', {
  redis: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 1000,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const scanQueue = new Queue('scanning', {
  redis: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 100,
    attempts: 2,
  },
});

export const alertQueue = new Queue('alerts', {
  redis: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 200,
    removeOnFail: 500,
    attempts: 3,
  },
});

export const dataSyncQueue = new Queue('data-sync', {
  redis: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 100,
    attempts: 3,
  },
});

export const strategyExecutionQueue = new Queue('strategy-execution', {
  redis: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 500,
    attempts: 2,
  },
});

// Job processors
backtestQueue.process(async (job) => {
  const { backtestId, strategyId, userId } = job.data;
  
  console.log(`Processing backtest ${backtestId} for strategy ${strategyId}`);
  
  // Import here to avoid circular dependencies
  const { Backtest } = await import('../backtesting/backtest.model.js');
  const { runBacktest } = await import('../backtesting/backtest.service.js');
  
  try {
    await Backtest.findByIdAndUpdate(backtestId, { 
      status: 'running',
      startedAt: new Date()
    });

    const results = await runBacktest(strategyId, userId);

    await Backtest.findByIdAndUpdate(backtestId, {
      status: 'completed',
      completedAt: new Date(),
      results: results.results,
      trades: results.trades,
      equityCurve: results.equityCurve,
    });

    return { success: true, backtestId };
  } catch (error: any) {
    await Backtest.findByIdAndUpdate(backtestId, {
      status: 'failed',
      error: error.message,
    });
    throw error;
  }
});

scanQueue.process(async (job) => {
  const { scanType, filters, userId } = job.data;
  
  console.log(`Running ${scanType} scan`);
  
  const { screenerService } = await import('../screener/screener.service.js');
  
  try {
    let results;
    switch (scanType) {
      case 'swing':
        results = await screenerService.scanSwingStocks(filters);
        break;
      case 'positional':
        results = await screenerService.scanPositionalStocks(filters);
        break;
      case 'relative-strength':
        results = await screenerService.calculateRelativeStrength();
        break;
      default:
        throw new Error(`Unknown scan type: ${scanType}`);
    }
    
    return { success: true, results, scanType };
  } catch (error: any) {
    console.error(`Scan failed: ${error.message}`);
    throw error;
  }
});

alertQueue.process(async (job) => {
  const { alertId, currentPrice, targetPrice } = job.data;
  
  console.log(`Processing alert ${alertId}: current=${currentPrice}, target=${targetPrice}`);
  
  const { Alert } = await import('../alerts/alert.model.js');
  const { io } = await import('../../server.js');
  
  try {
    const alert = await Alert.findById(alertId);
    if (!alert) throw new Error('Alert not found');
    
    // Check if alert condition is met
    let triggered = false;
    if (alert.condition.type === 'price_above' && currentPrice >= targetPrice) {
      triggered = true;
    } else if (alert.condition.type === 'price_below' && currentPrice <= targetPrice) {
      triggered = true;
    } else if (alert.condition.type === 'rsi_above' && currentPrice >= targetPrice) {
      triggered = true;
    } else if (alert.condition.type === 'rsi_below' && currentPrice <= targetPrice) {
      triggered = true;
    }
    
    if (triggered) {
      await Alert.findByIdAndUpdate(alertId, {
        triggered: true,
        triggeredAt: new Date(),
        triggeredPrice: currentPrice,
      });
      
      // Emit real-time notification
      io.to(`user:${alert.userId}`).emit('alert:triggered', {
        alertId: alert._id,
        symbol: alert.symbol,
        message: `Alert triggered for ${alert.symbol} at ₹${currentPrice}`,
      });
      
      // Send notification (implement notification service later)
      console.log(`Alert triggered for user ${alert.userId}: ${alert.symbol} at ₹${currentPrice}`);
    }
    
    return { success: true, triggered };
  } catch (error: any) {
    console.error(`Alert processing failed: ${error.message}`);
    throw error;
  }
});

// Graceful shutdown
export async function closeQueues() {
  await backtestQueue.close();
  await scanQueue.close();
  await alertQueue.close();
  await dataSyncQueue.close();
  await strategyExecutionQueue.close();
  await redisConnection.quit();
}

export { redisConnection };
