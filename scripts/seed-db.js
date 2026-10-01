const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nirav_couture',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedDatabase() {
  console.log('🚀 Initializing PostgreSQL Database Schema for ERA43...');
  
  try {
    // 1. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        role VARCHAR(32) DEFAULT 'CUSTOMER',
        phone VARCHAR(32),
        avatar TEXT,
        provider VARCHAR(32) DEFAULT 'email',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Products Table (Men's T-Shirts)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(64) NOT NULL,
        fit_type VARCHAR(64) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        original_price NUMERIC(10, 2),
        rating NUMERIC(3, 2) DEFAULT 5.0,
        reviews_count INT DEFAULT 0,
        badge VARCHAR(64),
        fabric TEXT,
        description TEXT,
        front_image TEXT NOT NULL,
        back_image TEXT NOT NULL,
        stock INT DEFAULT 50,
        is_featured BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Orders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(32) NOT NULL,
        shipping_address TEXT NOT NULL,
        total_amount NUMERIC(10, 2) NOT NULL,
        discount_amount NUMERIC(10, 2) DEFAULT 0,
        final_total NUMERIC(10, 2) NOT NULL,
        payment_method VARCHAR(64) NOT NULL,
        status VARCHAR(32) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✓ PostgreSQL Tables (users, products, orders) Created Successfully!');
    console.log('🎉 1-Click Database Seeding Complete!');
  } catch (err) {
    console.error('❌ Database Seeding Error:', err.message);
  } finally {
    await pool.end();
  }
}

seedDatabase();
