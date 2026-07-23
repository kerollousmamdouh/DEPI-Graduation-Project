import db from '../config/db.js';

const generateSlug = (text) => {
    let slug = text
        .toLowerCase()
        .replace(/[^\w\s\u0600-\u06FF-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .trim();
    if (!slug) slug = 'cat-' + Date.now();
    return slug;
};

const generateProductSlug = (nameAr, nameEn) => {
    const text = nameAr || nameEn || '';
    let slug = text
        .toLowerCase()
        .replace(/[^\w\s\u0600-\u06FF-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .trim();
    if (!slug) slug = 'product-' + Date.now();
    return slug;
};

export const getAllProducts = async (req, res) => {
    const lang = req.lang;
    const { all } = req.query;
    try {
        await db.query("ALTER TABLE products ADD COLUMN unit_type VARCHAR(20) DEFAULT 'quantity' AFTER unit_en").catch(() => {});
        const whereClause = all === 'true' ? '' : 'WHERE p.is_active = TRUE';
        const [products] = await db.query(`
            SELECT 
                p.id, p.category_id, p.category_id AS categoryId, p.slug,
                p.wholesale_price, p.price, p.discount_price, p.comparison_price,
                p.sku, p.barcode, p.product_image, p.product_image AS image, p.avg_rating, p.is_active,
                p.created_at, p.offer_start_at, p.offer_end_at,
                p.offer_until_stock_out, p.offer_max_quantity,
                ps.available_quantity AS stock,
                p.name_ar, p.name_en,
                IFNULL(p.name_${lang}, p.name_ar) AS name,
                p.brand_ar, p.brand_en,
                IFNULL(p.brand_${lang}, p.brand_ar) AS brand,
                p.description_ar, p.description_en,
                IFNULL(p.description_${lang}, p.description_ar) AS description,
                IFNULL(p.unit_${lang}, p.unit_ar) AS unit,
                COALESCE(p.unit_type, 'quantity') AS unitType,
                c.name_ar AS category_name_ar, c.name_en AS category_name_en,
                IFNULL(c.name_${lang}, c.name_ar) AS category_name,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND (p.offer_until_stock_out = TRUE OR (p.offer_start_at <= NOW() AND p.offer_end_at >= NOW()))
                    THEN p.discount_price 
                    ELSE p.price 
                END AS current_price,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND (p.offer_until_stock_out = TRUE OR (p.offer_start_at <= NOW() AND p.offer_end_at >= NOW()))
                    THEN p.discount_price 
                    ELSE NULL 
                END AS offerPrice,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND (p.offer_until_stock_out = TRUE OR (p.offer_start_at <= NOW() AND p.offer_end_at >= NOW()))
                    THEN TRUE 
                    ELSE FALSE 
                END AS is_on_offer
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_stock ps ON p.id = ps.product_id
            ${whereClause}
        `);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ 
            message: req.lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;
    const lang = req.lang;
    try {
        const [products] = await db.query(`
            SELECT 
                p.id, p.category_id, p.category_id AS categoryId, p.slug,
                p.wholesale_price, p.price, p.discount_price, p.comparison_price,
                p.sku, p.barcode, p.product_image, p.product_image AS image, p.avg_rating, p.is_active,
                p.created_at, p.offer_start_at, p.offer_end_at,
                p.offer_until_stock_out, p.offer_max_quantity,
                ps.available_quantity AS stock,
                p.name_ar, p.name_en,
                IFNULL(p.name_${lang}, p.name_ar) AS name,
                p.brand_ar, p.brand_en,
                IFNULL(p.brand_${lang}, p.brand_ar) AS brand,
                p.description_ar, p.description_en,
                IFNULL(p.description_${lang}, p.description_ar) AS description,
                IFNULL(p.unit_${lang}, p.unit_ar) AS unit,
                c.name_ar AS category_name_ar, c.name_en AS category_name_en,
                IFNULL(c.name_${lang}, c.name_ar) AS category_name,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND (p.offer_until_stock_out = TRUE OR (p.offer_start_at <= NOW() AND p.offer_end_at >= NOW()))
                    THEN p.discount_price 
                    ELSE p.price 
                END AS current_price,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND (p.offer_until_stock_out = TRUE OR (p.offer_start_at <= NOW() AND p.offer_end_at >= NOW()))
                    THEN p.discount_price 
                    ELSE NULL 
                END AS offerPrice
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_stock ps ON p.id = ps.product_id
            WHERE p.id = ? AND p.is_active = TRUE
        `, [id]);

        if (products.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Product not found.' : 'المنتج غير موجود' 
            });
        }

        const product = products[0];
        const [images] = await db.query('SELECT id, image_url FROM product_images WHERE product_id = ?', [id]);
        product.gallery = images.map(img => img.image_url);

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

export const createProduct = async (req, res) => {
    const lang = req.lang;
    const body = req.body;

    // Accept both frontend and backend field formats
    const category_id = body.category_id || body.categoryId;
    const name_ar = body.name_ar || (body.name && body.name.ar);
    const name_en = body.name_en || (body.name && body.name.en);
    const wholesale_price = body.wholesale_price || body.price || 0;
    const price = body.price || 0;
    const discount_price = body.discount_price || body.offerPrice || null;
    const sku = body.sku || ('SKU-' + Date.now());
    const unit_ar = body.unit_ar || body.unit || 'قطعة';
    const unit_en = body.unit_en || null;
    const unit_type = body.unit_type || body.unitType || 'quantity';
    const product_image = body.product_image || body.image || '';
    const slug = body.slug || generateProductSlug(name_ar, name_en);
    const stock = body.stock || 0;

    if (!category_id || !name_ar) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Category and Arabic name are required.' : 'القسم والاسم بالعربي مطلوبين.' 
        });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO products 
            (category_id, name_ar, name_en, slug, brand_ar, brand_en, description_ar, description_en, 
             wholesale_price, price, comparison_price, sku, barcode, unit_ar, unit_en, unit_type, product_image,
             discount_price, offer_start_at, offer_end_at, offer_until_stock_out, offer_max_quantity) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                category_id, name_ar, name_en || null, slug,
                body.brand_ar || null, body.brand_en || null,
                body.description_ar || null, body.description_en || null,
                wholesale_price, price, body.comparison_price || null,
                sku, body.barcode || null, unit_ar, unit_en, unit_type,
                product_image,
                discount_price,
                body.offer_start_at || body.offerExpiresAt || null,
                body.offer_end_at || null,
                body.offer_until_stock_out === true ? 1 : 0,
                body.offer_max_quantity || body.offerStock || null
            ]
        );

        const productId = result.insertId;

        if (body.gallery && Array.isArray(body.gallery) && body.gallery.length > 0) {
            for (const imageUrl of body.gallery) {
                await connection.query('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)', [productId, imageUrl]);
            }
        }

        await connection.query('INSERT INTO product_stock (product_id, available_quantity) VALUES (?, ?)', [productId, stock]);

        await connection.commit();
        res.status(201).json({ 
            message: lang === 'en' ? 'Product added successfully!' : 'تم إضافة المنتج بنجاح!', 
            productId 
        });
    } catch (error) {
        await connection.rollback();
        console.error('createProduct error:', error.message);
        res.status(500).json({ 
            message: lang === 'en' ? 'Error adding product.' : 'حدث خطأ أثناء إضافة المنتج', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const lang = req.lang;
    const body = req.body;

    const category_id = body.category_id || body.categoryId;
    const name_ar = body.name_ar || (body.name && body.name.ar);
    const name_en = body.name_en || (body.name && body.name.en);
    const wholesale_price = body.wholesale_price || body.price || 0;
    const price = body.price || 0;
    const discount_price = body.discount_price || body.offerPrice || null;
    const sku = body.sku || 'SKU-PENDING';
    const unit_ar = body.unit_ar || body.unit || 'قطعة';
    const unit_en = body.unit_en || null;
    const product_image = body.product_image || body.image || '';
    const slug = body.slug || generateProductSlug(name_ar, name_en);
    const stock = body.stock;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [existing] = await connection.query('SELECT id, unit_type FROM products WHERE id = ?', [id]);
        if (existing.length === 0) {
            connection.release();
            return res.status(404).json({ 
                message: lang === 'en' ? 'Product not found.' : 'المنتج غير موجود' 
            });
        }

        const unit_type = body.unit_type || body.unitType || existing[0].unit_type || 'quantity';

        await connection.query(
            `UPDATE products SET 
                category_id = ?, name_ar = ?, name_en = ?, slug = ?, brand_ar = ?, brand_en = ?,
                description_ar = ?, description_en = ?, wholesale_price = ?, price = ?,
                comparison_price = ?, sku = ?, barcode = ?, unit_ar = ?, unit_en = ?, unit_type = ?,
                product_image = ?, is_active = ?,
                discount_price = ?, offer_start_at = ?, offer_end_at = ?,
                offer_until_stock_out = ?, offer_max_quantity = ?
            WHERE id = ?`,
            [
                category_id, name_ar, name_en || null, slug,
                body.brand_ar || null, body.brand_en || null,
                body.description_ar || null, body.description_en || null,
                wholesale_price, price, body.comparison_price || null,
                sku, body.barcode || null, unit_ar, unit_en, unit_type,
                product_image, body.is_active !== undefined ? body.is_active : 1,
                discount_price, body.offer_start_at || null, body.offer_end_at || null,
                body.offer_until_stock_out === true ? 1 : 0,
                body.offer_max_quantity || null, id
            ]
        );

        if (body.gallery && Array.isArray(body.gallery)) {
            await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
            for (const imageUrl of body.gallery) {
                await connection.query('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)', [id, imageUrl]);
            }
        }

        if (stock !== undefined) {
            await connection.query(
                'UPDATE product_stock SET available_quantity = ? WHERE product_id = ?',
                [stock, id]
            );
        }

        await connection.commit();
        res.status(200).json({ 
            message: lang === 'en' ? 'Product updated successfully!' : 'تم تحديث المنتج بنجاح!' 
        });
    } catch (error) {
        await connection.rollback();
        console.error('updateProduct error:', error.message);
        res.status(500).json({ 
            message: lang === 'en' ? 'Error updating product.' : 'حدث خطأ أثناء تحديث المنتج', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const lang = req.lang;
    try {
        const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Product not found.' : 'المنتج غير موجود' 
            });
        }
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        res.status(200).json({ 
            message: lang === 'en' ? 'Product deleted.' : 'تم حذف المنتج.' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Error deleting product.' : 'حدث خطأ أثناء حذف المنتج', 
            error: error.message 
        });
    }
};
