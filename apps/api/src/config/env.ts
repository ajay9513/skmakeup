import './load-env';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  MAX_FAILED_LOGIN_ATTEMPTS: z.coerce.number().int().min(3).max(10).default(5),
  ACCOUNT_LOCK_DURATION_MINUTES: z.coerce.number().int().min(5).max(120).default(30),

  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),
  CLOUDINARY_FOLDER: z.string().default('sk-makeup'),

  EMAIL_HOST: z.string().default(''),
  EMAIL_PORT: z.coerce.number().int().default(587),
  EMAIL_USER: z.string().default(''),
  EMAIL_PASS: z.string().default(''),
  EMAIL_FROM: z.string().default('noreply@skmakeup.com'),

  WEB_URL: z.string().url(),
  ADMIN_URL: z.string().url(),
  API_URL: z.string().url().optional(),
  CORS_ORIGINS: z.string().transform((val) => val.split(',').map((s) => s.trim())),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().default(100),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().default(900000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().default(5),

  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => {
      if (val !== undefined) return val === 'true';
      return process.env.NODE_ENV === 'production';
    }),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),

  SUPER_ADMIN_EMAIL: z.string().email().optional(),
  SUPER_ADMIN_PASSWORD: z.string().min(12).optional(),
  SUPER_ADMIN_FIRST_NAME: z.string().default('Super'),
  SUPER_ADMIN_LAST_NAME: z.string().default('Admin'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${formatted}`);
  }

  return result.data;
}

export const env = validateEnv();

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
