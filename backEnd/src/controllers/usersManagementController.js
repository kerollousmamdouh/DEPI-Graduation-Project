import db from '../config/db.js';
import bcrypt from 'bcrypt';

export const getAllUsers = async (req, res) => {
    const lang = req.lang;
    try {
        // Ensure is_active column exists
        await db.query("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER is_verified").catch(() => {});

        const [users] = await db.query(
            `SELECT id, name, email, phone, gender, photo_url, role, is_verified, is_active, created_at,
                    CASE WHEN is_active = TRUE THEN 'Active' ELSE 'Blocked' END AS status
             FROM users 
             WHERE role = 'customer' 
             ORDER BY created_at DESC`
        );

        // حساب عدد الطلبات والإيراد لكل عميل
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const [orderStats] = await db.query(
                `SELECT COUNT(*) AS totalOrders, COALESCE(SUM(total_amount), 0) AS totalSpent 
                 FROM orders WHERE user_id = ? AND order_status != 'canceled'`,
                [user.id]
            );
            return {
                ...user,
                totalOrders: orderStats[0].totalOrders,
                totalSpent: Number(orderStats[0].totalSpent)
            };
        }));

        res.status(200).json(usersWithStats);
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const createUser = async (req, res) => {
    const lang = req.lang;
    const { name, email, password, phone, gender } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: lang === 'en' ? 'Name, email and password are required.' : 'الاسم والإيميل وكلمة المرور مطلوبة.'
        });
    }

    try {
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({
                message: lang === 'en' ? 'Email already registered.' : 'البريد الإلكتروني مسجل بالفعل.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await db.query(
            'INSERT INTO users (name, email, password_hash, phone, gender, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
            [name, email, passwordHash, phone || null, gender || null, 'customer']
        );

        res.status(201).json({
            message: lang === 'en' ? 'User created successfully.' : 'تم إنشاء المستخدم بنجاح.'
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const updateUser = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;
    const { name, email, phone, gender } = req.body;

    try {
        const [existing] = await db.query('SELECT id FROM users WHERE id = ? AND role = ?', [id, 'customer']);
        if (existing.length === 0) {
            return res.status(404).json({
                message: lang === 'en' ? 'User not found.' : 'المستخدم غير موجود.'
            });
        }

        await db.query(
            'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), phone = ?, gender = COALESCE(?, gender) WHERE id = ?',
            [name || null, email || null, phone || null, gender || null, id]
        );

        res.status(200).json({
            message: lang === 'en' ? 'User updated successfully.' : 'تم تحديث المستخدم بنجاح.'
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const deleteUser = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;

    try {
        // Get the user's email before deleting, to clean up chat history
        const [userRow] = await db.query('SELECT email FROM users WHERE id = ? AND role = ?', [id, 'customer']);
        const userEmail = userRow.length > 0 ? userRow[0].email : null;

        // Delete the user account
        await db.query('DELETE FROM users WHERE id = ? AND role = ?', [id, 'customer']);

        // If user had an email, remove their chat history entirely
        if (userEmail) {
            // Delete all chat messages for this user's tickets
            await db.query(
                `DELETE FROM chat_messages WHERE ticket_id IN 
                 (SELECT ticket_id FROM contacts WHERE email = ? AND ticket_id IS NOT NULL)`,
                [userEmail]
            ).catch(() => {});
            // Delete the contact/ticket records
            await db.query('DELETE FROM contacts WHERE email = ?', [userEmail]).catch(() => {});
        }

        res.status(200).json({
            message: lang === 'en' ? 'User and their chat history deleted successfully.' : 'تم حذف المستخدم وسجل الدردشة بنجاح.'
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const toggleUserStatus = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;

    try {
        // Ensure is_active column exists
        await db.query("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER is_verified").catch(() => {});

        const [existing] = await db.query('SELECT is_active FROM users WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                message: lang === 'en' ? 'User not found.' : 'المستخدم غير موجود.'
            });
        }

        const newStatus = existing[0].is_active ? 0 : 1;
        await db.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

        res.status(200).json({
            message: lang === 'en' ? 'Status updated.' : 'تم تحديث الحالة.',
            is_active: newStatus,
            status: newStatus ? "Active" : "Blocked"
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};
