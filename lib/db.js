// PostgreSQL Database & Fallback Layer for NIRAV Web App
import { Pool } from 'pg';

let pool;

if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
}

export async function queryDb(text, params) {
  if (!pool) {
    // If local PostgreSQL environment variables are not set yet, return graceful fallback log
    console.log('[DB Fallback] PostgreSQL Pool not initialized. Using in-memory state.');
    return { rows: [] };
  }
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}
