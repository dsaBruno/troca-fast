import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']),
  HOST: z.string(),
  PORT: z.coerce.number(),
  DATABASE_URL: z.string(),
  DATABASE: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  SMTP_ID: z.string(),
  SMTP_PASS: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  URL_IMAGE: z.string(),
  JWT_SECRET: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error('❌ Invalid environment variables', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
