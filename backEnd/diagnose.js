import db from './src/config/db.js';

async function diagnose() {
    console.log('=== PRODUCTS TABLE SCHEMA ===');
    const [prodCols] = await db.query("DESCRIBE products");
    const prodColNames = prodCols.map(c => c.Field);
    console.log('Columns:', prodColNames.join(', '));
    
    console.log('\n=== CATEGORIES TABLE SCHEMA ===');
    const [catCols] = await db.query("DESCRIBE categories");
    const catColNames = catCols.map(c => c.Field);
    console.log('Columns:', catColNames.join(', '));
    
    console.log('\n=== BANNERS TABLE SCHEMA ===');
    const [bannerCols] = await db.query("DESCRIBE banners");
    const bannerColNames = bannerCols.map(c => c.Field);
    console.log('Columns:', bannerColNames.join(', '));

    console.log('\n=== STORE_SETTINGS TABLE ===');
    const [settings] = await db.query("SELECT key_name, key_value_ar FROM store_settings");
    console.log('Settings count:', settings.length);
    settings.forEach(s => console.log(' ', s.key_name, ':', String(s.key_value_ar).substring(0, 60)));

    console.log('\n=== CATEGORIES DATA ===');
    const [cats] = await db.query("SELECT * FROM categories LIMIT 5");
    console.log('Count:', cats.length);
    cats.forEach(c => console.log(' ', { id: c.id, name_ar: c.name_ar, name_en: c.name_en, slug: c.slug, image_url: c.image_url?.substring(0, 40), is_active: c.is_active }));

    console.log('\n=== PRODUCTS DATA ===');
    const [prods] = await db.query("SELECT * FROM products LIMIT 5");
    console.log('Count:', prods.length);
    prods.forEach(p => console.log(' ', { id: p.id, name_ar: p.name_ar, name_en: p.name_en, category_id: p.category_id, price: p.price, product_image: p.product_image?.substring(0, 40), is_active: p.is_active }));

    console.log('\n=== BANNERS DATA ===');
    const [banners] = await db.query("SELECT * FROM banners LIMIT 5");
    console.log('Count:', banners.length);
    banners.forEach(b => console.log(' ', { id: b.id, title_ar: b.title_ar, title_en: b.title_en, image_url: b.image_url?.substring(0, 40), is_active: b.is_active }));

    console.log('\n=== PRODUCT_STOCK DATA ===');
    const [stock] = await db.query("SELECT * FROM product_stock LIMIT 5");
    console.log('Count:', stock.length);
    stock.forEach(s => console.log(' ', { product_id: s.product_id, available_quantity: s.available_quantity }));

    console.log('\n=== USERS DATA ===');
    const [users] = await db.query("SELECT id, name, username, email, role FROM users");
    users.forEach(u => console.log(' ', { id: u.id, name: u.name, username: u.username, role: u.role }));

    process.exit(0);
}

diagnose().catch(e => { console.error('Error:', e.message); process.exit(1); });
