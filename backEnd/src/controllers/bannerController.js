// src/controllers/bannerController.js
import db from '../config/db.js';

// Auto-create banners table if missing
const ensureSchema = async () => {
    await db.query(`CREATE TABLE IF NOT EXISTS banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title_ar VARCHAR(255) NOT NULL,
        title_en VARCHAR(255) NULL,
        subtitle_ar VARCHAR(500) NULL,
        subtitle_en VARCHAR(500) NULL,
        image_url TEXT NOT NULL,
        button_text_ar VARCHAR(100) NULL DEFAULT 'اكتشفي عروضنا',
        button_text_en VARCHAR(100) NULL DEFAULT 'Discover Offers',
        product_id INT NULL,
        category_id INT NULL,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_active (is_active),
        INDEX idx_sort (sort_order)
    )`).catch(() => {});
};
ensureSchema();

// 1. جلب البانرات النشطة لتعرض في السلايدر الرئيسي بالـ Frontend حسب اللغة الحالية 🖼️
export const getActiveBanners = async (req, res) => {
    const lang = req.lang;
    try {
        const [banners] = await db.query(
            `SELECT 
                id, image_url, product_id, category_id,
                title_ar, title_en,
                IFNULL(title_${lang}, title_ar) AS title,
                subtitle_ar, subtitle_en,
                IFNULL(subtitle_${lang}, subtitle_ar) AS subtitle,
                button_text_ar, button_text_en,
                IFNULL(button_text_${lang}, button_text_ar) AS button_text
             FROM banners 
             WHERE is_active = TRUE 
             ORDER BY sort_order ASC, created_at DESC`
        );
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error while fetching banners.' : 'حدث خطأ في السيرفر أثناء جلب البانرات', 
            error: error.message 
        });
    }
};

// 2. جلب جميع البانرات بكافة حقولها (لوحة التحكم للأدمن)
export const getAllBanners = async (req, res) => {
    const lang = req.lang;
    try {
        const [banners] = await db.query(`
            SELECT *,
                CASE WHEN is_active = TRUE THEN 'Active' ELSE 'Hidden' END AS status,
                sort_order AS priority,
                image_url AS image,
                title_ar AS titleAr, title_en AS titleEn,
                subtitle_ar AS subtitleAr, subtitle_en AS subtitleEn,
                button_text_ar AS buttonTextAr, button_text_en AS buttonTextEn,
                category_id AS categoryId
            FROM banners ORDER BY sort_order ASC
        `);
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 3. إضافة بانر جديد ودعم توثيق النصوص باللغتين (خاص بالأدمن 🔒)
export const createBanner = async (req, res) => {
    const lang = req.lang;
    const body = req.body;

    // Accept both camelCase (Dashboard) and snake_case formats
    const title_ar = body.title_ar || body.titleAr;
    const title_en = body.title_en || body.titleEn;
    const subtitle_ar = body.subtitle_ar || body.subtitleAr;
    const subtitle_en = body.subtitle_en || body.subtitleEn;
    const image_url = body.image_url || body.image;
    const button_text_ar = body.button_text_ar || body.buttonTextAr;
    const button_text_en = body.button_text_en || body.buttonTextEn;
    const product_id = body.product_id || null;
    const category_id = body.category_id || body.categoryId || null;
    const sort_order = body.sort_order || body.priority || 0;

    if (!title_ar || !image_url) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Arabic title and image URL are required.' : 'العنوان بالعربي ورابط الصورة حقول إجبارية' 
        });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO banners 
            (title_ar, title_en, subtitle_ar, subtitle_en, image_url, button_text_ar, button_text_en, product_id, category_id, sort_order) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title_ar, title_en || null, 
                subtitle_ar || null, subtitle_en || null, 
                image_url, 
                button_text_ar || 'اكتشفي عروضنا', button_text_en || 'Discover Offers',
                product_id, category_id, sort_order
            ]
        );

        res.status(201).json({ 
            message: lang === 'en' ? 'Banner added successfully! 🖼️' : 'تم إضافة البانر بنجاح! 🖼️', 
            bannerId: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while creating the banner.' : 'حدث خطأ أثناء إضافة البانر', 
            error: error.message 
        });
    }
};

// 4. حذف بانر نهائياً (خاص بالأدمن 🔒)
export const deleteBanner = async (req, res) => {
    const { id } = req.params;
    const lang = req.lang;
    try {
        const [result] = await db.query('DELETE FROM banners WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Banner not found.' : 'البانر غير موجود' 
            });
        }
        res.status(200).json({ 
            message: lang === 'en' ? 'Banner deleted successfully 🗑️' : 'تم حذف البانر بنجاح 🗑️' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while deleting the banner.' : 'حدث خطأ أثناء حذف البانر', 
            error: error.message 
        });
    }
};

// 5. تحديث بانر (PUT /:id) 🔒
export const updateBanner = async (req, res) => {
    const { id } = req.params;
    const lang = req.lang;
    const body = req.body;

    // Accept both camelCase (Dashboard) and snake_case formats
    const title_ar = body.title_ar || body.titleAr;
    const title_en = body.title_en || body.titleEn;
    const subtitle_ar = body.subtitle_ar || body.subtitleAr;
    const subtitle_en = body.subtitle_en || body.subtitleEn;
    const image_url = body.image_url || body.image;
    const button_text_ar = body.button_text_ar || body.buttonTextAr;
    const button_text_en = body.button_text_en || body.buttonTextEn;
    const category_id = body.category_id || body.categoryId || null;
    const sort_order = body.sort_order || body.priority || 0;

    if (!title_ar || !image_url) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Arabic title and image URL are required.' : 'العنوان بالعربي ورابط الصورة حقول إجبارية' 
        });
    }

    try {
        const [existing] = await db.query('SELECT id FROM banners WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Banner not found.' : 'البانر غير موجود' 
            });
        }

        await db.query(
            `UPDATE banners SET 
                title_ar = ?, title_en = ?, 
                subtitle_ar = ?, subtitle_en = ?, 
                image_url = ?, 
                button_text_ar = ?, button_text_en = ?, 
                product_id = ?, category_id = ?, sort_order = ? 
             WHERE id = ?`,
            [
                title_ar, title_en || null, 
                subtitle_ar || null, subtitle_en || null, 
                image_url, 
                button_text_ar || 'اكتشفي عروضنا', button_text_en || 'Discover Offers',
                body.product_id || null, category_id, sort_order, 
                id
            ]
        );

        res.status(200).json({ 
            message: lang === 'en' ? 'Banner updated successfully!' : 'تم تحديث البانر بنجاح!' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while updating the banner.' : 'حدث خطأ أثناء تحديث البانر', 
            error: error.message 
        });
    }
};

// 6. تغيير حالة التنشيط (PATCH /:id/status) 🔒
export const toggleBannerStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    const lang = req.lang;

    try {
        const [existing] = await db.query('SELECT id FROM banners WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Banner not found.' : 'البانر غير موجود' 
            });
        }

        await db.query('UPDATE banners SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);

        res.status(200).json({ 
            message: lang === 'en' 
                ? `Banner ${is_active ? 'activated' : 'deactivated'} successfully.` 
                : `تم ${is_active ? 'تفعيل' : 'إيقاف'} البانر بنجاح.` 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 7. تغيير ترتيب البانر (PATCH /:id/priority) 🔒
export const changeBannerPriority = async (req, res) => {
    const { id } = req.params;
    const { priority } = req.body;
    const lang = req.lang;

    try {
        const [existing] = await db.query('SELECT id FROM banners WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Banner not found.' : 'البانر غير موجود' 
            });
        }

        await db.query('UPDATE banners SET sort_order = ? WHERE id = ?', [priority, id]);

        res.status(200).json({ 
            message: lang === 'en' ? 'Banner priority updated.' : 'تم تحديث ترتيب البانر.' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};