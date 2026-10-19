import db from '../config/db.js';

export const getAllOrders = async (req, res) => {
    const lang = req.lang;
    try {
        const [orders] = await db.query(`
            SELECT o.*, o.order_date AS createdAt, o.order_status AS status, o.total_amount AS total,
                   u.name AS customer_name, u.email AS customer_email,
                   o.customer_phone AS order_phone
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.order_date DESC
        `);

        const normalized = [];

        for (const o of orders) {
            const [items] = await db.query(`
                SELECT oi.*, p.name_ar, p.name_en, p.product_image, p.unit_type AS product_unit_type, p.unit_ar, p.unit_en
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [o.id]);

            normalized.push({
                id: o.id,
                customerDetails: {
                    name: o.customer_name,
                    email: o.customer_email,
                    phone: o.order_phone || "",
                    address: o.shipping_address,
                },
                items: items.map(i => ({
                    id: i.id,
                    productId: i.product_id,
                    nameAr: i.item_name_ar || i.name_ar,
                    nameEn: i.item_name_en || i.name_en,
                    image: i.item_image || i.product_image,
                    quantity: i.quantity,
                    pricePerUnit: Number(i.price_per_unit),
                    totalPrice: Number(i.total_price),
                    unitType: i.unit_type || i.product_unit_type || "quantity",
                    unit: i.unit_ar || i.unit_en || "قطعة",
                    isOfferItem: Boolean(i.is_offer_item || i.offer_quantity_used > 0)
                })),
                totalPrice: Number(o.total),
                paymentMethod: o.payment_method,
                paymentDetails: {
                    transactionId: o.payment_transaction_id,
                    receiptImage: o.payment_receipt_url,
                },
                status: String(o.status).toUpperCase(),
                createdAt: o.createdAt,
                shippingAddress: o.shipping_address,
                customerPhone: o.order_phone || "",
                customerNotes: o.customer_notes || "",
            });
        }

        res.status(200).json(normalized);
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const getOrderById = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;

    try {
        const [orders] = await db.query(`
            SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `, [id]);

        if (orders.length === 0) {
            return res.status(404).json({
                message: lang === 'en' ? 'Order not found.' : 'الطلب غير موجود.'
            });
        }

        const o = orders[0];

        const [items] = await db.query(`
            SELECT oi.*, p.name_ar, p.name_en, p.product_image, p.unit_type AS product_unit_type, p.unit_ar, p.unit_en
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [id]);

        const normalized = {
            id: o.id,
            customerDetails: {
                name: o.customer_name,
                email: o.customer_email,
                phone: o.customer_phone,
                address: o.shipping_address,
            },
            items: items.map(i => ({
                id: i.id,
                productId: i.product_id,
                nameAr: i.item_name_ar || i.name_ar,
                nameEn: i.item_name_en || i.name_en,
                image: i.item_image || i.product_image,
                quantity: i.quantity,
                pricePerUnit: Number(i.price_per_unit),
                totalPrice: Number(i.total_price),
                unitType: i.unit_type || i.product_unit_type || "quantity",
                unit: i.unit_ar || i.unit_en || "قطعة",
                isOfferItem: Boolean(i.is_offer_item || i.offer_quantity_used > 0)
            })),
            totalPrice: Number(o.total_amount),
            paymentMethod: o.payment_method,
            paymentDetails: {
                transactionId: o.payment_transaction_id,
                receiptImage: o.payment_receipt_url,
            },
            status: String(o.order_status).toUpperCase(),
            createdAt: o.order_date,
            shippingAddress: o.shipping_address,
            customerPhone: o.customer_phone,
            customerNotes: o.customer_notes,
        };

        res.status(200).json(normalized);
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

const restoreStockForCanceledOrder = async (connection, orderId) => {
    const [items] = await connection.query(
        'SELECT product_id, quantity, offer_quantity_used, offer_snapshot FROM order_items WHERE order_id = ?',
        [orderId]
    );

    for (const item of items) {
        await connection.query(
            `UPDATE product_stock SET available_quantity = available_quantity + ? WHERE product_id = ?`,
            [item.quantity, item.product_id]
        );

        if (item.offer_quantity_used > 0 && item.offer_snapshot) {
            let snapshot;
            try {
                snapshot = JSON.parse(item.offer_snapshot);
            } catch {
                snapshot = null;
            }
            if (!snapshot) continue;

            const [productRows] = await connection.query(
                'SELECT discount_price, offer_until_stock_out, offer_stock_remaining FROM products WHERE id = ?',
                [item.product_id]
            );
            if (productRows.length === 0) continue;
            const product = productRows[0];

            if (!snapshot.offer_until_stock_out) continue;

            const offerWasAutoClosed = product.discount_price === null && !product.offer_until_stock_out;

            if (offerWasAutoClosed) {
                const restoredRemaining = snapshot.offer_max_quantity != null
                    ? Math.min(item.offer_quantity_used, snapshot.offer_max_quantity)
                    : item.offer_quantity_used;
                await connection.query(
                    `UPDATE products 
                     SET discount_price = ?, offer_until_stock_out = TRUE, offer_max_quantity = ?,
                         offer_stock_remaining = ?, offer_start_at = ?, offer_end_at = ?
                     WHERE id = ?`,
                    [snapshot.discount_price, snapshot.offer_max_quantity, restoredRemaining,
                     snapshot.offer_start_at, snapshot.offer_end_at, item.product_id]
                );
            } else {
                await connection.query(
                    `UPDATE products 
                     SET offer_stock_remaining = LEAST(
                            COALESCE(offer_stock_remaining, 0) + ?,
                            COALESCE(offer_max_quantity, COALESCE(offer_stock_remaining, 0) + ?)
                         )
                     WHERE id = ?`,
                    [item.offer_quantity_used, item.offer_quantity_used, item.product_id]
                );
            }
        }
    }
};

export const updateOrderStatus = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'canceled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            message: lang === 'en' ? 'Invalid status.' : 'حالة غير صالحة.'
        });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [existingRows] = await connection.query(
            'SELECT order_status FROM orders WHERE id = ?',
            [id]
        );

        if (existingRows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({
                message: lang === 'en' ? 'Order not found.' : 'الطلب غير موجود.'
            });
        }

        const previousStatus = String(existingRows[0].order_status || '').toLowerCase();

        if (status === 'canceled' && previousStatus !== 'canceled') {
            await restoreStockForCanceledOrder(connection, id);
        }

        await connection.query('UPDATE orders SET order_status = ? WHERE id = ?', [status, id]);

        const [orders] = await connection.query(`
            SELECT o.*, u.name AS customer_name, u.email AS customer_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `, [id]);

        if (orders.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({
                message: lang === 'en' ? 'Order not found.' : 'الطلب غير موجود.'
            });
        }

        const o = orders[0];

        const [items] = await connection.query(`
            SELECT oi.*, p.name_ar, p.name_en, p.product_image, p.unit_type AS product_unit_type, p.unit_ar, p.unit_en
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [id]);

        const normalized = {
            id: o.id,
            customerDetails: {
                name: o.customer_name,
                email: o.customer_email,
                phone: o.customer_phone,
                address: o.shipping_address,
            },
            items: items.map(i => ({
                id: i.id,
                productId: i.product_id,
                nameAr: i.item_name_ar || i.name_ar,
                nameEn: i.item_name_en || i.name_en,
                image: i.item_image || i.product_image,
                quantity: i.quantity,
                pricePerUnit: Number(i.price_per_unit),
                totalPrice: Number(i.total_price),
                unitType: i.unit_type || i.product_unit_type || "quantity",
                unit: i.unit_ar || i.unit_en || "قطعة",
                isOfferItem: Boolean(i.is_offer_item || i.offer_quantity_used > 0)
            })),
            totalPrice: Number(o.total_amount),
            paymentMethod: o.payment_method,
            paymentDetails: {
                transactionId: o.payment_transaction_id,
                receiptImage: o.payment_receipt_url,
            },
            status: String(o.order_status).toUpperCase(),
            createdAt: o.order_date,
            shippingAddress: o.shipping_address,
            customerPhone: o.customer_phone,
            customerNotes: o.customer_notes,
        };

        await connection.commit();
        connection.release();

        res.status(200).json(normalized);
    } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};