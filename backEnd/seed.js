import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const seed = async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Delora_db',
  });

  console.log('Connected to database.');

  // 1. Create super_admin user (verified, no OTP needed)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);

  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', ['admin@delora.com']);
  if (existing.length > 0) {
    console.log('super_admin user already exists (admin@delora.com).');
    await db.query('UPDATE users SET username = ? WHERE email = ?', ['admin', 'admin@delora.com']);
    console.log('Updated username to "admin".');
  } else {
    await db.query(
      `INSERT INTO users (name, username, email, password_hash, phone, role, is_verified, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, TRUE)`,
      ['Admin', 'admin', 'admin@delora.com', passwordHash, '01000000000', 'super_admin']
    );
    console.log('Created super_admin: admin / admin123');
  }

  // 2. Create store_manager user
  const [existingMgr] = await db.query('SELECT id FROM users WHERE email = ?', ['manager@delora.com']);
  if (existingMgr.length > 0) {
    console.log('store_manager user already exists (manager@delora.com).');
    await db.query('UPDATE users SET username = ? WHERE email = ?', ['manager', 'manager@delora.com']);
    console.log('Updated username to "manager".');
  } else {
    const mgrHash = await bcrypt.hash('manager123', salt);
    await db.query(
      `INSERT INTO users (name, username, email, password_hash, phone, role, is_verified, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, TRUE)`,
      ['Store Manager', 'manager', 'manager@delora.com', mgrHash, '01000000001', 'store_manager']
    );
    console.log('Created store_manager: manager / manager123');
  }

  // 3. Create a customer user
  const [existingCust] = await db.query('SELECT id FROM users WHERE email = ?', ['customer@delora.com']);
  if (existingCust.length > 0) {
    console.log('customer user already exists (customer@delora.com).');
    await db.query('UPDATE users SET username = ? WHERE email = ?', ['customer', 'customer@delora.com']);
    console.log('Updated username to "customer".');
  } else {
    const custHash = await bcrypt.hash('customer123', salt);
    await db.query(
      `INSERT INTO users (name, username, email, password_hash, phone, role, is_verified, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, TRUE)`,
      ['Customer', 'customer', 'customer@delora.com', custHash, '01000000002', 'customer']
    );
    console.log('Created customer: customer / customer123');
  }

  await db.end();
  console.log('\nSeed complete! You can now login with:');
  console.log('  super_admin:   admin / admin123');
  console.log('  store_manager: manager / manager123');
  console.log('  customer:      customer / customer123');
};

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
