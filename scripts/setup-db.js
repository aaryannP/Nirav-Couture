// Standalone PostgreSQL Database Initialization & Migration Script for ERA43
const { Pool } = require('pg');

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ FATAL: DATABASE_URL or POSTGRES_URL environment variable is not set.');
  console.error('   Database migration cannot proceed without a valid PostgreSQL connection string.');
  console.error('   Example: DATABASE_URL=postgres://user:password@host:5432/dbname');
  process.exit(1);
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

      -- Seed Initial Products Catalog if empty
      INSERT INTO products (id, title, slug, category, fit_type, price, original_price, stock, fabric, description, sizes, colors, front_image, back_image, images, badge)
      VALUES 
      ('era43-ts-001', 'ERA43 Heavyweight Acid Wash Oversized Tee', 'heavyweight-acid-wash-oversized-tee', 'oversized', 'Oversized Drop-Shoulder', 1499, 1999, 45, '240 GSM 100% Bio-Washed Combed Cotton', 'Signature oversized drop-shoulder graphic T-shirt featuring hand-processed acid wash texture.', '["S","M","L","XL","XXL"]', '[{"name":"Acid Charcoal","hex":"#2b2b2c"}]', '/images/products/ts-001-front.jpg', '/images/products/ts-001-hover.jpg', '["/images/products/ts-001-front.jpg"]', 'BESTSELLER'),
      ('era43-ts-002', 'ERA43 Signature Crest Graphic Vintage Tee', 'signature-crest-graphic-vintage-tee', 'graphic', 'Relaxed Vintage Fit', 1299, 1699, 30, '220 GSM 100% Premium Cotton', 'Retro street vintage T-shirt featuring classic ERA43 embroidered crest.', '["S","M","L","XL"]', '[{"name":"Washed Off-White","hex":"#f5f0e6"}]', '/images/products/ts-002-front.jpg', '/images/products/ts-002-hover.jpg', '["/images/products/ts-002-front.jpg"]', 'NEW DROP'),
      ('era43-ts-003', 'ERA43 Luxury Silk-Cotton Blend Crew Tee', 'luxury-silk-cotton-blend-crew-tee', 'luxury', 'Tailored Slim Fit', 2499, 3299, 18, '30% Mulberry Silk / 70% Extra-Long Staple Cotton', 'Ultra-soft luxury t-shirt crafted from mulberry silk.', '["M","L","XL"]', '[{"name":"Champagne Ivory","hex":"#f0e6d2"}]', '/images/products/ts-003-front.jpg', '/images/products/ts-003-hover.jpg', '["/images/products/ts-003-front.jpg"]', 'COUTURE'),
      ('era43-ts-004', 'ERA43 Minimalist Organic Pique Polo Tee', 'minimalist-organic-pique-polo-tee', 'polo', 'Modern Regular Fit', 1799, 2299, 50, '230 GSM 100% Organic Pique Cotton', 'Classic pique knit polo shirt featuring mother-of-pearl buttons.', '["S","M","L","XL","XXL"]', '[{"name":"Obsidian Black","hex":"#141414"}]', '/images/products/ts-004-front.jpg', '/images/products/ts-004-hover.jpg', '["/images/products/ts-004-front.jpg"]', 'ESSENTIAL'),
      ('era43-ts-005', 'ERA43 Raw Textured Japanese Cotton Tee', 'raw-textured-japanese-cotton-tee', 'oversized', 'Heavyweight Boxy Fit', 1899, 2499, 25, '260 GSM Heavy Raw Slub Cotton', 'Structured boxy T-shirt made from heavyweight Japanese raw slub cotton.', '["S","M","L","XL"]', '[{"name":"Raw Oatmeal","hex":"#e5ded4"}]', '/images/products/ts-005-front.jpg', '/images/products/ts-005-hover.jpg', '["/images/products/ts-005-front.jpg"]', 'LIMITED'),
      ('era43-ts-006', 'ERA43 Vintage Distressed Graphic Tee - V2', 'vintage-distressed-graphic-tee-v2', 'graphic', 'Oversized Street Fit', 1599, 2099, 35, '240 GSM Bio-Washed Heavy Cotton', 'Distressed edge detailing around collar and sleeves with vintage urban artwork.', '["M","L","XL","XXL"]', '[{"name":"Distressed Black","hex":"#1e1e1e"}]', '/images/products/ts-006-front.jpg', '/images/products/ts-006-hover.jpg', '["/images/products/ts-006-front.jpg"]', 'TRENDING')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ PostgreSQL Schema initialized successfully (users, products, orders tables ready & products seeded).');
  } catch (err) {
    console.error('❌ Migration Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
