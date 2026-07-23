import db from './src/config/db.js';
async function fix() {
    await db.query("UPDATE store_settings SET key_value_ar = NULL WHERE key_name = 'footer_logo'");
    console.log('Cleared footer_logo - will use default imported logo');
    process.exit(0);
}
fix();
