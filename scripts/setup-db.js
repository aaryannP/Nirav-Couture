// Standalone PostgreSQL Database Initialization & Migration Script for ERA43
const { Pool } = require('pg');

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.log('⚠️  DATABASE_URL or POSTGRES_URL is not set.');
  console.log('ℹ️  To connect to cloud PostgreSQL (e.g. Neon, Supabase, Render):');
  console.log('   Set DATABASE_URL=postgres://user:password@host:5432/dbname and rerun.');
  process.exit(0);
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runMigration() {
  console.log('🔄 Initializing ERA43 PostgreSQL Database Schema...');
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(180) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'CUSTOMER',
        phone VARCHAR(40),
        avatar TEXT,
        provider VARCHAR(32) DEFAULT 'email',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        slug VARCHAR(200) UNIQUE NOT NULL,
        category VARCHAR(64),
        fit_type VARCHAR(100),
        price NUMERIC(10, 2) NOT NULL,
        original_price NUMERIC(10, 2),
        stock INTEGER DEFAULT 50,
        fabric TEXT,
        description TEXT,
        sizes JSONB,
        colors JSONB,
        front_image TEXT,
        back_image TEXT,
        images JSONB,
        badge VARCHAR(50),
        is_featured BOOLEAN DEFAULT false,
        is_bestseller BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        customer_name VARCHAR(120),
        customer_email VARCHAR(180),
        phone VARCHAR(40),
        shipping_address TEXT,
        total_amount NUMERIC(10, 2) NOT NULL,
        discount_amount NUMERIC(10, 2) DEFAULT 0,
        final_total NUMERIC(10, 2) NOT NULL,
        payment_method VARCHAR(80),
        payment_status VARCHAR(40) DEFAULT 'PENDING',
        order_status VARCHAR(40) DEFAULT 'PENDING',
        status VARCHAR(40) DEFAULT 'PENDING',
        idempotency_key VARCHAR(128),
        items JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(40) DEFAULT 'PENDING';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(40) DEFAULT 'PENDING';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency ON orders (idempotency_key) WHERE idempotency_key IS NOT NULL;
    `);
    console.log('✅ PostgreSQL Schema initialized successfully (users, products, orders tables ready).');
  } catch (err) {
    console.error('❌ Migration Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
