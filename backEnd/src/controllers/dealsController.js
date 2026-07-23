import db from '../config/db.js';

export const getAllDeals = async (req, res) => {
    const lang = req.lang;
    try {
        const [deals] = await db.query(`
            SELECT p.id, p.name_ar, p.name_en, p.slug, p.price, p.discount_price, p.product_image,
                   p.offer_start_at, p.offer_end_at, p.offer_until_stock_out, p.offer_max_quantity,
                   IFNULL(p.name_${lang}, p.name_ar) AS name,
                   c.name_ar AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.discount_price IS NOT NULL AND p.is_active = TRUE
            ORDER BY p.offer_start_at DESC
        `);
        res.status(200).json(deals);
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const createDeal = async (req, res) => {
    const lang = req.lang;
    const { product_id, discount_price, offer_start_at, offer_end_at, offer_until_stock_out, offer_max_quantity } = req.body;

    if (!product_id || !discount_price) {
        return res.status(400).json({
            message: lang === 'en' ? 'Product and discount price are required.' : 'المنتج وسعر الخصم مطلوبان.'
        });
    }

    try {
        await db.query(
            `UPDATE products SET 
                discount_price = ?, offer_start_at = ?, offer_end_at = ?, 
                offer_until_stock_out = ?, offer_max_quantity = ?
             WHERE id = ?`,
            [discount_price, offer_start_at || null, offer_end_at || null, offer_until_stock_out ? 1 : 0, offer_max_quantity || null, product_id]
        );

        res.status(201).json({
            message: lang === 'en' ? 'Deal created successfully.' : 'تم إنشاء العرض بنجاح.'
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const updateDeal = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;
    const { discount_price, offer_start_at, offer_end_at, offer_until_stock_out, offer_max_quantity } = req.body;

    try {
        await db.query(
            `UPDATE products SET 
                discount_price = ?, offer_start_at = ?, offer_end_at = ?, 
                offer_until_stock_out = ?, offer_max_quantity = ?
             WHERE id = ?`,
            [discount_price, offer_start_at || null, offer_end_at || null, offer_until_stock_out ? 1 : 0, offer_max_quantity || null, id]
        );

        res.status(200).json({
            message: lang === 'en' ? 'Deal updated successfully.' : 'تم تحديث العرض بنجاح.'
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const deleteDeal = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;

    try {
        await db.query(
            'UPDATE products SET discount_price = NULL, offer_start_at = NULL, offer_end_at = NULL, offer_until_stock_out = FALSE, offer_max_quantity = NULL WHERE id = ?',
            [id]
        );

        res.status(200).json({
            message: lang === 'en' ? 'Deal deleted successfully.' : 'تم حذف العرض بنجاح.'
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};
