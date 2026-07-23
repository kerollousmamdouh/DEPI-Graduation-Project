import 'dotenv/config';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import fs from 'fs';

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Generate hashes
const salt = await bcrypt.genSalt(10);
const hashes = {
  admin123: await bcrypt.hash('admin123', salt),
  manager123: await bcrypt.hash('manager123', salt),
  customer123: await bcrypt.hash('customer123', salt),
};

console.log('admin123 hash:', hashes.admin123);
console.log('manager123 hash:', hashes.manager123);
console.log('customer123 hash:', hashes.customer123);

// Insert users
const users = [
  ['Admin', 'admin', 'admin@delora.com', hashes.admin123, '01000000000', 'super_admin'],
  ['Store Manager', 'manager', 'manager@delora.com', hashes.manager123, '01000000001', 'store_manager'],
  ['Customer', 'customer', 'customer@delora.com', hashes.customer123, '01000000002', 'customer'],
];

for (const [name, username, email, hash, phone, role] of users) {
  try {
    await db.query(
      'INSERT INTO users (name, username, email, password_hash, phone, role, is_verified, is_active) VALUES (?,?,?,?,?,?,TRUE,TRUE)',
      [name, username, email, hash, phone, role]
    );
    console.log('Created:', username);
  } catch (e) {
    console.log('Error ' + username + ':', e.message);
  }
}

// Seed store_settings
const settings = [
  ['store_name_ar', 'ديالرا سوبر ماركت', null, 'اسم المتجر', 'Store Name'],
  ['store_name_en', null, 'Delora Supermarket', 'اسم المتجر', 'Store Name'],
  ['hotline', '16000', null, 'خط الساخن', 'Hotline'],
  ['email_contact', 'info@delora.com', null, 'البريد الإلكتروني', 'Email'],
  ['facebook_link', 'https://facebook.com/delora', null, 'فيسبوك', 'Facebook'],
  ['instagram_link', 'https://instagram.com/delora', null, 'انستغرام', 'Instagram'],
  ['twitter_link', 'https://twitter.com/delora', null, 'تويتر', 'Twitter'],
  ['working_hours_ar', '9 ص - 12 م يومياً', null, 'ساعات العمل', 'Working Hours'],
  ['address_ar', 'شارع التحرير، القاهرة', 'Tahrir Street, Cairo', 'العنوان', 'Address'],
  ['footer_description_ar', 'ديالرا - تسوقة ذكية لكل العائلة', 'Delora - Smart Shopping for the Whole Family', 'وصف الفوتر', 'Footer Description'],
  ['site_name_ar', 'ديالرا', 'Delora', 'اسم الموقع', 'Site Name'],
  ['site_description_ar', 'سوبر ماركت أونلاين', 'Online Supermarket', 'وصف الموقع', 'Site Description'],
];

for (const row of settings) {
  await db.query(
    'INSERT INTO store_settings (key_name, key_value_ar, key_value_en, display_name_ar, display_name_en) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE key_value_ar=VALUES(key_value_ar), key_value_en=VALUES(key_value_en)',
    row
  );
}
console.log('Seeded', settings.length, 'store settings');

// Generate SQL seed file with the hashes
const sqlSeed = `
-- ============================================
-- SEED DATA (append after your CREATE TABLE statements)
-- ============================================

-- Test users (passwords: admin123, manager123, customer123)
INSERT INTO users (name, username, email, password_hash, phone, role, is_verified, is_active) VALUES
('Admin', 'admin', 'admin@delora.com', '${hashes.admin123}', '01000000000', 'super_admin', TRUE, TRUE),
('Store Manager', 'manager', 'manager@delora.com', '${hashes.manager123}', '01000000001', 'store_manager', TRUE, TRUE),
('Customer', 'customer', 'customer@delora.com', '${hashes.customer123}', '01000000002', 'customer', TRUE, TRUE)
ON DUPLICATE KEY UPDATE username=VALUES(username), role=VALUES(role), is_verified=TRUE, is_active=TRUE;

-- Store settings
INSERT INTO store_settings (key_name, key_value_ar, key_value_en, display_name_ar, display_name_en) VALUES
('store_name_ar', 'ديالرا سوبر ماركت', NULL, 'اسم المتجر', 'Store Name'),
('store_name_en', NULL, 'Delora Supermarket', 'اسم المتجر', 'Store Name'),
('hotline', '16000', NULL, 'خط الساخن', 'Hotline'),
('email_contact', 'info@delora.com', NULL, 'البريد الإلكتروني', 'Email'),
('facebook_link', 'https://facebook.com/delora', NULL, 'فيسبوك', 'Facebook'),
('instagram_link', 'https://instagram.com/delora', NULL, 'انستغرام', 'Instagram'),
('twitter_link', 'https://twitter.com/delora', NULL, 'تويتر', 'Twitter'),
('working_hours_ar', '9 ص - 12 م يومياً', NULL, 'ساعات العمل', 'Working Hours'),
('address_ar', 'شارع التحرير، القاهرة', 'Tahrir Street, Cairo', 'العنوان', 'Address'),
('footer_description_ar', 'ديالرا - تسوقة ذكية لكل العائلة', 'Delora - Smart Shopping for the Whole Family', 'وصف الفوتر', 'Footer Description'),
('site_name_ar', 'ديالرا', 'Delora', 'اسم الموقع', 'Site Name'),
('site_description_ar', 'سوبر ماركت أونلاين', 'Online Supermarket', 'وصف الموقع', 'Site Description')
ON DUPLICATE KEY UPDATE key_value_ar=VALUES(key_value_ar), key_value_en=VALUES(key_value_en);
`;

fs.writeFileSync('E:/Project2/backEnd/seed.sql', sqlSeed.trim());
console.log('\nSQL seed file written to backEnd/seed.sql');

// Verify
const [r] = await db.query('SELECT id, name, username, email, role FROM users');
console.log('\nAll users:', JSON.stringify(r, null, 2));
await db.end();
