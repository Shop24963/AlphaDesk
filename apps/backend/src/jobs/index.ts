import cron from 'node-cron';
import { logger } from '@/common/logger.js';
import { Alert } from '@/modules/alerts/alert.model.js';
import { Strategy } from '@/modules/strategies/strategy.model.js';
import { getIo } from '@/sockets/index.js';

/**
 * Job to check and trigger alerts
 */
export const setupAlertCheckJob = () => {
  // Run every minute
  const job = cron.schedule('* * * * *', async () => {
    try {
      logger.debug('Running alert check job');

      // Get all active alerts
      const activeAlerts = await Alert.find({ isActive: true }).populate('user');

      for (const alert of activeAlerts) {
        // Check if alert condition is met
        // This would integrate with market data provider
        // For now, we'll skip actual checking until market data is integrated
        logger.debug(`Checking alert ${alert._id} for symbol ${alert.symbol}`);
      }
    } catch (error) {
      logger.error('Alert check job failed', error);
    }
  });

  return job;
};

/**
 * Job to run periodic scans
 */
export const setupScanJob = () => {
  // Run every 5 minutes during market hours
  const job = cron.schedule('*/5 * * * 1-5', async () => {
    try {
      logger.debug('Running periodic scan job');

      // This would run screening scans
      // Integration with market data required
    } catch (error) {
      logger.error('Scan job failed', error);
    }
  });

  return job;
};

/**
 * Job to calculate daily performance metrics
 */
export const setupPerformanceCalculationJob = () => {
  // Run daily at midnight
  const job = cron.schedule('0 0 * * *', async () => {
    try {
      logger.debug('Running daily performance calculation job');

      // This would calculate and store daily performance metrics
      // Integration with trading module required
    } catch (error) {
      logger.error('Performance calculation job failed', error);
    }
  });

  return job;
};

/**
 * Job to clean up old data
 */
export const setupCleanupJob = () => {
  // Run weekly on Sunday at 2 AM
  const job = cron.schedule('0 2 * * 0', async () => {
    try {
      logger.debug('Running weekly cleanup job');

      // Clean up old notifications (older than 90 days)
      // Clean up old backtest results
      // Archive old journal entries if needed
    } catch (error) {
      logger.error('Cleanup job failed', error);
    }
  });

  return job;
};

/**
 * Initialize all scheduled jobs
 */
export const initializeJobs = () => {
  logger.info('Initializing scheduled jobs');

  const jobs = [
    setupAlertCheckJob(),
    setupScanJob(),
    setupPerformanceCalculationJob(),
    setupCleanupJob(),
  ];

  return jobs;
};
