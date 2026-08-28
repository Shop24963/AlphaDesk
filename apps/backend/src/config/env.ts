import { z } from 'zod';

/**
 * Environment variable schema for backend
 * Validates all required environment variables at startup
 */

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(val => parseInt(val, 10)).default('3001'),

  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  // JWT Secrets
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),

  // JWT Expiration
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(val => parseInt(val, 10)).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(val => parseInt(val, 10)).default('100'),

  // Market Data Provider
  MARKET_DATA_PROVIDER: z.enum(['mock', 'zerodha', 'upstox', 'yahoo', 'alpha_vantage']).default('mock'),

  // App Base URL
  APP_BASE_URL: z.string().url().default('http://localhost:3001'),

  // Optional: Broker credentials (namespaced for future use)
  BROKER_ZERODHA_API_KEY: z.string().optional(),
  BROKER_ZERODHA_API_SECRET: z.string().optional(),
  BROKER_UPSTOX_API_KEY: z.string().optional(),
  BROKER_UPSTOX_API_SECRET: z.string().optional(),

  // Optional: Market provider credentials
  MARKET_PROVIDER_API_KEY: z.string().optional(),
  MARKET_PROVIDER_API_SECRET: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

function loadEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment configuration:');
    result.error.errors.forEach(error => {
      console.error(`  - ${error.path.join('.')}: ${error.message}`);
    });
    process.exit(1);
  }

  return result.data;
}

export const env = loadEnv();

export default env;
