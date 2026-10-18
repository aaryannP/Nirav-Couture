// Data Sync & Seeding Script: Sync store.json Users and Orders into Neon PostgreSQL
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Auto-load .env.local
if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath) && typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile(envLocalPath);
    } catch {}
  }
}

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is missing.');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function syncData() {
  console.log('🔄 Checking and syncing users & demo orders to Neon PostgreSQL...');
  const storePath = path.join(process.cwd(), 'data', 'store.json');
  if (!fs.existsSync(storePath)) {
    console.log('No store.json found to sync.');
    await pool.end();
    return;
  }

  const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

  // 1. Sync Users
  let usersAdded = 0;
  for (const u of store.users || []) {
    const res = await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, phone, avatar, provider)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [
        u.id,
        u.name,
        u.email.toLowerCase(),
        u.passwordHash,
        u.role || 'CUSTOMER',
        u.phone || '',
        u.avatar || '',
        u.provider || 'email'
      ]
    );
    if (res.rows.length > 0) usersAdded++;
  }

  // 2. Sync Orders
  let ordersAdded = 0;
  for (const o of store.orders || []) {
    const res = await pool.query(
      `INSERT INTO orders (id, user_id, customer_name, customer_email, phone, shipping_address, total_amount, discount_amount, final_total, payment_method, payment_status, order_status, status, idempotency_key, items)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO NOTHING
       RETURNING id`,
      [
        o.id,
        o.userId || 'guest',
        o.customerName,
        o.customerEmail || '',
        o.phone || '',
        o.shippingAddress || '',
        o.totalAmount || 0,
        o.discountAmount || 0,
        o.finalTotal || o.totalAmount || 0,
        o.paymentMethod || 'Cash on Delivery (COD)',
        o.paymentStatus || 'PENDING',
        o.orderStatus || o.status || 'CONFIRMED',
        o.status || o.orderStatus || 'CONFIRMED',
        o.idempotencyKey || null,
        JSON.stringify(o.items || [])
      ]
    );
    if (res.rows.length > 0) ordersAdded++;
  }

  const [pCount, uCount, oCount] = await Promise.all([
    pool.query('SELECT count(*) FROM products'),
    pool.query('SELECT count(*) FROM users'),
    pool.query('SELECT count(*) FROM orders')
  ]);

  console.log(`✅ Neon Database Synced Successfully:`);
  console.log(`   - Products in DB: ${pCount.rows[0].count}`);
  console.log(`   - Users in DB:    ${uCount.rows[0].count} (+${usersAdded} new)`);
  console.log(`   - Orders in DB:   ${oCount.rows[0].count} (+${ordersAdded} new)`);

  await pool.end();
}

syncData().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
