import { Redis, RedisOptions } from 'ioredis';
import { env } from '@/config/env.js';

let redisClient: Redis | null = null;
let isConnected = false;

export async function connectRedis(): Promise<Redis> {
  if (redisClient && isConnected) {
    return redisClient;
  }

  try {
    const options: RedisOptions = {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    };

    redisClient = new Redis(env.REDIS_URL, options);

    await redisClient.connect();
    isConnected = true;

    console.log('✅ Redis connected');

    redisClient.on('error', (error) => {
      console.error('❌ Redis error:', error.message);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      isConnected = true;
    });

    redisClient.on('close', () => {
      isConnected = false;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await disconnectRedis();
    });

    process.on('SIGTERM', async () => {
      await disconnectRedis();
    });

    return redisClient;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error instanceof Error ? error.message : error);
    throw error;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (!redisClient || !isConnected) return;

  try {
    await redisClient.quit();
    redisClient = null;
    isConnected = false;
    console.log('👋 Redis disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting Redis:', error instanceof Error ? error.message : error);
  }
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

export function isRedisConnected(): boolean {
  return isConnected && redisClient !== null;
}

/**
 * Cache utilities
 */
export async function setCache<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  const client = getRedisClient();
  const serialized = JSON.stringify(value);

  if (ttlSeconds) {
    await client.setex(key, ttlSeconds, serialized);
  } else {
    await client.set(key, serialized);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  const data = await client.get(key);

  if (!data) return null;

  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function deleteCache(key: string): Promise<void> {
  const client = getRedisClient();
  await client.del(key);
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  const client = getRedisClient();
  const keys = await client.keys(pattern);

  if (keys.length > 0) {
    await client.del(...keys);
  }
}
