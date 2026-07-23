import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createTables = async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Delora_db',
  });

  console.log('Connected to database.');

  // 1. Create payment_methods table if not exists
  await db.query(`
    CREATE TABLE IF NOT EXISTS payment_methods (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      logo_url VARCHAR(500),
      brand_color VARCHAR(20) DEFAULT '#000000',
      priority INT DEFAULT 0,
      is_default BOOLEAN DEFAULT FALSE,
      payment_type VARCHAR(50) DEFAULT 'offline',
      qr_code TEXT,
      receiver_info TEXT,
      require_screenshot BOOLEAN DEFAULT FALSE,
      require_transaction_id BOOLEAN DEFAULT FALSE,
      status VARCHAR(20) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Table payment_methods created (or already exists).');

  // 2. Add missing columns to contacts if they don't exist
  const addColumn = async (col, def) => {
    try {
      await db.query(`ALTER TABLE contacts ADD COLUMN ${col} ${def}`);
      console.log(`Column contacts.${col} added.`);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log(`Column contacts.${col} already exists.`);
      } else {
        console.error(`Error adding contacts.${col}:`, e.message);
      }
    }
  };

  await addColumn('phone', "VARCHAR(20) NULL AFTER email");
  await addColumn('type', "VARCHAR(50) DEFAULT 'inquiry' AFTER subject");
  await addColumn('ticket_id', "VARCHAR(50) NULL AFTER type");
  await addColumn('admin_reply', "TEXT NULL AFTER message");
  await addColumn('status', "VARCHAR(20) DEFAULT 'OPEN' AFTER admin_reply");
  await addColumn('is_read', "BOOLEAN DEFAULT FALSE AFTER status");

  // 3. Add created_at to categories if missing
  try {
    await db.query(`ALTER TABLE categories ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    console.log('Column categories.created_at added.');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Column categories.created_at already exists.');
    } else {
      console.error('Error adding categories.created_at:', e.message);
    }
  }

  // 4. Add username column to users if missing
  try {
    await db.query(`ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE NULL AFTER name`);
    console.log('Column users.username added.');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Column users.username already exists.');
    } else {
      console.error('Error adding users.username:', e.message);
    }
  }

  await db.end();
  console.log('\nAll tables/columns ready!');
};

createTables().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
