import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_WS_URL: z.string().url(),
  VITE_APP_NAME: z.string().min(1),
  VITE_APP_ENV: z.enum(['development', 'production', 'test']),
  VITE_ENABLE_ANALYTICS: z.string().optional().default('false'),
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const result = envSchema.safeParse({
    VITE_API_BASE_URL: (import.meta as any).env.VITE_API_BASE_URL,
    VITE_WS_URL: (import.meta as any).env.VITE_WS_URL,
    VITE_APP_NAME: (import.meta as any).env.VITE_APP_NAME,
    VITE_APP_ENV: (import.meta as any).env.VITE_APP_ENV,
    VITE_ENABLE_ANALYTICS: (import.meta as any).env.VITE_ENABLE_ANALYTICS,
  });

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    throw new Error('Invalid environment configuration');
  }

  return result.data;
}

export const env = validateEnv();

export const config = {
  apiBaseUrl: env.VITE_API_BASE_URL,
  wsUrl: env.VITE_WS_URL,
  appName: env.VITE_APP_NAME,
  appEnv: env.VITE_APP_ENV,
  enableAnalytics: env.VITE_ENABLE_ANALYTICS === 'true',
  isDevelopment: env.VITE_APP_ENV === 'development',
  isProduction: env.VITE_APP_ENV === 'production',
} as const;
