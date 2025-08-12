// config.ts
import 'dotenv/config';

function required<K extends keyof NodeJS.ProcessEnv>(name: K): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing env var: ${name}`);
  return val;
}

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: required('JWT_SECRET'),
  databaseUrl: required('DATABASE_URL'),
  isProd: (process.env.NODE_ENV ?? 'development') === 'production',
} as const;
