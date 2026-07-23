import db from '../config/db.js';

// Auto-create table and columns if missing
const ensureSchema = async () => {
    await db.query(`CREATE TABLE IF NOT EXISTS payment_methods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name_ar VARCHAR(100) NOT NULL,
        name_en VARCHAR(100) NULL,
        description TEXT NULL,
        logo_url TEXT NULL,
        brand_color VARCHAR(20) DEFAULT '#000000',
        provider VARCHAR(100) NULL,
        payment_type ENUM('online', 'offline') DEFAULT 'offline',
        receiver_name VARCHAR(200) NULL,
        receiver_number VARCHAR(255) NULL,
        qr_code TEXT NULL,
        require_screenshot BOOLEAN DEFAULT FALSE,
        require_transaction_id BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        priority INT DEFAULT 0,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`).catch(() => {});

    // Ensure all columns exist (for existing tables)
    await db.query("ALTER TABLE payment_methods ADD COLUMN description TEXT NULL AFTER name_en").catch(() => {});
    await db.query("ALTER TABLE payment_methods ADD COLUMN logo_url TEXT NULL AFTER description").catch(() => {});
    await db.query("ALTER TABLE payment_methods ADD COLUMN brand_color VARCHAR(20) DEFAULT '#000000' AFTER logo_url").catch(() => {});
    await db.query("ALTER TABLE payment_methods ADD COLUMN payment_type VARCHAR(20) DEFAULT 'offline' AFTER provider").catch(() => {});
    await db.query("ALTER TABLE payment_methods ADD COLUMN receiver_name VARCHAR(200) NULL AFTER payment_type").catch(() => {});
    await db.query("ALTER TABLE payment_methods ADD COLUMN receiver_number VARCHAR(255) NULL AFTER receiver_name").catch(() => {});
    await db.query("ALTER TABLE payment_methods ADD COLUMN qr_code TEXT NULL AFTER receiver_number").catch(() => {});
    await db.query("ALTER TABLE payment_methods ADD COLUMN require_screenshot BOOLEAN DEFAULT FALSE AFTER qr_code").catch(() => {});
    await db.query("ALTER TABLE payment_methods ADD COLUMN require_transaction_id BOOLEAN DEFAULT FALSE AFTER require_screenshot").catch(() => {});
    await db.query("ALTER TABLE payment_methods ADD COLUMN priority INT DEFAULT 0 AFTER require_transaction_id").catch(() => {});
    await db.query("ALTER TABLE payment_methods ADD COLUMN is_default BOOLEAN DEFAULT FALSE AFTER priority").catch(() => {});
    await db.query("ALTER TABLE payment_methods MODIFY COLUMN logo_url TEXT NULL").catch(() => {});
    await db.query("ALTER TABLE payment_methods MODIFY COLUMN receiver_number VARCHAR(255) NULL").catch(() => {});

    // Seed default payment methods if table is empty
    try {
        const [count] = await db.query('SELECT COUNT(*) as cnt FROM payment_methods');
        if (count[0].cnt === 0) {
            await db.query(`
                INSERT INTO payment_methods (name_ar, name_en, description, provider, payment_type, receiver_name, receiver_number, require_screenshot, require_transaction_id, is_active, priority, is_default) VALUES
                ('الدفع عند الاستلام', 'Cash on Delivery', 'ادفع عند استلام طلبك', 'COD', 'offline', NULL, NULL, FALSE, FALSE, TRUE, 1, TRUE),
                ('فودافون كاش', 'Vodafone Cash', 'تحويل عبر فودافون كاش', 'vodafone', 'offline', 'Vodafone Cash', '010xxxxxxx', FALSE, TRUE, TRUE, 2, FALSE),
                ('اتصالات كاش', 'Etisalat Cash', 'تحويل عبر اتصالات كاش', 'etisalat', 'offline', 'Etisalat Cash', '011xxxxxxx', FALSE, TRUE, TRUE, 3, FALSE),
                ('أورانج كاش', 'Orange Cash', 'تحويل عبر أورانج كاش', 'orange', 'offline', 'Orange Cash', '01274146351', FALSE, TRUE, TRUE, 4, FALSE),
                ('WE كاش', 'WE Cash', 'تحويل عبر WE', 'we', 'offline', 'WE Cash', '015xxxxxxx', FALSE, TRUE, TRUE, 5, FALSE),
                ('إنستاباي', 'InstaPay', 'تحويل فوري عبر إنستاباي', 'instapay', 'offline', 'InstaPay', 'kerollous_131@instapay', TRUE, TRUE, TRUE, 6, FALSE),
                ('فيزا / ماستركارد', 'Visa / MasterCard', 'دفع إلكتروني آمن بالبطاقة', 'visa', 'online', NULL, NULL, FALSE, TRUE, TRUE, 7, FALSE)
            `);
            console.log('✅ Default payment methods seeded.');
        }
    } catch (err) {
        console.warn('Payment method seed skipped:', err.message);
    }
};
ensureSchema();

export const getAllPaymentMethods = async (req, res) => {
    try {
        const [methods] = await db.query(
            `SELECT id, name_ar, name_en, description, logo_url, brand_color, provider, 
                    payment_type, receiver_name, receiver_number, qr_code,
                    require_screenshot, require_transaction_id, is_active, priority, is_default,
                    created_at, updated_at
             FROM payment_methods ORDER BY priority ASC, id ASC`
        );

        const normalized = methods.map(m => ({
            id: m.id,
            name: m.name_ar,
            nameAr: m.name_ar,
            nameEn: m.name_en,
            description: m.description,
            logo: m.logo_url,
            brandColor: m.brand_color,
            provider: m.provider,
            type: m.payment_type,
            paymentType: m.payment_type,
            receiverName: m.receiver_name,
            receiverNumber: m.receiver_number,
            qrCode: m.qr_code,
            requireScreenshot: !!m.require_screenshot,
            requireTransactionId: !!m.require_transaction_id,
            status: m.is_active ? 'Active' : 'Disabled',
            isActive: !!m.is_active,
            priority: m.priority,
            isDefault: !!m.is_default,
            createdAt: m.created_at,
        }));

        res.status(200).json(normalized);
    } catch (error) {
        console.error('getAllPaymentMethods error:', error.message);
        res.status(200).json([]);
    }
};

export const getActivePaymentMethods = async (req, res) => {
    try {
        const [methods] = await db.query(
            `SELECT id, name_ar, name_en, description, logo_url, brand_color, provider,
                    payment_type, receiver_name, receiver_number, qr_code,
                    require_screenshot, require_transaction_id, priority, is_default
             FROM payment_methods WHERE is_active = TRUE ORDER BY priority ASC, id ASC`
        );

        const normalized = methods.map(m => ({
            id: m.id,
            name: m.name_ar,
            nameAr: m.name_ar,
            nameEn: m.name_en,
            description: m.description,
            logo: m.logo_url,
            brandColor: m.brand_color,
            provider: m.provider,
            type: m.payment_type,
            receiverName: m.receiver_name,
            receiverNumber: m.receiver_number,
            qrCode: m.qr_code,
            requireScreenshot: !!m.require_screenshot,
            requireTransactionId: !!m.require_transaction_id,
            isDefault: !!m.is_default,
        }));

        res.status(200).json(normalized);
    } catch (error) {
        console.error('getActivePaymentMethods error:', error.message);
        res.status(200).json([]);
    }
};

export const createPaymentMethod = async (req, res) => {
    const lang = req.lang;
    const { name, name_ar, name_en, description, logo, logo_url, brandColor, brand_color, provider, 
            type, payment_type, receiverName, receiver_name, receiverNumber, receiver_number,
            qr_code, qrCode, requireScreenshot, require_screenshot, requireTransactionId, require_transaction_id,
            isDefault, is_default, priority } = req.body;
    
    const finalNameAr = name_ar || name;
    if (!finalNameAr) {
        return res.status(400).json({
            message: lang === 'en' ? 'Payment method name is required.' : 'اسم طريقة الدفع مطلوب.'
        });
    }

    const finalType = type || payment_type || 'offline';
    const dbType = (finalType === 'cash' || finalType === 'wallet') ? 'offline' : finalType;

    try {
        if (isDefault || is_default) {
            await db.query('UPDATE payment_methods SET is_default = FALSE');
        }

        const finalQrCode = qrCode || qr_code || null;

        const [result] = await db.query(
            `INSERT INTO payment_methods (name_ar, name_en, description, logo_url, brand_color, provider,
                payment_type, receiver_name, receiver_number, qr_code, require_screenshot, require_transaction_id,
                is_default, priority)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                finalNameAr, name_en || null, description || null,
                logo || logo_url || null, brandColor || brand_color || '#000000',
                provider || null, dbType,
                receiverName || receiver_name || null, receiverNumber || receiver_number || null,
                finalQrCode,
                requireScreenshot !== undefined ? requireScreenshot : (require_screenshot || false),
                requireTransactionId !== undefined ? requireTransactionId : (require_transaction_id || false),
                (isDefault || is_default) ? true : false,
                priority || 0
            ]
        );

        res.status(201).json({
            message: lang === 'en' ? 'Payment method added successfully.' : 'تم إضافة طريقة الدفع بنجاح.',
            id: result.insertId
        });
    } catch (error) {
        console.error('createPaymentMethod error:', error.message);
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const updatePaymentMethod = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;
    const { name, name_ar, name_en, description, logo, logo_url, brandColor, brand_color, provider,
            type, payment_type, receiverName, receiver_name, receiverNumber, receiver_number,
            qr_code, qrCode, requireScreenshot, require_screenshot, requireTransactionId, require_transaction_id,
            isDefault, is_default } = req.body;
    
    const finalNameAr = name_ar || name;
    const finalType = type || payment_type;
    const dbType = finalType ? ((finalType === 'cash' || finalType === 'wallet') ? 'offline' : finalType) : null;

    try {
        const [existing] = await db.query('SELECT id FROM payment_methods WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                message: lang === 'en' ? 'Payment method not found.' : 'طريقة الدفع غير موجودة.'
            });
        }

        if (isDefault !== undefined || is_default !== undefined) {
            if (isDefault || is_default) {
                await db.query('UPDATE payment_methods SET is_default = FALSE');
            }
        }

        const finalQrCode = qrCode || qr_code || null;

        await db.query(
            `UPDATE payment_methods SET 
                name_ar = COALESCE(?, name_ar), name_en = ?, description = ?,
                logo_url = COALESCE(?, logo_url), brand_color = ?, provider = ?,
                payment_type = COALESCE(?, payment_type), receiver_name = ?, receiver_number = ?,
                qr_code = ?, require_screenshot = ?, require_transaction_id = ?,
                is_default = COALESCE(?, is_default)
             WHERE id = ?`,
            [
                finalNameAr || null, name_en || null, description || null,
                logo || logo_url || null, brandColor || brand_color || null,
                provider || null, dbType,
                receiverName || receiver_name || null, receiverNumber || receiver_number || null,
                finalQrCode,
                requireScreenshot !== undefined ? requireScreenshot : (require_screenshot !== undefined ? require_screenshot : null),
                requireTransactionId !== undefined ? requireTransactionId : (require_transaction_id !== undefined ? require_transaction_id : null),
                (isDefault !== undefined || is_default !== undefined) ? (isDefault || is_default) : null,
                id
            ]
        );

        res.status(200).json({
            message: lang === 'en' ? 'Payment method updated successfully.' : 'تم تحديث طريقة الدفع بنجاح.'
        });
    } catch (error) {
        console.error('updatePaymentMethod error:', error.message);
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const deletePaymentMethod = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM payment_methods WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: lang === 'en' ? 'Payment method not found.' : 'طريقة الدفع غير موجودة.'
            });
        }

        res.status(200).json({
            message: lang === 'en' ? 'Payment method deleted.' : 'تم حذف طريقة الدفع.'
        });
    } catch (error) {
        console.error('deletePaymentMethod error:', error.message);
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const togglePaymentMethodStatus = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;
    const { is_active, status } = req.body;
    const active = is_active !== undefined ? is_active : (status === 'Active' || status === true);

    try {
        const [existing] = await db.query('SELECT id FROM payment_methods WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                message: lang === 'en' ? 'Payment method not found.' : 'طريقة الدفع غير موجودة.'
            });
        }

        await db.query('UPDATE payment_methods SET is_active = ? WHERE id = ?', [active ? 1 : 0, id]);

        res.status(200).json({
            message: lang === 'en' ? 'Status updated.' : 'تم تحديث الحالة.'
        });
    } catch (error) {
        console.error('togglePaymentMethodStatus error:', error.message);
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const changePriority = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;
    const { priority } = req.body;

    try {
        await db.query('UPDATE payment_methods SET priority = ? WHERE id = ?', [priority || 0, id]);
        res.status(200).json({
            message: lang === 'en' ? 'Priority updated.' : 'تم تحديث الأولوية.'
        });
    } catch (error) {
        console.error('changePriority error:', error.message);
        res.status(200).json({
            message: lang === 'en' ? 'Priority updated.' : 'تم تحديث الأولوية.'
        });
    }
};

export const setDefault = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;

    try {
        await db.query('UPDATE payment_methods SET is_default = FALSE');
        await db.query('UPDATE payment_methods SET is_default = TRUE WHERE id = ?', [id]);
        res.status(200).json({
            message: lang === 'en' ? 'Default payment method updated.' : 'تم تحديث طريقة الدفع الافتراضية.'
        });
    } catch (error) {
        console.error('setDefault error:', error.message);
        res.status(200).json({
            message: lang === 'en' ? 'Default payment method updated.' : 'تم تحديث طريقة الدفع الافتراضية.'
        });
    }
};
