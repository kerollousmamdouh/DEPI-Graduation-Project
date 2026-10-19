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
    await db.query(`ALTER TABLE products ADD COLUMN unit_type ENUM('quantity','weight') DEFAULT 'quantity'`).catch(() => {});
    await db.query(`ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(100) DEFAULT 'cash_on_delivery'`).catch(() => {});
    await db.query(`ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(20) NULL`).catch(() => {});
    await db.query(`ALTER TABLE orders ADD COLUMN customer_notes TEXT NULL`).catch(() => {});
    await db.query(`ALTER TABLE orders ADD COLUMN payment_transaction_id VARCHAR(255) NULL`).catch(() => {});
    await db.query(`ALTER TABLE orders ADD COLUMN payment_receipt_url TEXT NULL`).catch(() => {});
    await db.query(`ALTER TABLE order_items ADD COLUMN unit_type VARCHAR(20) DEFAULT NULL AFTER total_price`).catch(() => {});
    await db.query(`ALTER TABLE order_items ADD COLUMN item_name_ar VARCHAR(255) DEFAULT NULL AFTER unit_type`).catch(() => {});
    await db.query(`ALTER TABLE order_items ADD COLUMN item_name_en VARCHAR(255) DEFAULT NULL AFTER item_name_ar`).catch(() => {});
    await db.query(`ALTER TABLE order_items ADD COLUMN item_image TEXT DEFAULT NULL AFTER item_name_en`).catch(() => {});
    await db.query(`ALTER TABLE products ADD COLUMN offer_stock_remaining INT DEFAULT NULL`).catch(() => {});
    await db.query(`ALTER TABLE order_items ADD COLUMN offer_quantity_used INT DEFAULT 0`).catch(() => {});
    await db.query(`ALTER TABLE order_items ADD COLUMN offer_snapshot TEXT DEFAULT NULL`).catch(() => {});
    await db.query(`ALTER TABLE order_items ADD COLUMN is_offer_item BOOLEAN DEFAULT FALSE`).catch(() => {});
};
ensureSchema();

const splitOfferQuantity = (product, totalQuantity) => {
    const now = new Date();
    const offerNotExpired = !product.offer_end_at || new Date(product.offer_end_at) >= now;
    const offerHasStockIfLimited = !product.offer_until_stock_out || (product.offer_stock_remaining > 0);
    const offerHasStarted = product.offer_until_stock_out || !product.offer_start_at || new Date(product.offer_start_at) <= now;
    const isOfferActive = product.discount_price != null && offerNotExpired && offerHasStockIfLimited && offerHasStarted;

    if (!isOfferActive) {
        return { offerQty: 0, regularQty: totalQuantity };
    }
    if (product.offer_until_stock_out) {
        const offerQty = Math.min(totalQuantity, product.offer_stock_remaining || 0);
        return { offerQty, regularQty: totalQuantity - offerQty };
    }
    return { offerQty: totalQuantity, regularQty: 0 };
};

const buildSplitItems = (product, totalQuantity) => {
    const { offerQty, regularQty } = splitOfferQuantity(product, totalQuantity);

    const baseFields = {
        product_id: product.id,
        item_name_ar: product.name_ar,
        item_name_en: product.name_en,
        item_image: product.product_image,
        wholesale_price: product.wholesale_price,
        unit_type: product.unit_type,
        discount_price: product.discount_price,
        offer_until_stock_out: !!product.offer_until_stock_out,
        offer_max_quantity: product.offer_max_quantity,
        offer_start_at: product.offer_start_at,
        offer_end_at: product.offer_end_at,
    };

    const items = [];
    if (offerQty > 0) {
        items.push({ ...baseFields, quantity: offerQty, active_price: product.discount_price, is_offer_portion: true });
    }
    if (regularQty > 0) {
        items.push({ ...baseFields, quantity: regularQty, active_price: product.price, is_offer_portion: false });
    }
    return items;
};

const resolveOrderItems = async (connection, userId, directItems) => {
    let rawQuantities = new Map();

    if (directItems && directItems.length > 0) {
        for (const d of directItems) {
            const productId = d.product_id || d.productId;
            const quantity = d.quantity || 0;
            if (!productId || quantity <= 0) continue;
            rawQuantities.set(productId, (rawQuantities.get(productId) || 0) + quantity);
        }
    } else {
        const [cartRows] = await connection.query(
            `SELECT product_id, SUM(quantity) AS quantity FROM cart_items WHERE user_id = ? GROUP BY product_id`,
            [userId]
        );
        for (const row of cartRows) {
            rawQuantities.set(row.product_id, row.quantity);
        }
    }

    const items = [];
    for (const [productId, totalQuantity] of rawQuantities) {
        const [prod] = await connection.query(
            `SELECT p.id, p.name_ar, p.name_en, p.product_image, p.wholesale_price, p.unit_type, p.price,
                p.discount_price, p.offer_until_stock_out, p.offer_stock_remaining, p.offer_max_quantity,
                p.offer_start_at, p.offer_end_at
             FROM products p WHERE p.id = ?`,
            [productId]
        );
        if (prod.length === 0) continue;

        items.push(...buildSplitItems(prod[0], totalQuantity));
    }

    return items;
};

export const checkoutOrder = async (req, res) => {
    const userId = req.user.id;
    const { address_id, phone_number, notes, manual_address, payment_method, payment_transaction_id, payment_receipt_url, items: directItems } = req.body; 
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

        const orderItems = await resolveOrderItems(connection, userId, directItems);

        if (orderItems.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ 
                message: lang === 'en' ? 'No items to checkout.' : 'لا يوجد منتجات لإتمام الطلب' 
            });
        }

        const requestedTotals = new Map();
        for (const item of orderItems) {
            requestedTotals.set(item.product_id, (requestedTotals.get(item.product_id) || 0) + item.quantity);
        }

        for (const [productId, totalQty] of requestedTotals) {
            const [stock] = await connection.query(
                'SELECT available_quantity FROM product_stock WHERE product_id = ?',
                [productId]
            );

            if (stock.length === 0 || stock[0].available_quantity < totalQty) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ 
                    message: lang === 'en'
                        ? `Sorry, the requested quantity for product ID (${productId}) is unavailable.`
                        : `عذراً يا برنس، الكمية المطلوبة من المنتج رقم (${productId}) غير متوفرة في المخزن حالياً.` 
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
        orderItems.forEach(item => {
            const effectiveQty = item.unit_type === 'weight' ? item.quantity / 1000 : item.quantity;
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

        for (const item of orderItems) {
            const effectiveQty = item.unit_type === 'weight' ? item.quantity / 1000 : item.quantity;
            const itemTotalPrice = item.active_price * effectiveQty;

            const offerQuantityUsed = (item.is_offer_portion && item.offer_until_stock_out)
                ? item.quantity
                : 0;

            const offerSnapshot = offerQuantityUsed > 0 ? JSON.stringify({
                discount_price: item.discount_price,
                offer_max_quantity: item.offer_max_quantity,
                offer_until_stock_out: !!item.offer_until_stock_out,
                offer_start_at: item.offer_start_at,
                offer_end_at: item.offer_end_at,
            }) : null;

            await connection.query(
                `INSERT INTO order_items 
                (order_id, product_id, quantity, price_per_unit, purchase_wholesale_price, total_price, unit_type,
                 item_name_ar, item_name_en, item_image, offer_quantity_used, offer_snapshot, is_offer_item) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [orderId, item.product_id, item.quantity, item.active_price, item.wholesale_price, itemTotalPrice, item.unit_type,
                 item.item_name_ar || null, item.item_name_en || null, item.item_image || null, offerQuantityUsed, offerSnapshot, item.is_offer_portion ? 1 : 0]
            );

            await connection.query(
                `UPDATE product_stock 
                 SET available_quantity = available_quantity - ? 
                 WHERE product_id = ?`,
                [item.quantity, item.product_id]
            );

            if (item.is_offer_portion && item.offer_until_stock_out) {
                await connection.query(
                    `UPDATE products 
                     SET offer_stock_remaining = GREATEST(offer_stock_remaining - ?, 0)
                     WHERE id = ?`,
                    [item.quantity, item.product_id]
                );

                const [offerCheck] = await connection.query(
                    'SELECT offer_stock_remaining FROM products WHERE id = ?',
                    [item.product_id]
                );

                if (offerCheck.length > 0 && offerCheck[0].offer_stock_remaining <= 0) {
                    await connection.query(
                        `UPDATE products SET 
                            discount_price = NULL, offer_until_stock_out = FALSE, 
                            offer_max_quantity = NULL, offer_stock_remaining = NULL
                         WHERE id = ?`,
                        [item.product_id]
                    );
                    console.log(`\x1b[33m🎉 Offer stock exhausted for product (${item.product_id}) — offer auto-cancelled.\x1b[0m`);
                }
            }

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

        if (!directItems || directItems.length === 0) {
            await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
        }

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
                            'nameAr', COALESCE(oi.item_name_ar, p.name_ar),
                            'nameEn', COALESCE(oi.item_name_en, p.name_en),
                            'image', COALESCE(oi.item_image, p.product_image),
                            'unitType', COALESCE(oi.unit_type, p.unit_type),
                            'unit', p.unit_ar,
                            'isOfferItem', IF(oi.is_offer_item = 1 OR oi.offer_quantity_used > 0, true, false)
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