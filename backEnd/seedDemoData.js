import db from './src/config/db.js';

async function seedDemoData() {
    console.log('Seeding demo categories...');

    const categories = [
        [1, 'الألبان والجبن', 'Dairy & Cheese', 'dairy-cheese', 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=500', 1, 'quantity'],
        [2, 'المجمدات', 'Frozen', 'frozen', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500', 1, 'quantity'],
        [3, 'العطارة', 'Spices', 'spices', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', 1, 'weight'],
        [4, 'المعلبات', 'Canned Goods', 'canned-goods', 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=500', 1, 'quantity'],
        [5, 'السناكس', 'Snacks', 'snacks', 'https://images.unsplash.com/photo-1534080391025-a7771e1a6462?w=500', 1, 'quantity'],
        [6, 'مستحضرات التجميل', 'Cosmetics', 'cosmetics', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500', 1, 'quantity'],
    ];

    for (const [id, nameAr, nameEn, slug, imageUrl, isActive, unitType] of categories) {
        await db.query(
            `INSERT INTO categories (id, name_ar, name_en, slug, image_url, is_active, unit_type)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name_ar=VALUES(name_ar), name_en=VALUES(name_en), slug=VALUES(slug), image_url=VALUES(image_url), is_active=VALUES(is_active), unit_type=VALUES(unit_type)`,
            [id, nameAr, nameEn, slug, imageUrl, isActive, unitType]
        );
    }
    console.log('Categories seeded:', categories.length);

    console.log('Seeding demo products...');
    const products = [
        // Category 1: Dairy
        [1, 1, 'جبنة رومي قديم (كيلو)', 'Old Roumi Cheese (1kg)', 'جبنة-رومي-قديم', 260, null, 15, 'قطعة', 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400', 'ROMI-001', 4.5],
        [2, 1, 'جبنة بيضاء فيتا 500 جرام', 'Domty Domiati Cheese 500g', 'جبنة-بيضاء-فيتا', 45, 39, 90, 'قطعة', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400', 'DOM-002', 4.2],
        [3, 1, 'لبن جهينة كامل الدسم 1 لتر', 'Juhayna Full Cream Milk 1L', 'لبن-جهينة', 48, null, 100, 'لتر', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', 'JUH-003', 4.0],
        [4, 1, 'زبادي المراعي طبيعي 105 جرام', 'Almarai Natural Yogurt 105g', 'زبادي-المراعي', 9, 7.5, 300, 'قطعة', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', 'ALM-004', 4.3],
        [5, 1, 'قشطة بوك 170 جرام', 'Puck Thick Cream 170g', 'قشطة-بوك', 45, 41, 55, 'قطعة', 'https://images.unsplash.com/photo-1528750994873-1122146aea9f?w=400', 'PUCK-005', 4.1],

        // Category 2: Frozen
        [6, 2, 'برجر بقري جامبو حلواني', 'Halwani Jumbo Beef Burger', 'برجر-بقري-حلواني', 160, 140, 25, 'قطعة', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 'HAL-006', 4.4],
        [7, 2, 'كفتة بقري سيخ أطياب', 'Atyab Beef Kofta', 'كفتة-بقري', 185, null, 18, 'كيلو', 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400', 'ATY-007', 4.6],
        [8, 2, 'ستريبس دجاج حار اطياب 1كجم', 'Atyab Spicy Chicken Strips 1kg', 'ستريبس-دجاج', 240, 215, 12, 'كيلو', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400', 'ATY-008', 4.3],
        [9, 2, 'خضار مشكل بسمة مجمد 400 جرام', 'Basma Frozen Mixed Vegetables 400g', 'خضار-مشكل', 25, 19, 65, 'قطعة', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', 'BAS-009', 3.9],

        // Category 3: Spices
        [10, 3, 'كمون مطحون عافية 100 جرام', 'Afia Ground Cumin 100g', 'كمون-مطحون', 35, null, 80, 'جرام', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', 'AFI-010', 4.0],
        [11, 3, 'كركم ناعم عافية 100 جرام', 'Afia Turmeric Powder 100g', 'كركم-ناعم', 30, null, 70, 'جرام', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400', 'AFI-011', 4.1],
        [12, 3, 'فلفل أسمر مطحون 100 جرام', 'Black Pepper Ground 100g', 'فلفل-أسمر', 45, null, 50, 'جرام', 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400', 'PEP-012', 4.2],

        // Category 4: Canned
        [13, 4, 'تونة صن شاين قطعة واحدة', 'Sunshine Tuna Solid', 'تونة-صن-شاين', 55, 48, 60, 'قطعة', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400', 'SUN-013', 4.0],
        [14, 4, 'صلصة طماطم فاين فودز 360 جرام', 'Fine Foods Tomato Paste 360g', 'صلصة-طماطم', 25, 21, 85, 'قطعة', 'https://images.unsplash.com/photo-1607305387299-a3d9611cd46f?w=400', 'FF-014', 4.1],

        // Category 5: Snacks
        [15, 5, 'شيبسي عائلي طعم الملح', 'Chipsy Family Pack Salt', 'شيبسي-عائلي', 15, null, 200, 'قطعة', 'https://images.unsplash.com/photo-1566478431375-7385bb02e07f?w=400', 'CHIP-015', 3.8],
        [16, 5, 'كوكاكولا كانز 330 مل', 'Coca-Cola Can 330ml', 'كوكاكولا-كانز', 12, null, 300, 'قطعة', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400', 'COKE-016', 4.5],
        [17, 5, 'شاي لبتون خرز 250 جرام', 'Lipton Loose Tea 250g', 'شاي-لبتون', 75, 68, 45, 'جرام', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400', 'LIP-017', 4.3],

        // Category 6: Cosmetics
        [18, 6, 'شامبو بانتين بديل الزيت 400 مل', 'Pantene Shampoo 400ml', 'شامبو-بانتين', 120, 105, 25, 'مل', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400', 'PAN-018', 4.2],
        [19, 6, 'معجون أسنان كولجيت انتعاش النعناع', 'Colgate Mint Toothpaste', 'معجون-كولجيت', 45, 38, 60, 'قطعة', 'https://images.unsplash.com/photo-1559591656-a6de9d105280?w=400', 'COL-019', 4.0],
        [20, 6, 'كريم نيفيا مرطب للجسم 150 مل', 'Nivea Creme Moisturizer 150ml', 'كريم-نيفيا', 80, 72, 45, 'مل', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', 'NIV-020', 4.4],
    ];

    for (const [id, catId, nameAr, nameEn, slug, price, discountPrice, stock, unit, imageUrl, sku, rating] of products) {
        const offerStart = discountPrice ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;
        const offerEnd = discountPrice ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ') : null;
        
        await db.query(
            `INSERT INTO products (id, category_id, name_ar, name_en, slug, wholesale_price, price, discount_price, sku, unit_ar, product_image, avg_rating, is_active, offer_start_at, offer_end_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
             ON DUPLICATE KEY UPDATE name_ar=VALUES(name_ar), name_en=VALUES(name_en), slug=VALUES(slug), price=VALUES(price), discount_price=VALUES(discount_price), product_image=VALUES(product_image), avg_rating=VALUES(avg_rating), is_active=1, offer_start_at=VALUES(offer_start_at), offer_end_at=VALUES(offer_end_at)`,
            [id, catId, nameAr, nameEn, slug, price, price, discountPrice, sku, unit, imageUrl, rating, offerStart, offerEnd]
        );

        // Upsert stock
        await db.query(
            `INSERT INTO product_stock (product_id, available_quantity) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE available_quantity=VALUES(available_quantity)`,
            [id, stock]
        );
    }
    console.log('Products seeded:', products.length);

    console.log('Seeding demo banners...');
    const banners = [
        [1, 'منتجات ألبان وأجبان طازجة يومياً', 'Fresh Daily Dairy & Cheese', 'خصم يصل إلى 20%', 'Up to 20% OFF', 'تسوق الآن', 'Shop Now', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=1200', 1, 1, 1],
        [2, 'لحم ومجمدات فاخرة سريعة التحضير', 'Premium Frozen Foods & Meat', 'جودة مضمونة', 'Quality Guaranteed', 'اكتشف المزيد', 'Discover More', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200', 1, 2, 2],
        [3, 'أحدث مستحضرات التجميل والعناية الشخصية', 'Latest Beauty & Personal Care', 'إطلالة مشرقة', 'Bright Look', 'اكتشفي عروضنا', 'Check Our Offers', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200', 1, 6, 3],
    ];

    for (const [id, titleAr, titleEn, subAr, subEn, btnAr, btnEn, imageUrl, isActive, catId, sortOrder] of banners) {
        await db.query(
            `INSERT INTO banners (id, title_ar, title_en, subtitle_ar, subtitle_en, button_text_ar, button_text_en, image_url, is_active, category_id, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE title_ar=VALUES(title_ar), title_en=VALUES(title_en), subtitle_ar=VALUES(subtitle_ar), subtitle_en=VALUES(subtitle_en), button_text_ar=VALUES(button_text_ar), button_text_en=VALUES(button_text_en), image_url=VALUES(image_url), is_active=VALUES(is_active), category_id=VALUES(category_id), sort_order=VALUES(sort_order)`,
            [id, titleAr, titleEn, subAr, subEn, btnAr, btnEn, imageUrl, isActive, catId, sortOrder]
        );
    }
    console.log('Banners seeded:', banners.length);

    console.log('Demo data seeded successfully!');
    process.exit(0);
}

seedDemoData().catch(e => { console.error('Error:', e.message); process.exit(1); });
