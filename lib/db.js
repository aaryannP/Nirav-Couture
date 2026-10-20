// PostgreSQL Database & Persistence Layer for ERA43 Web App
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { INITIAL_PRODUCTS } from './products-data.js';

let pool = null;

if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });

  pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client:', err);
  });
}

/**
 * Execute a parameterised query against PostgreSQL.
 * Errors are NEVER swallowed; fail-closed architecture is strictly enforced.
 */
let schemaInitialized = false;

export async function queryDb(text, params = []) {
  // Fail-closed architecture: Never return empty rows if database is unconfigured
  if (!pool) {
    throw new Error(
      '[DATABASE FAIL-CLOSED] PostgreSQL database is not configured (POSTGRES_URL / DATABASE_URL missing). ' +
      'All database queries fail closed without silent empty rows fallback.'
    );
  }

  // Auto-initialize tables on first query if pool is configured — fail closed if schema init fails
  if (!schemaInitialized && !text.includes('CREATE TABLE') && !text.includes('ALTER TABLE')) {
    schemaInitialized = true;
    try {
      await initDbSchema();
    } catch (schemaErr) {
      schemaInitialized = false; // Reset so caller knows schema failed
      console.error('[FATAL DB SCHEMA INITIALIZATION ERROR]', schemaErr);
      throw new Error(`[DATABASE SCHEMA INITIALIZATION FAILED] ${schemaErr.message}`);
    }
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
 * Initialize PostgreSQL tables. Throws error if DDL execution fails.
 */
export async function initDbSchema() {
  if (!pool) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[DB INIT ERROR] Cannot initialize schema: PostgreSQL pool is not configured in production.');
    }
    return false;
  }

  try {
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
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[DB Schema Init Error]', err.message);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// File-backed Persistence Store (Used ONLY in local development when PostgreSQL is not configured)
// ---------------------------------------------------------------------------
const DATA_FILE = path.join(process.cwd(), 'data', 'store.json');

function readStore() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[PERSISTENCE ERROR] File store fallback is strictly forbidden in production. PostgreSQL connection is mandatory.');
  }
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
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[PERSISTENCE ERROR] File store write is strictly forbidden in production. PostgreSQL connection is mandatory.');
  }
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Disk Store Write Error]', err);
    throw err;
  }
}

// ---- USERS REPOSITORY ----
export async function getUsers() {
  if (pool) {
    const res = await queryDb('SELECT id, name, email, role, phone, avatar, provider, created_at FROM users ORDER BY created_at DESC');
    return res.rows;
  }
  return readStore().users || [];
}

export async function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();
  if (pool) {
    const res = await queryDb('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (!res.rows[0]) return null;
    const u = res.rows[0];
    return {
      ...u,
      passwordHash: u.password_hash || u.passwordHash,
      otpCode: u.otp_code || u.otpCode,
      otpExpiresAt: u.otp_expires_at || u.otpExpiresAt,
      otpAttempts: typeof u.otp_attempts === 'number' ? u.otp_attempts : (u.otpAttempts || 0),
      loginAttempts: typeof u.login_attempts === 'number' ? u.login_attempts : (u.loginAttempts || 0),
      lockedUntil: u.locked_until || u.lockedUntil,
      isVerified: u.is_verified !== undefined ? u.is_verified : (u.isVerified !== undefined ? u.isVerified : true),
      securityKey: u.security_key || u.securityKey
    };
  }
  const users = await getUsers();
  return users.find(u => u.email.toLowerCase() === cleanEmail) || null;
}

export async function createUser(userData) {
  const cleanEmail = userData.email.toLowerCase().trim();
  if (pool) {
    await queryDb(
      `INSERT INTO users (id, name, email, password_hash, role, phone, avatar, provider, otp_code, otp_expires_at, otp_attempts, login_attempts, locked_until, is_verified, security_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        userData.id,
        userData.name,
        cleanEmail,
        userData.passwordHash,
        userData.role || 'CUSTOMER',
        userData.phone || '',
        userData.avatar || '',
        userData.provider || 'email',
        userData.otpCode || null,
        userData.otpExpiresAt || null,
        userData.otpAttempts || 0,
        userData.loginAttempts || 0,
        userData.lockedUntil || null,
        userData.isVerified !== undefined ? userData.isVerified : false,
        userData.securityKey || null
      ]
    );
    return userData;
  }

  const store = readStore();
  store.users = (store.users || []).filter(u => u.email.toLowerCase() !== cleanEmail);
  store.users.push(userData);
  writeStore(store);
  return userData;
}

export async function updateUser(email, updates) {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();
  if (pool) {
    const allowed = {
      name: 'name',
      passwordHash: 'password_hash',
      role: 'role',
      phone: 'phone',
      avatar: 'avatar',
      otpCode: 'otp_code',
      otpExpiresAt: 'otp_expires_at',
      otpAttempts: 'otp_attempts',
      loginAttempts: 'login_attempts',
      lockedUntil: 'locked_until',
      isVerified: 'is_verified',
      securityKey: 'security_key'
    };
    const setClauses = [];
    const values = [];
    let idx = 1;
    for (const [key, col] of Object.entries(allowed)) {
      if (updates[key] !== undefined) {
        setClauses.push(`${col} = $${idx++}`);
        values.push(updates[key]);
      }
    }
    if (setClauses.length === 0) return findUserByEmail(cleanEmail);
    values.push(cleanEmail);
    const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE LOWER(email) = $${idx} RETURNING *`;
    const res = await queryDb(sql, values);
    if (!res.rows[0]) return null;
    const u = res.rows[0];
    return {
      ...u,
      passwordHash: u.password_hash || u.passwordHash,
      otpCode: u.otp_code,
      otpExpiresAt: u.otp_expires_at,
      otpAttempts: u.otp_attempts,
      loginAttempts: u.login_attempts,
      lockedUntil: u.locked_until,
      isVerified: u.is_verified,
      securityKey: u.security_key
    };
  }

  const store = readStore();
  const existing = (store.users || []).find(u => u.email.toLowerCase() === cleanEmail);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  store.users = (store.users || []).map(u => u.email.toLowerCase() === cleanEmail ? updated : u);
  writeStore(store);
  return updated;
}

// ---- PRODUCTS REPOSITORY ----
export async function getProducts() {
  if (pool) {
    const res = await queryDb('SELECT * FROM products ORDER BY created_at DESC');
    // Authoritative PostgreSQL state: return table rows directly without fallback to INITIAL_PRODUCTS
    return res.rows.map(p => ({
      ...p,
      fitType: p.fit_type || p.fitType,
      originalPrice: p.original_price || p.originalPrice,
      frontImage: p.front_image || p.frontImage,
      backImage: p.back_image || p.backImage,
      images: Array.isArray(p.images)
        ? p.images
        : (typeof p.images === 'string'
            ? (() => { try { return JSON.parse(p.images); } catch { return [p.front_image || p.frontImage, p.back_image || p.backImage]; } })()
            : [p.front_image || p.frontImage, p.back_image || p.backImage].filter(Boolean))
    }));
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('[PERSISTENCE ERROR] File store fallback is strictly forbidden in production. PostgreSQL connection is mandatory.');
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
    const allowedFields = {
      title: 'title',
      slug: 'slug',
      category: 'category',
      fitType: 'fit_type',
      price: 'price',
      originalPrice: 'original_price',
      stock: 'stock',
      fabric: 'fabric',
      description: 'description',
      frontImage: 'front_image',
      backImage: 'back_image',
      badge: 'badge',
      isFeatured: 'is_featured',
      isBestseller: 'is_bestseller'
    };

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, col] of Object.entries(allowedFields)) {
      if (updates[key] !== undefined) {
        setClauses.push(`${col} = $${paramIndex++}`);
        values.push(updates[key]);
      }
    }

    if (updates.sizes !== undefined) {
      setClauses.push(`sizes = $${paramIndex++}`);
      values.push(typeof updates.sizes === 'string' ? updates.sizes : JSON.stringify(updates.sizes));
    }
    if (updates.colors !== undefined) {
      setClauses.push(`colors = $${paramIndex++}`);
      values.push(typeof updates.colors === 'string' ? updates.colors : JSON.stringify(updates.colors));
    }
    if (updates.images !== undefined) {
      setClauses.push(`images = $${paramIndex++}`);
      values.push(typeof updates.images === 'string' ? updates.images : JSON.stringify(updates.images));
    }

    if (setClauses.length === 0) {
      return await findProductById(id);
    }

    values.push(id);
    const sql = `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const res = await queryDb(sql, values);
    if (res.rows.length === 0) return null;
    const p = res.rows[0];
    return {
      ...p,
      fitType: p.fit_type || p.fitType,
      originalPrice: p.original_price || p.originalPrice,
      frontImage: p.front_image || p.frontImage,
      backImage: p.back_image || p.backImage,
      images: Array.isArray(p.images)
        ? p.images
        : (typeof p.images === 'string'
            ? (() => { try { return JSON.parse(p.images); } catch { return [p.front_image, p.back_image]; } })()
            : [p.front_image, p.back_image].filter(Boolean))
    };
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
    await queryDb('DELETE FROM products WHERE id = $1', [id]);
    return true;
  }

  const store = readStore();
  store.products = (store.products || INITIAL_PRODUCTS).filter(p => p.id !== id);
  writeStore(store);
  return true;
}

/**
 * Atomically verifies and deducts product stock.
 * Prevents negative stock and overselling race conditions.
 */
export async function deductProductStock(productId, quantity) {
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    throw new Error('Invalid deduction quantity');
  }

  if (pool) {
    const res = await queryDb(
      `UPDATE products 
       SET stock = stock - $1 
       WHERE id = $2 AND stock >= $1 
       RETURNING id, title, stock`,
      [qty, productId]
    );
    if (res.rows.length === 0) {
      return { success: false, reason: 'OUT_OF_STOCK' };
    }
    return { success: true, updatedStock: res.rows[0].stock };
  }

  const store = readStore();
  const prod = (store.products || INITIAL_PRODUCTS).find(p => p.id === productId);
  if (!prod) return { success: false, reason: 'PRODUCT_NOT_FOUND' };
  const currentStock = typeof prod.stock === 'number' ? prod.stock : 50;
  if (currentStock < qty) {
    return { success: false, reason: 'OUT_OF_STOCK' };
  }
  prod.stock = currentStock - qty;
  store.products = (store.products || INITIAL_PRODUCTS).map(p => p.id === productId ? prod : p);
  writeStore(store);
  return { success: true, updatedStock: prod.stock };
}

// ---- ORDERS REPOSITORY ----
export async function getOrders() {
  if (pool) {
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
      paymentMethod: o.payment_method || o.paymentMethod,
      paymentStatus: o.payment_status || o.paymentStatus || 'PENDING',
      orderStatus: o.order_status || o.orderStatus || o.status || 'PENDING',
      status: o.status || o.order_status || 'PENDING',
      idempotencyKey: o.idempotency_key || o.idempotencyKey
    }));
  }
  return readStore().orders || [];
}

export async function findOrderByIdempotencyKey(key) {
  if (!key) return null;
  if (pool) {
    const res = await queryDb('SELECT * FROM orders WHERE idempotency_key = $1 LIMIT 1', [key]);
    if (res.rows.length > 0) {
      const o = res.rows[0];
      return {
        ...o,
        userId: o.user_id || o.userId,
        customerName: o.customer_name || o.customerName,
        customerEmail: o.customer_email || o.customerEmail,
        shippingAddress: o.shipping_address || o.shippingAddress,
        totalAmount: o.total_amount || o.totalAmount,
        discountAmount: o.discount_amount || o.discountAmount,
        finalTotal: o.final_total || o.finalTotal,
        paymentMethod: o.payment_method || o.paymentMethod,
        paymentStatus: o.payment_status || o.paymentStatus || 'PENDING',
        orderStatus: o.order_status || o.orderStatus || o.status || 'PENDING',
        status: o.status || o.order_status || 'PENDING',
        idempotencyKey: o.idempotency_key || o.idempotencyKey
      };
    }
    return null;
  }
  const store = readStore();
  return (store.orders || []).find(o => o.idempotencyKey === key) || null;
}

export async function createOrder(orderData) {
  if (pool) {
    await queryDb(
      `INSERT INTO orders (id, user_id, customer_name, customer_email, phone, shipping_address, total_amount, discount_amount, final_total, payment_method, payment_status, order_status, status, idempotency_key, items)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
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
        orderData.paymentStatus || 'PENDING',
        orderData.orderStatus || 'PENDING',
        orderData.status || orderData.orderStatus || 'PENDING',
        orderData.idempotencyKey || null,
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

/**
 * ATOMIC DATABASE TRANSACTION: Order Creation & Stock Reservation
 * Executes inside a single BEGIN ... COMMIT block.
 * If any product has insufficient stock or order insertion fails,
 * the entire transaction is rolled back, guaranteeing consistency.
 */
export async function createOrderWithAtomicStockDeduction(orderData) {
  if (pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Transactionally check & reserve stock for all items
      for (const item of orderData.items) {
        const qty = parseInt(item.qty, 10);
        const res = await client.query(
          `UPDATE products 
           SET stock = stock - $1 
           WHERE id = $2 AND stock >= $1 
           RETURNING id, title, stock`,
          [qty, item.id]
        );

        if (res.rows.length === 0) {
          await client.query('ROLLBACK');
          return {
            success: false,
            error: `Insufficient stock for "${item.title}". Transaction rolled back.`
          };
        }
      }

      // 2. Insert order inside the same atomic transaction
      await client.query(
        `INSERT INTO orders (id, user_id, customer_name, customer_email, phone, shipping_address, total_amount, discount_amount, final_total, payment_method, payment_status, order_status, status, idempotency_key, items)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
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
          orderData.paymentStatus || 'PENDING',
          orderData.orderStatus || 'PENDING',
          orderData.status || orderData.orderStatus || 'PENDING',
          orderData.idempotencyKey || null,
          JSON.stringify(orderData.items)
        ]
      );

      await client.query('COMMIT');
      return { success: true, data: orderData };
    } catch (err) {
      await client.query('ROLLBACK');
      if (err.code === '23505' && orderData.idempotencyKey) {
        // Concurrent race condition: competing transaction committed first.
        // Recover and return the already-committed order safely without double-charging or stock error.
        const existing = await findOrderByIdempotencyKey(orderData.idempotencyKey);
        if (existing) {
          return { success: true, data: existing, idempotentReplay: true };
        }
      }
      console.error('[DB Order Transaction Error]', err);
      throw err;
    } finally {
      client.release();
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('[DATABASE FAIL-CLOSED] PostgreSQL connection is mandatory in production for order creation.');
  }

  // Development/Test file-store atomic transaction simulation
  const store = readStore();
  if (orderData.idempotencyKey) {
    const existing = (store.orders || []).find(o => o.idempotencyKey === orderData.idempotencyKey);
    if (existing) {
      return { success: true, data: existing, idempotentReplay: true };
    }
  }
  const prods = store.products || INITIAL_PRODUCTS;

  // Pre-validate all stocks before making any mutation
  for (const item of orderData.items) {
    const qty = parseInt(item.qty, 10);
    const p = prods.find(x => x.id === item.id);
    if (!p || (p.stock || 50) < qty) {
      return {
        success: false,
        error: `Insufficient stock for "${item.title}". Transaction aborted.`
      };
    }
  }

  // Atomically decrement stock
  for (const item of orderData.items) {
    const qty = parseInt(item.qty, 10);
    const p = prods.find(x => x.id === item.id);
    p.stock -= qty;
  }

  store.orders = [orderData, ...(store.orders || [])];
  writeStore(store);
  return { success: true, data: orderData };
}

export async function updateOrderStatus(id, newStatus, newPaymentStatus = null) {
  if (pool) {
    if (newPaymentStatus) {
      await queryDb('UPDATE orders SET status = $1, order_status = $1, payment_status = $2 WHERE id = $3', [newStatus, newPaymentStatus, id]);
    } else {
      await queryDb('UPDATE orders SET status = $1, order_status = $1 WHERE id = $2', [newStatus, id]);
    }
    return true;
  }

  const store = readStore();
  store.orders = (store.orders || []).map(o => {
    if (o.id === id) {
      return {
        ...o,
        status: newStatus,
        orderStatus: newStatus,
        ...(newPaymentStatus ? { paymentStatus: newPaymentStatus } : {})
      };
    }
    return o;
  });
  writeStore(store);
  return true;
}

