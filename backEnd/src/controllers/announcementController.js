import db from '../config/db.js';

const toMySQLDatetime = (val) => {
    if (!val) return null;
    if (val instanceof Date) {
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
    return str.trim() || null;
};

// Ensure table and columns exist
const ensureSchema = async () => {
    await db.query(`CREATE TABLE IF NOT EXISTS site_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title_ar VARCHAR(255) NULL,
        message_ar TEXT NOT NULL,
        title_en VARCHAR(255) NULL,
        message_en TEXT NULL,
        start_at DATETIME NOT NULL,
        expires_at DATETIME NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        bg_color VARCHAR(20) NULL DEFAULT '#064e3b',
        text_color VARCHAR(20) NULL DEFAULT '#f0fdf4',
        title_color VARCHAR(20) NULL DEFAULT '#34d399',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`).catch(() => {});
    // Migrate old schema: rename title→title_ar, message→message_ar if old columns exist
    await db.query("ALTER TABLE site_notifications CHANGE COLUMN title title_ar VARCHAR(255) NULL").catch(() => {});
    await db.query("ALTER TABLE site_notifications CHANGE COLUMN message message_ar TEXT NOT NULL").catch(() => {});
    // Add missing columns if table was created with old schema
    await db.query("ALTER TABLE site_notifications ADD COLUMN title_en VARCHAR(255) NULL AFTER message_ar").catch(() => {});
    await db.query("ALTER TABLE site_notifications ADD COLUMN message_en TEXT NULL AFTER title_en").catch(() => {});
    await db.query("ALTER TABLE site_notifications ADD COLUMN bg_color VARCHAR(20) NULL DEFAULT '#064e3b' AFTER is_active").catch(() => {});
    await db.query("ALTER TABLE site_notifications ADD COLUMN text_color VARCHAR(20) NULL DEFAULT '#f0fdf4' AFTER bg_color").catch(() => {});
    await db.query("ALTER TABLE site_notifications ADD COLUMN title_color VARCHAR(20) NULL DEFAULT '#34d399' AFTER text_color").catch(() => {});
};
ensureSchema();

export const getCurrentAnnouncement = async (req, res) => {
    const lang = req.lang;
    try {
        const [announcements] = await db.query(
            `SELECT * FROM site_notifications 
             WHERE is_active = TRUE AND start_at <= NOW() AND expires_at >= NOW()
             ORDER BY created_at DESC LIMIT 1`
        );
        res.status(200).json(announcements.length > 0 ? announcements[0] : null);
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const publishAnnouncement = async (req, res) => {
    const lang = req.lang;
    const { title_ar, message_ar, title_en, message_en, start_at, expires_at, bg_color, text_color, title_color } = req.body;

    if (!message_ar || !start_at || !expires_at) {
        return res.status(400).json({
            message: lang === 'en' ? 'Message, start and expiration times are required.' : 'الرسالة ووقت البدء والانتهاء حقول مطلوبة.'
        });
    }

    const finalTitleAr = title_ar || 'تنويه هام';
    const finalTitleEn = title_en || 'Important Notice';

    try {
        await db.query(
            'UPDATE site_notifications SET is_active = FALSE WHERE is_active = TRUE'
        );

        await db.query(
            `INSERT INTO site_notifications (title_ar, message_ar, title_en, message_en, start_at, expires_at, is_active, bg_color, text_color, title_color)
             VALUES (?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?)`,
            [finalTitleAr, message_ar, finalTitleEn, message_en || null, toMySQLDatetime(start_at), toMySQLDatetime(expires_at), bg_color || '#064e3b', text_color || '#f0fdf4', title_color || '#34d399']
        );

        res.status(201).json({
            message: lang === 'en' ? 'Announcement published.' : 'تم نشر الإعلان.'
        });
    } catch (error) {
        console.error('publishAnnouncement error:', error.message);
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const clearAnnouncement = async (req, res) => {
    const lang = req.lang;
    try {
        await db.query('UPDATE site_notifications SET is_active = FALSE WHERE is_active = TRUE');
        res.status(200).json({
            message: lang === 'en' ? 'Announcement cleared.' : 'تم إلغاء الإعلان.'
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};
