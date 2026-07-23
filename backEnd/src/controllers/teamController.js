import db from '../config/db.js';
import bcrypt from 'bcrypt';

export const getTeamMembers = async (req, res) => {
    const lang = req.lang;
    try {
        const [members] = await db.query(
            'SELECT id, name, email, phone, role, is_active, created_at FROM users WHERE role IN (?, ?) ORDER BY created_at DESC',
            ['super_admin', 'store_manager']
        );
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const createTeamMember = async (req, res) => {
    const lang = req.lang;
    const { name, email, password, phone, role } = req.body;

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
            'INSERT INTO users (name, email, password_hash, phone, role, is_verified) VALUES (?, ?, ?, ?, ?, TRUE)',
            [name, email, passwordHash, phone || null, role || 'store_manager']
        );

        res.status(201).json({
            message: lang === 'en' ? 'Team member added successfully.' : 'تم إضافة العضو بنجاح.'
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const updateTeamMember = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;
    const { name, email, phone, role, is_active } = req.body;

    try {
        const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                message: lang === 'en' ? 'Member not found.' : 'العضو غير موجود.'
            });
        }

        await db.query(
            'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), phone = ?, role = COALESCE(?, role), is_active = COALESCE(?, is_active) WHERE id = ?',
            [name || null, email || null, phone || null, role || null, is_active !== undefined ? is_active : null, id]
        );

        res.status(200).json({
            message: lang === 'en' ? 'Member updated successfully.' : 'تم تحديث العضو بنجاح.'
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const deleteTeamMember = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;

    try {
        const [existing] = await db.query('SELECT role FROM users WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                message: lang === 'en' ? 'Member not found.' : 'العضو غير موجود.'
            });
        }

        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.status(200).json({
            message: lang === 'en' ? 'Member deleted successfully.' : 'تم حذف العضو بنجاح.'
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const toggleTeamMemberStatus = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;

    try {
        const [existing] = await db.query('SELECT is_active FROM users WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                message: lang === 'en' ? 'Member not found.' : 'العضو غير موجود.'
            });
        }

        const newStatus = existing[0].is_active ? 0 : 1;
        await db.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

        res.status(200).json({
            message: lang === 'en' ? 'Status updated.' : 'تم تحديث الحالة.',
            is_active: newStatus
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};
