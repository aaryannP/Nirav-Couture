// PostgreSQL Database & Fallback Layer for ERA43 Web App
import { Pool } from 'pg';

let pool;

if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client:', err);
  });
}

/**
 * Execute a parameterised query against PostgreSQL.
 * Falls back gracefully with an empty rows array if DB is not configured.
 * @param {string} text - SQL query string with $1, $2 placeholders
 * @param {Array} params - Query parameter values
 * @returns {Promise<{rows: Array}>}
 */
export async function queryDb(text, params) {
  if (!pool) {
    console.warn('[DB Fallback] PostgreSQL not configured. Using in-memory mock data.');
    return { rows: [] };
  }
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } catch (err) {
    console.error('[DB Error]', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Check if database is connected and reachable.
 * @returns {Promise<boolean>}
 */
export async function isDbConnected() {
  if (!pool) return false;
  try {
    await queryDb('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
