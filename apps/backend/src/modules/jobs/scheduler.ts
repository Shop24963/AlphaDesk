import cron from 'node-cron';
import { scanQueue, alertQueue } from './queues.js';
import { env } from '../../config/env.js';

interface ScheduledTask {
  name: string;
  schedule: string;
  task: () => Promise<void>;
  enabled: boolean;
}

const tasks: ScheduledTask[] = [];

// Daily market scan at 9:30 AM (after market opens)
tasks.push({
  name: 'daily-swing-scan',
  schedule: '30 9 * * 1-5', // Mon-Fri at 9:30 AM
  enabled: true,
  task: async () => {
    console.log('Running daily swing scan...');
    await scanQueue.add('scan', {
      scanType: 'swing',
      filters: {
        rsi: { min: 40, max: 70 },
        volume: { min: 100000 },
      },
    });
  },
});

// Daily positional scan at 3:30 PM (before market closes)
tasks.push({
  name: 'daily-positional-scan',
  schedule: '30 15 * * 1-5', // Mon-Fri at 3:30 PM
  enabled: true,
  task: async () => {
    console.log('Running daily positional scan...');
    await scanQueue.add('scan', {
      scanType: 'positional',
      filters: {
        rsi: { min: 30, max: 60 },
        volume: { min: 50000 },
      },
    });
  },
});

// Relative strength calculation daily at 4:00 PM
tasks.push({
  name: 'relative-strength-calc',
  schedule: '0 16 * * 1-5', // Mon-Fri at 4:00 PM
  enabled: true,
  task: async () => {
    console.log('Calculating relative strength...');
    await scanQueue.add('scan', {
      scanType: 'relative-strength',
    });
  },
});

// Alert checking every minute during market hours
tasks.push({
  name: 'alert-checker',
  schedule: '* 9-15 * * 1-5', // Every minute Mon-Fri 9 AM - 3 PM
  enabled: true,
  task: async () => {
    console.log('Checking active alerts...');
    
    const { Alert } = await import('../alerts/alert.model.js');
    const { getQuote } = await import('../market/market.provider.js');
    
    const activeAlerts = await Alert.find({
      triggered: false,
      active: true,
    }).populate('userId');
    
    for (const alert of activeAlerts) {
      try {
        const quote = await getQuote(alert.symbol);
        await alertQueue.add('alert', {
          alertId: alert._id.toString(),
          currentPrice: quote.lastPrice,
          targetPrice: alert.condition.value,
        });
      } catch (error: any) {
        console.error(`Error checking alert ${alert._id}: ${error.message}`);
      }
    }
  },
});

// Portfolio analytics update daily at 6:00 PM
tasks.push({
  name: 'portfolio-analytics',
  schedule: '0 18 * * 1-5', // Mon-Fri at 6:00 PM
  enabled: true,
  task: async () => {
    console.log('Updating portfolio analytics...');
    
    const { User } = await import('../users/user.model.js');
    const { saveAnalytics } = await import('../analytics/analytics.service.js');
    
    const users = await User.find();
    for (const user of users) {
      try {
        const metrics = await import('../analytics/analytics.service.js')
          .then(m => m.calculatePortfolioAnalytics(user._id.toString()));
        
        await saveAnalytics(user._id.toString(), 'portfolio', metrics, {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
        });
      } catch (error: any) {
        console.error(`Error updating analytics for user ${user._id}: ${error.message}`);
      }
    }
  },
});

export function startScheduledTasks() {
  console.log('Starting scheduled tasks...');
  
  tasks.forEach(task => {
    if (!task.enabled) {
      console.log(`Skipping disabled task: ${task.name}`);
      return;
    }
    
    const job = cron.schedule(task.schedule, async () => {
      console.log(`Executing scheduled task: ${task.name}`);
      try {
        await task.task();
        console.log(`Completed task: ${task.name}`);
      } catch (error: any) {
        console.error(`Task ${task.name} failed: ${error.message}`);
      }
    });
    
    console.log(`Scheduled task "${task.name}" with cron "${task.schedule}"`);
  });
}

export function stopScheduledTasks() {
  console.log('Stopping all scheduled tasks...');
  cron.gracefulShutdown().then(() => {
    console.log('All scheduled tasks stopped');
  });
}
