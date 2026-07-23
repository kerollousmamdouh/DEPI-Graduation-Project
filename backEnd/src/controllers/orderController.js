// src/controllers/orderController.js
import db from '../config/db.js';

const ensureSchema = async () => {
    await db.query(`CREATE TABLE IF NOT EXISTS product_stock (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL UNIQUE,
        available_quantity INT DEFAULT 0,
        min_stock_level INT DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_product_id (product_id)
    )`).catch(() => {});
    await db.query(`ALTER TABLE products ADD COLUMN unit_type ENUM('quantity','weight') DEFAULT 'quantity' AFTER unit_en`).catch(() => {});
    await db.query(`ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(100) DEFAULT 'cash_on_delivery'`).catch(() => {});
    await db.query(`ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(20) NULL`).catch(() => {});
    await db.query(`ALTER TABLE orders ADD COLUMN customer_notes TEXT NULL`).catch(() => {});
    await db.query(`ALTER TABLE orders ADD COLUMN payment_transaction_id VARCHAR(255) NULL`).catch(() => {});
    await db.query(`ALTER TABLE orders ADD COLUMN payment_receipt_url TEXT NULL`).catch(() => {});
};
ensureSchema();

export const checkoutOrder = async (req, res) => {
    const userId = req.user.id;
    const { address_id, phone_number, notes, manual_address, payment_method, payment_transaction_id, payment_receipt_url } = req.body; 
    const lang = req.lang;

    if (!address_id && !manual_address) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Please specify a shipping address to complete the order.' : 'من فضلك حدد عنوان الشحن لإتمام الطلب' 
        });
    }
    if (!phone_number) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Phone number is required to complete the order.' : 'رقم الهاتف مطلوب لإتمام الطلب' 
        });
    }

    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const [cartItems] = await connection.query(
            `SELECT c.quantity, p.id AS product_id, p.wholesale_price, p.unit_type,
                CASE 
                    WHEN p.discount_price IS NOT NULL 
                         AND (p.offer_until_stock_out = TRUE OR (p.offer_start_at <= NOW() AND p.offer_end_at >= NOW()))
                    THEN p.discount_price 
                    ELSE p.price 
                END AS active_price
             FROM cart_items c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.user_id = ?`, 
            [userId]
        );

        if (cartItems.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ 
                message: lang === 'en' ? 'Your cart is empty, you cannot checkout.' : 'سلتك فارغة، لا يمكنك إتمام الطلب' 
            });
        }

        for (const item of cartItems) {
            const [stock] = await connection.query(
                'SELECT available_quantity FROM product_stock WHERE product_id = ?',
                [item.product_id]
            );

            if (stock.length === 0 || stock[0].available_quantity < item.quantity) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ 
                    message: lang === 'en'
                        ? `Sorry, the requested quantity for product ID (${item.product_id}) is unavailable.`
                        : `عذراً يا برنس، الكمية المطلوبة من المنتج رقم (${item.product_id}) غير متوفرة في المخزن حالياً.` 
                });
            }
        }

        let shippingAddress = '';

        if (address_id) {
            const [addressResult] = await connection.query(
                'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
                [address_id, userId]
            );

            if (addressResult.length > 0) {
                const addr = addressResult[0];
                shippingAddress = `${addr.title} - ${addr.city}, ${addr.area}, St: ${addr.street_details}`;
                if (addr.building_number) shippingAddress += `, Bldg: ${addr.building_number}`;
                if (addr.floor_number) shippingAddress += `, Floor: ${addr.floor_number}`;
            } else {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ 
                    message: lang === 'en' ? 'The selected shipping address is invalid.' : 'عنوان الشحن المختار غير صالح' 
                });
            }
        } else {
            shippingAddress = manual_address;
        }

        if (notes) {
            shippingAddress += lang === 'en' ? ` | Note: ${notes}` : ` | ملاحظة: ${notes}`;
        }

        let subtotal = 0;
        cartItems.forEach(item => {
            const effectiveQty = item.unit_type === 'weight' ? item.quantity / 100 : item.quantity;
            subtotal += item.active_price * effectiveQty;
        });

        let shippingPrice = 0.00; 
        let totalAmount = subtotal + shippingPrice;

        const finalPaymentMethod = payment_method || 'cash_on_delivery';

        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, subtotal, shipping_price, total_amount, shipping_address, customer_phone, customer_notes, payment_method, payment_transaction_id, payment_receipt_url, order_status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [userId, subtotal, shippingPrice, totalAmount, shippingAddress, phone_number || null, notes || null, finalPaymentMethod, payment_transaction_id || null, payment_receipt_url || null]
        );
        const orderId = orderResult.insertId;

        for (const item of cartItems) {
            const effectiveQty = item.unit_type === 'weight' ? item.quantity / 100 : item.quantity;
            const itemTotalPrice = item.active_price * effectiveQty;
            
            await connection.query(
                `INSERT INTO order_items 
                (order_id, product_id, quantity, price_per_unit, purchase_wholesale_price, total_price) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, item.product_id, effectiveQty, item.active_price, item.wholesale_price, itemTotalPrice]
            );

            await connection.query(
                `UPDATE product_stock 
                 SET available_quantity = available_quantity - ? 
                 WHERE product_id = ?`,
                [item.quantity, item.product_id]
            );

            const [updatedStock] = await connection.query(
                'SELECT available_quantity, min_stock_level FROM product_stock WHERE product_id = ?',
                [item.product_id]
            );

            if (updatedStock.length > 0) {
                const currentStock = updatedStock[0].available_quantity;
                const minLevel = updatedStock[0].min_stock_level;
                if (currentStock <= minLevel) {
                    console.log(`\x1b[33m⚠️ Product (${item.product_id}) below min stock after order! Remaining: ${currentStock}\x1b[0m`);
                }
            }
        }

        await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

        await connection.commit();
        connection.release();

        res.status(201).json({ 
            message: lang === 'en' ? 'Your order has been placed successfully! 🎉📦' : 'تم تسجيل طلبك بنجاح يا برنس! 🎉📦', 
            orderId: orderId,
            subtotal: subtotal,
            total_amount: totalAmount 
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while placing the order.' : 'حدث خطأ أثناء إتمام الطلب', 
            error: error.message 
        });
    }
};

export const getMyOrders = async (req, res) => {
    const userId = req.user.id;
    const lang = req.lang;
    try {
        const [orders] = await db.query(
            `SELECT o.*, 
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', oi.id,
                            'productId', oi.product_id,
                            'quantity', oi.quantity,
                            'pricePerUnit', oi.price_per_unit,
                            'totalPrice', oi.total_price,
                            'nameAr', p.name_ar,
                            'nameEn', p.name_en,
                            'image', p.product_image
                        )
                    ) as items
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE o.user_id = ?
             GROUP BY o.id
             ORDER BY o.order_date DESC`, 
            [userId]
        );

        const normalized = orders.map(o => ({
            id: o.id,
            items: o.items || [],
            totalPrice: Number(o.total_amount),
            paymentMethod: o.payment_method,
            paymentTransactionId: o.payment_transaction_id,
            status: o.order_status,
            createdAt: o.order_date,
            shippingAddress: o.shipping_address,
            customerPhone: o.customer_phone,
        }));

        res.status(200).json(normalized);
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};
