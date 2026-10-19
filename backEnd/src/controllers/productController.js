import db from '../config/db.js';

const toMySQLDatetime = (val) => {
    if (!val) return null;
    if (val instanceof Date) {
        if (isNaN(val.getTime())) return null;
        const y = val.getFullYear();
        const m = String(val.getMonth() + 1).padStart(2, '0');
        const d = String(val.getDate()).padStart(2, '0');
        const h = String(val.getHours()).padStart(2, '0');
        const mi = String(val.getMinutes()).padStart(2, '0');
        const s = String(val.getSeconds()).padStart(2, '0');
        return `${y}-${m}-${d} ${h}:${mi}:${s}`;
    }
    if (typeof val !== 'string') return null;
    let str = val.trim();
    if (str.includes('T')) {
        str = str.replace('T', ' ');
    }
    str = str.split('.')[0];
    str = str.replace('Z', '');
    str = str.replace(/[+-]\d{2}:?\d{2}$/, '');
    str = str.trim();

    // Safety net: never hand MySQL anything that isn't a clean 'YYYY-MM-DD HH:MM:SS'
    // (or 'YYYY-MM-DD') value. If the input didn't reduce to that shape — or isn't a
    // real calendar date/time — fall back to null instead of letting the query 500.
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!match) return null;
    const parsed = new Date(str.replace(' ', 'T'));
    if (isNaN(parsed.getTime())) return null;

    return str || null;
};

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
        await db.query("ALTER TABLE products ADD COLUMN unit_type VARCHAR(20) DEFAULT 'quantity'").catch(() => {});
        await db.query("ALTER TABLE products ADD COLUMN offer_stock_remaining INT DEFAULT NULL").catch(() => {});
        const whereClause = all === 'true' ? '' : 'WHERE p.is_active = TRUE';
        const [products] = await db.query(`
            SELECT 
                p.id, p.category_id, p.category_id AS categoryId, p.slug,
                p.wholesale_price, p.price, p.discount_price, p.comparison_price,
                p.sku, p.barcode, p.product_image, p.product_image AS image, p.avg_rating, p.is_active,
                p.created_at, p.offer_start_at, p.offer_end_at,
                p.offer_until_stock_out, p.offer_max_quantity, p.offer_stock_remaining,
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
                         AND ((p.offer_until_stock_out = TRUE AND p.offer_stock_remaining > 0) OR (p.offer_until_stock_out = FALSE AND (p.offer_start_at IS NULL OR p.offer_start_at <= NOW()) AND p.offer_end_at >= NOW() AND COALESCE(ps.available_quantity, 0) > 0))
                    THEN p.discount_price 
                    ELSE p.price 
                END AS current_price,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND ((p.offer_until_stock_out = TRUE AND p.offer_stock_remaining > 0) OR (p.offer_until_stock_out = FALSE AND (p.offer_start_at IS NULL OR p.offer_start_at <= NOW()) AND p.offer_end_at >= NOW() AND COALESCE(ps.available_quantity, 0) > 0))
                    THEN p.discount_price 
                    ELSE NULL 
                END AS offerPrice,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND ((p.offer_until_stock_out = TRUE AND p.offer_stock_remaining > 0) OR (p.offer_until_stock_out = FALSE AND (p.offer_start_at IS NULL OR p.offer_start_at <= NOW()) AND p.offer_end_at >= NOW() AND COALESCE(ps.available_quantity, 0) > 0))
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
        await db.query("ALTER TABLE products ADD COLUMN offer_stock_remaining INT DEFAULT NULL").catch(() => {});
        const [products] = await db.query(`
            SELECT 
                p.id, p.category_id, p.category_id AS categoryId, p.slug,
                p.wholesale_price, p.price, p.discount_price, p.comparison_price,
                p.sku, p.barcode, p.product_image, p.product_image AS image, p.avg_rating, p.is_active,
                p.created_at, p.offer_start_at, p.offer_end_at,
                p.offer_until_stock_out, p.offer_max_quantity, p.offer_stock_remaining,
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
                COALESCE(p.unit_type, 'quantity') AS unitType,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND ((p.offer_until_stock_out = TRUE AND p.offer_stock_remaining > 0) OR (p.offer_until_stock_out = FALSE AND (p.offer_start_at IS NULL OR p.offer_start_at <= NOW()) AND p.offer_end_at >= NOW() AND COALESCE(ps.available_quantity, 0) > 0))
                    THEN p.discount_price 
                    ELSE p.price 
                END AS current_price,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND ((p.offer_until_stock_out = TRUE AND p.offer_stock_remaining > 0) OR (p.offer_until_stock_out = FALSE AND (p.offer_start_at IS NULL OR p.offer_start_at <= NOW()) AND p.offer_end_at >= NOW() AND COALESCE(ps.available_quantity, 0) > 0))
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
    let offer_until_stock_out = body.offer_until_stock_out === true ? 1 : 0;
    if (discount_price && !body.offer_end_at && (body.offer_max_quantity || body.offerStock)) {
        offer_until_stock_out = 1;
    }

    if (!category_id || !name_ar) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Category and Arabic name are required.' : 'القسم والاسم بالعربي مطلوبين.' 
        });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const offerMaxQty = body.offer_max_quantity || body.offerStock || null;

        // Auto-set offer_start_at to NOW() when creating a product with an active offer
        const offerStartAt = discount_price
            ? (toMySQLDatetime(body.offer_start_at) || null)
            : null;

        const [result] = await connection.query(
            `INSERT INTO products 
            (category_id, name_ar, name_en, slug, brand_ar, brand_en, description_ar, description_en, 
             wholesale_price, price, comparison_price, sku, barcode, unit_ar, unit_en, unit_type, product_image,
             discount_price, offer_start_at, offer_end_at, offer_until_stock_out, offer_max_quantity, offer_stock_remaining) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                category_id, name_ar, name_en || null, slug,
                body.brand_ar || null, body.brand_en || null,
                body.description_ar || null, body.description_en || null,
                wholesale_price, price, body.comparison_price || null,
                sku, body.barcode || null, unit_ar, unit_en, unit_type,
                product_image,
                discount_price,
                offerStartAt,
                toMySQLDatetime(body.offer_end_at) || toMySQLDatetime(body.offerExpiresAt) || null,
                offer_until_stock_out,
                offerMaxQty,
                offer_until_stock_out ? offerMaxQty : null
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
    const unit_ar = body.unit_ar || body.unit || 'قطعة';
    const unit_en = body.unit_en || null;
    const product_image = body.product_image || body.image || '';
    const slug = body.slug || generateProductSlug(name_ar, name_en);
    const stock = body.stock;
    let offer_until_stock_out = body.offer_until_stock_out === true ? 1 : 0;
    if (discount_price && !body.offer_end_at && !body.offerExpiresAt && (body.offer_max_quantity || body.offerStock)) {
        offer_until_stock_out = 1;
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [existing] = await connection.query('SELECT id, unit_type, discount_price, offer_stock_remaining, offer_until_stock_out, sku FROM products WHERE id = ?', [id]);
        if (existing.length === 0) {
            connection.release();
            return res.status(404).json({ 
                message: lang === 'en' ? 'Product not found.' : 'المنتج غير موجود' 
            });
        }

        // ⚠️ The edit form doesn't collect an SKU field, so body.sku is normally undefined here.
        // We must NOT fall back to a fixed placeholder like 'SKU-PENDING' — sku is a UNIQUE
        // column, so a second product edited the same way would collide with the first and
        // throw a duplicate-entry error. Keep whatever SKU the product already has; only
        // generate a (uniquely timestamped) one if it somehow has none at all.
        const sku = body.sku || existing[0].sku || ('SKU-' + Date.now());

        const unit_type = body.unit_type || body.unitType || existing[0].unit_type || 'quantity';

        const offerMaxQty = body.offer_max_quantity || body.offerStock || null;

        // Auto-set offer_start_at to NOW() when a new discount is added
        const offerStartAt = discount_price
            ? (toMySQLDatetime(body.offer_start_at) || null)
            : null;

        await connection.query(
            `UPDATE products SET 
                category_id = ?, name_ar = ?, name_en = ?, slug = ?, brand_ar = ?, brand_en = ?,
                description_ar = ?, description_en = ?, wholesale_price = ?, price = ?,
                comparison_price = ?, sku = ?, barcode = ?, unit_ar = ?, unit_en = ?, unit_type = ?,
                product_image = ?, is_active = ?,
                discount_price = ?, offer_start_at = ?, offer_end_at = ?,
                offer_until_stock_out = ?
            WHERE id = ?`,
            [
                category_id, name_ar, name_en || null, slug,
                body.brand_ar || null, body.brand_en || null,
                body.description_ar || null, body.description_en || null,
                wholesale_price, price, body.comparison_price || null,
                sku, body.barcode || null, unit_ar, unit_en, unit_type,
                product_image, body.is_active !== undefined ? body.is_active : 1,
                discount_price,
                offerStartAt,
                toMySQLDatetime(body.offer_end_at) || toMySQLDatetime(body.offerExpiresAt) || null,
                offer_until_stock_out,
                id
            ]
        );

        const hadDiscount = !!existing[0].discount_price;
        const hadStockOffer = !!existing[0].offer_until_stock_out;

        if (!discount_price) {
            // Offer removed entirely (admin cancelled it) — clear the stock-offer counters.
            if (hadDiscount) {
                await connection.query('UPDATE products SET offer_stock_remaining = NULL, offer_max_quantity = NULL WHERE id = ?', [id]);
            }
        } else if (offer_until_stock_out) {
            if (!hadStockOffer) {
                // Brand-new "while supplies last" offer — either this product never had a
                // discount before, or it's switching from a date-based offer to a stock-based
                // one. Either way, start the counters fresh from the quantity the admin entered.
                await connection.query(
                    'UPDATE products SET offer_stock_remaining = ?, offer_max_quantity = ? WHERE id = ?',
                    [offerMaxQty, offerMaxQty, id]
                );
            } else if (body.offerStockToAdd > 0) {
                // Topping up an already-existing stock offer — increment both counters instead
                // of overwriting them, so the original offer total isn't lost.
                await connection.query(
                    `UPDATE products SET offer_stock_remaining = COALESCE(offer_stock_remaining, 0) + ?, offer_max_quantity = COALESCE(offer_max_quantity, 0) + ? WHERE id = ?`,
                    [body.offerStockToAdd, body.offerStockToAdd, id]
                );
            }
        } else if (hadStockOffer) {
            // Switched away from a stock-based offer to a date-based one — the remaining/max
            // stock counters no longer apply, so clear them for consistency.
            await connection.query('UPDATE products SET offer_stock_remaining = NULL, offer_max_quantity = NULL WHERE id = ?', [id]);
        }

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
        const [existing] = await db.query(
            'SELECT p.id, (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) AS order_count FROM products p WHERE p.id = ?', 
            [id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Product not found.' : 'المنتج غير موجود' 
            });
        }
        const { order_count } = existing[0];
        const numOrders = Number(order_count);
        if (numOrders > 0) {
            await db.query('UPDATE products SET is_active = FALSE WHERE id = ?', [id]);
            return res.status(200).json({ 
                message: lang === 'en' ? 'Product deactivated — it has existing orders and cannot be permanently deleted.' : 'تم إخفاء المنتج — لديه طلبات سابقة ولا يمكن حذفه نهائياً.' 
            });
        }
        await db.query('DELETE FROM cart_items WHERE product_id = ?', [id]);
        await db.query('DELETE FROM favorites WHERE product_id = ?', [id]);
        await db.query('DELETE FROM product_images WHERE product_id = ?', [id]);
        await db.query('DELETE FROM product_stock WHERE product_id = ?', [id]);
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        res.status(200).json({ 
            message: lang === 'en' ? 'Product permanently deleted.' : 'تم حذف المنتج نهائياً.' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Error deleting product.' : 'حدث خطأ أثناء حذف المنتج', 
            error: error.message 
        });
    }
};