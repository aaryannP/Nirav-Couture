// PostgreSQL Database & Persistence Layer for ERA43 Web App
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { INITIAL_PRODUCTS } from './products-data';

let pool = null;

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
 * When pool is configured, errors are thrown authoritatively (no silent fallback).
 */
let schemaInitialized = false;

export async function queryDb(text, params = []) {
  if (!pool) {
    return { rows: [] };
  }

  // Auto-initialize tables on first query if pool is configured
  if (!schemaInitialized && !text.includes('CREATE TABLE')) {
    schemaInitialized = true;
    await initDbSchema().catch((err) => {
      console.error('[DB Schema Auto-Init Warning]', err.message);
    });
  }

  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } catch (err) {
    console.error('[DB Query Error]', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Check if PostgreSQL database is connected and reachable.
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

/**
 * Initialize PostgreSQL tables if connected.
 */
export async function initDbSchema() {
  if (!pool) return false;
  try {
    await queryDb(`
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
        status VARCHAR(40) DEFAULT 'CONFIRMED',
        items JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    return true;
  } catch (err) {
    console.error('[DB Schema Init Error]', err.message);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// File-backed Persistence Store (Used ONLY when PostgreSQL is not configured)
// ---------------------------------------------------------------------------
const DATA_FILE = path.join(process.cwd(), 'data', 'store.json');

function readStore() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = { users: [], orders: [], products: INITIAL_PRODUCTS };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.products || parsed.products.length === 0) {
      parsed.products = INITIAL_PRODUCTS;
    }
    return parsed;
  } catch {
    return { users: [], orders: [], products: INITIAL_PRODUCTS };
  }
}

function writeStore(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Disk Store Write Error]', err);
  }
}

// ---- USERS REPOSITORY ----
export async function getUsers() {
  if (pool) {
    // Authoritative PostgreSQL query
    const res = await queryDb('SELECT id, name, email, role, phone, avatar, provider, created_at FROM users ORDER BY created_at DESC');
    return res.rows;
  }
  return readStore().users || [];
}

export async function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();
  if (pool) {
    // Authoritative PostgreSQL query
    const res = await queryDb('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    return res.rows[0] || null;
  }
  const users = await getUsers();
  return users.find(u => u.email.toLowerCase() === cleanEmail) || null;
}

export async function createUser(userData) {
  if (pool) {
    // Authoritative PostgreSQL write — throws error on failure (no silent mask)
    await queryDb(
      `INSERT INTO users (id, name, email, password_hash, role, phone, avatar, provider)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userData.id,
        userData.name,
        userData.email.toLowerCase().trim(),
        userData.passwordHash,
        userData.role || 'CUSTOMER',
        userData.phone || '',
        userData.avatar || '',
        userData.provider || 'email'
      ]
    );
    return userData;
  }

  // Local development file-store sync
  const store = readStore();
  store.users = (store.users || []).filter(u => u.email.toLowerCase() !== userData.email.toLowerCase());
  store.users.push(userData);
  writeStore(store);
  return userData;
}

// ---- PRODUCTS REPOSITORY ----
export async function getProducts() {
  if (pool) {
    // Authoritative PostgreSQL query
    const res = await queryDb('SELECT * FROM products ORDER BY created_at DESC');
    if (res.rows.length > 0) {
      return res.rows.map(p => ({
        ...p,
        fitType: p.fit_type || p.fitType,
        originalPrice: p.original_price || p.originalPrice,
        frontImage: p.front_image || p.frontImage,
        backImage: p.back_image || p.backImage
      }));
    }
    return INITIAL_PRODUCTS;
  }
  const store = readStore();
  return store.products && store.products.length > 0 ? store.products : INITIAL_PRODUCTS;
}

export async function findProductById(id) {
  const products = await getProducts();
  return products.find(p => p.id === id) || null;
}

export async function findProductBySlug(slug) {
  const products = await getProducts();
  return products.find(p => p.slug === slug) || null;
}

export async function createProduct(prod) {
  if (pool) {
    // Authoritative PostgreSQL write
    await queryDb(
      `INSERT INTO products (id, title, slug, category, fit_type, price, original_price, stock, fabric, description, sizes, colors, front_image, back_image, images, badge)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        prod.id,
        prod.title,
        prod.slug,
        prod.category,
        prod.fitType,
        prod.price,
        prod.originalPrice,
        prod.stock,
        prod.fabric,
        prod.description,
        JSON.stringify(prod.sizes),
        JSON.stringify(prod.colors),
        prod.frontImage,
        prod.backImage,
        JSON.stringify(prod.images || [prod.frontImage, prod.backImage]),
        prod.badge
      ]
    );
    return prod;
  }

  const store = readStore();
  store.products = [prod, ...(store.products || INITIAL_PRODUCTS).filter(p => p.id !== prod.id)];
  writeStore(store);
  return prod;
}

export async function updateProduct(id, updates) {
  if (pool) {
    // Authoritative PostgreSQL update
    await queryDb(
      `UPDATE products SET title = $1, price = $2, stock = $3, badge = $4, description = $5 WHERE id = $6`,
      [updates.title, updates.price, updates.stock, updates.badge, updates.description, id]
    );
    return { id, ...updates };
  }

  const store = readStore();
  const current = (store.products || INITIAL_PRODUCTS).find(p => p.id === id);
  if (!current) return null;

  const updated = { ...current, ...updates };
  store.products = (store.products || INITIAL_PRODUCTS).map(p => p.id === id ? updated : p);
  writeStore(store);
  return updated;
}

export async function deleteProduct(id) {
  if (pool) {
    // Authoritative PostgreSQL delete
    await queryDb('DELETE FROM products WHERE id = $1', [id]);
    return true;
  }

  const store = readStore();
  store.products = (store.products || INITIAL_PRODUCTS).filter(p => p.id !== id);
  writeStore(store);
  return true;
}

// ---- ORDERS REPOSITORY ----
export async function getOrders() {
  if (pool) {
    // Authoritative PostgreSQL query
    const res = await queryDb('SELECT * FROM orders ORDER BY created_at DESC');
    return res.rows.map(o => ({
      ...o,
      userId: o.user_id || o.userId,
      customerName: o.customer_name || o.customerName,
      customerEmail: o.customer_email || o.customerEmail,
      shippingAddress: o.shipping_address || o.shippingAddress,
      totalAmount: o.total_amount || o.totalAmount,
      discountAmount: o.discount_amount || o.discountAmount,
      finalTotal: o.final_total || o.finalTotal,
      paymentMethod: o.payment_method || o.paymentMethod
    }));
  }
  return readStore().orders || [];
}

export async function createOrder(orderData) {
  if (pool) {
    // Authoritative PostgreSQL write — throws error on failure
    await queryDb(
      `INSERT INTO orders (id, user_id, customer_name, customer_email, phone, shipping_address, total_amount, discount_amount, final_total, payment_method, status, items)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        orderData.id,
        orderData.userId,
        orderData.customerName,
        orderData.customerEmail,
        orderData.phone,
        orderData.shippingAddress,
        orderData.totalAmount,
        orderData.discountAmount,
        orderData.finalTotal,
        orderData.paymentMethod,
        orderData.status || 'CONFIRMED',
        JSON.stringify(orderData.items)
      ]
    );
    return orderData;
  }

  const store = readStore();
  store.orders = [orderData, ...(store.orders || [])];
  writeStore(store);
  return orderData;
}

export async function updateOrderStatus(id, newStatus) {
  if (pool) {
    // Authoritative PostgreSQL update
    await queryDb('UPDATE orders SET status = $1 WHERE id = $2', [newStatus, id]);
    return true;
  }

  const store = readStore();
  store.orders = (store.orders || []).map(o => o.id === id ? { ...o, status: newStatus } : o);
  writeStore(store);
  return true;
}
