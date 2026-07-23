import db from './src/config/db.js';

async function seedFooterSettings() {
    const footerSettings = [
        ['footer_logo', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200', null, 'شعار الفوتر', 'Footer Logo'],
        ['footer_about_ar', 'ديالرا - وجهتك الأولى للتسوق الذكي. نوفر لك أفضل المنتجات بأسعار منافسة مع خدمة توصيل سريعة لباب بيتك.', null, 'وصف الفوتر بالعربي', 'Footer About AR'],
        ['footer_about_en', 'DELORA - Your premier destination for smart shopping. We provide the best products at competitive prices with fast home delivery.', null, 'وصف الفوتر بالإنجليزي', 'Footer About EN'],
        ['footer_working_hours_ar', '9 ص - 12 م يومياً', null, 'ساعات العمل بالعربي', 'Footer Working Hours AR'],
        ['footer_working_hours_en', '9 AM - 12 AM Daily', null, 'ساعات العمل بالإنجليزي', 'Footer Working Hours EN'],
        ['footer_phones', JSON.stringify(['01012345678', '01187654321']), null, 'هواتف الفوتر', 'Footer Phones'],
        ['footer_locations', JSON.stringify([
            { name: 'فرع مدينة نصر', nameEn: 'Nasr City Branch', url: 'https://maps.google.com/?q=Nasr+City' },
            { name: 'فرع التجمع', nameEn: 'Tagamoa Branch', url: 'https://maps.google.com/?q=Tagamoa' }
        ]), null, 'مواقع الفروع', 'Footer Locations'],
        ['footer_social_links', JSON.stringify([
            { name: 'Facebook', url: 'https://fb.com/delora', icon: 'facebook' },
            { name: 'Instagram', url: 'https://instagram.com/delora', icon: 'instagram' },
            { name: 'WhatsApp', url: 'https://wa.me/201001105352', icon: 'whatsapp' },
            { name: 'Telegram', url: 'https://t.me/delora', icon: 'telegram' }
        ]), null, 'روابط التواصل الاجتماعي', 'Footer Social Links'],
    ];

    for (const [key, valAr, valEn, dnAr, dnEn] of footerSettings) {
        await db.query(
            `INSERT INTO store_settings (key_name, key_value_ar, key_value_en, display_name_ar, display_name_en)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE key_value_ar = IFNULL(VALUES(key_value_ar), key_value_ar), key_value_en = IFNULL(VALUES(key_value_en), key_value_en)`,
            [key, valAr, valEn, dnAr, dnEn]
        );
        console.log('Seeded:', key);
    }

    console.log('Footer settings seeded successfully!');
    process.exit(0);
}

seedFooterSettings().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
