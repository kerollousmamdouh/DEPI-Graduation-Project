import db from '../config/db.js';

export const getBestSellingProducts = async (req, res) => {
    const lang = req.lang;
    const { category, search, limit = 10, page = 1 } = req.query;

    try {
        let query = `
            SELECT 
                p.id, p.name_ar, p.name_en, p.slug, p.price, p.discount_price, p.product_image,
                p.category_id,
                IFNULL(p.name_${lang}, p.name_ar) AS name,
                COALESCE(SUM(oi.quantity), 0) AS units_sold
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.id AND o.order_status != 'canceled'
        `;

        const params = [];
        const conditions = ['p.is_active = TRUE'];

        if (category) {
            conditions.push('p.category_id = ?');
            params.push(category);
        }

        if (search) {
            conditions.push(`(p.name_ar LIKE ? OR p.name_en LIKE ?)`);
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ` WHERE ${conditions.join(' AND ')}`;
        query += ` GROUP BY p.id ORDER BY units_sold DESC`;

        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        params.push(Number(limit), offset);

        const [products] = await db.query(query, params);

        // Count total
        let countQuery = `SELECT COUNT(DISTINCT p.id) AS total FROM products p`;
        const countParams = [];
        if (category || search) {
            const countConditions = ['p.is_active = TRUE'];
            if (category) { countConditions.push('p.category_id = ?'); countParams.push(category); }
            if (search) { countConditions.push(`(p.name_ar LIKE ? OR p.name_en LIKE ?)`); countParams.push(`%${search}%`, `%${search}%`); }
            countQuery += ` WHERE ${countConditions.join(' AND ')}`;
        }

        const [countResult] = await db.query(countQuery, countParams);
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        res.status(200).json({
            products,
            totalItems,
            totalPages,
            page: Number(page)
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};
