import mongoose from 'mongoose';
import { env } from '@/config/env.js';

export interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
}

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected) {
    console.log('✅ Database already connected');
    return;
  }

  try {
    const config: DatabaseConfig = {
      uri: env.MONGODB_URI,
      options: {
        maxPoolSize: 10,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      },
    };

    await mongoose.connect(config.uri, config.options);
    isConnected = true;

    console.log(`✅ MongoDB connected to ${maskUri(config.uri)}`);

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
      isConnected = false;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await disconnectDatabase();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error instanceof Error ? error.message : error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) return;

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('👋 MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting MongoDB:', error instanceof Error ? error.message : error);
  }
}

export function getDatabaseConnection(): mongoose.Connection {
  return mongoose.connection;
}

export function isDatabaseConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

/**
 * Mask sensitive parts of MongoDB URI for logging
 */
function maskUri(uri: string): string {
  try {
    const url = new URL(uri);
    if (url.password) {
      url.password = '****';
    }
    return `${url.protocol}//${url.username}:${url.password}@${url.host}${url.pathname}`;
  } catch {
    return 'mongodb://****';
  }
}
