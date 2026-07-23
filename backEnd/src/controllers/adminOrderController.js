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
                SELECT oi.*, p.name_ar, p.name_en, p.product_image
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
                    nameAr: i.name_ar,
                    nameEn: i.name_en,
                    image: i.product_image,
                    quantity: i.quantity,
                    pricePerUnit: Number(i.price_per_unit),
                    totalPrice: Number(i.total_price),
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
            SELECT oi.*, p.name_ar, p.name_en, p.product_image
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
                nameAr: i.name_ar,
                nameEn: i.name_en,
                image: i.product_image,
                quantity: i.quantity,
                pricePerUnit: Number(i.price_per_unit),
                totalPrice: Number(i.total_price),
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

    try {
        await db.query('UPDATE orders SET order_status = ? WHERE id = ?', [status, id]);

        const [orders] = await db.query(`
            SELECT o.*, u.name AS customer_name, u.email AS customer_email
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
            SELECT oi.*, p.name_ar, p.name_en, p.product_image
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
                nameAr: i.name_ar,
                nameEn: i.name_en,
                image: i.product_image,
                quantity: i.quantity,
                pricePerUnit: Number(i.price_per_unit),
                totalPrice: Number(i.total_price),
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
