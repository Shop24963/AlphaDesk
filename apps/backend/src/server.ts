import http from 'http';
import { env } from '@/config/env.js';
import { createApp } from '@/app.js';
import { connectDatabase } from '@/database/connection.js';
import { connectRedis } from '@/database/redis.js';
import { socketService } from '@/sockets/socket.service.js';
import { logger } from '@/common/logger.js';

async function bootstrap(): Promise<void> {
  let server: http.Server | null = null;

  try {
    logger.info('🚀 Starting AlphaDesk API...');

    // Connect to database
    await connectDatabase();

    // Connect to Redis
    await connectRedis().catch(err => {
      logger.warn('Redis connection failed, continuing without Redis', { 
        error: err instanceof Error ? err.message : err 
      });
    });

    // Create Express app
    const app = createApp();

    // Create HTTP server
    server = http.createServer(app);

    // Initialize Socket.IO
    socketService.init(server);

    // Start server
    const PORT = env.PORT;

    server.listen(PORT, () => {
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`📡 Environment: ${env.NODE_ENV}`);
      logger.info(`🌐 CORS Origin: ${env.CORS_ORIGIN}`);
      logger.info(`🔌 WebSocket: Enabled`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`🛑 Received ${signal}, shutting down gracefully...`);

      if (server) {
        server.close(async () => {
          logger.info('👋 HTTP server closed');

          // Close database connections
          const mongoose = await import('mongoose');
          await mongoose.default.disconnect();
          logger.info('👋 MongoDB disconnected');

          // Close Redis connection
          const redis = await import('@/database/redis.js');
          await redis.disconnectRedis();

          process.exit(0);
        });

        // Force close after timeout
        setTimeout(() => {
          logger.error('⚠️  Forced shutdown due to timeout');
          process.exit(1);
        }, 30000);
      } else {
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', { promise, reason });
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Start the application
bootstrap();
