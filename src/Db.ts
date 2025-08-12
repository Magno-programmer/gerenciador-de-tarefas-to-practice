// db.ts
import { Pool } from 'pg';
import { config } from './config';

export const pool = new Pool({
  connectionString: config.databaseUrl,
  // Se precisar de SSL em produção (Heroku/Railway, etc), descomente:
  // ssl: config.isProd ? { rejectUnauthorized: false } : undefined,
});

export const db = {
  query<T = any>(text: string, params?: any[]) {
    return pool.query<T>(text, params);
  },
};

// Encerramento do pool ao matar o processo
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});
