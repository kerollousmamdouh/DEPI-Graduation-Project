// src/controllers/categoryController.js
import db from '../config/db.js';

// Helper: generate slug from text (handles Arabic by keeping digits/letters and appending timestamp)
const generateSlug = (text) => {
    let slug = text
        .toLowerCase()
        .replace(/[^\w\s\u0600-\u06FF-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .trim();

    if (!slug) {
        slug = 'cat-' + Date.now();
    }
    return slug;
};

// 1. إضافة قسم جديد (خاص بالأدمن والـ Store Manager 🔒)
export const createCategory = async (req, res) => {
    const { name_ar, name_en, slug, parent_id, image_url, image, unit_type, unitType } = req.body;
    const lang = req.lang;
    const finalImage = image_url || image || null;
    const finalUnitType = unit_type || unitType || 'quantity';
    let finalSlug = slug || generateSlug(name_ar || '');

    if (!name_ar) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Arabic name is required to create a category.' : 'الاسم باللغة العربية مطلوب لإنشاء القسم.' 
        });
    }

    try {
        // Ensure slug is unique
        const [existingSlug] = await db.query('SELECT id FROM categories WHERE slug = ?', [finalSlug]);
        if (existingSlug.length > 0) {
            finalSlug = finalSlug + '-' + Date.now();
        }

        // Ensure unit_type column exists (ignore error if it already exists)
        await db.query("ALTER TABLE categories ADD COLUMN unit_type VARCHAR(20) DEFAULT 'quantity'").catch(() => {});

        const [result] = await db.query(
            'INSERT INTO categories (name_ar, name_en, slug, parent_id, image_url, unit_type) VALUES (?, ?, ?, ?, ?, ?)',
            [name_ar, name_en || null, finalSlug, parent_id || null, finalImage, finalUnitType]
        );
        res.status(201).json({ 
            message: lang === 'en' ? 'Category created successfully! 📂' : 'تم إنشاء القسم بنجاح! 📂', 
            categoryId: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 2. جلب كل الأقسام المتاحة (عام للجميع 🔓) مع حساب اللغات
export const getAllCategories = async (req, res) => {
    const lang = req.lang;
    try {
        // Ensure unit_type column exists
        await db.query("ALTER TABLE categories ADD COLUMN unit_type VARCHAR(20) DEFAULT 'quantity'").catch(() => {});

        const [categories] = await db.query(`
            SELECT 
                id,
                slug,
                parent_id,
                image_url,
                image_url AS image,
                is_active,
                CASE WHEN is_active = TRUE THEN 'Active' ELSE 'Hidden' END AS status,
                COALESCE(unit_type, 'quantity') AS unitType,
                IFNULL(name_${lang}, name_ar) AS name,
                name_ar,
                name_en
            FROM categories 
            WHERE is_active = TRUE
        `);
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 3. جلب جميع الأقسام (بما فيها غير النشطة) للأدمن 🔒
export const getAllCategoriesAdmin = async (req, res) => {
    const lang = req.lang;
    try {
        // Ensure unit_type column exists
        await db.query("ALTER TABLE categories ADD COLUMN unit_type VARCHAR(20) DEFAULT 'quantity'").catch(() => {});

        const [categories] = await db.query(`
            SELECT 
                id,
                slug,
                parent_id,
                image_url,
                image_url AS image,
                is_active,
                CASE WHEN is_active = TRUE THEN 'Active' ELSE 'Hidden' END AS status,
                COALESCE(unit_type, 'quantity') AS unitType,
                IFNULL(name_${lang}, name_ar) AS name,
                name_ar,
                name_en
            FROM categories 
            ORDER BY id ASC
        `);
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 4. تحديث قسم (PUT /:id) 🔒
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name_ar, name_en, slug, parent_id, image_url, image, unit_type, unitType } = req.body;
    const lang = req.lang;
    const finalImage = image_url || image || null;
    const finalUnitType = unit_type || unitType || null;
    let finalSlug = slug || (name_ar ? generateSlug(name_ar) : null);

    if (!name_ar) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Arabic name is required.' : 'الاسم بالعربي مطلوب.' 
        });
    }

    try {
        const [existing] = await db.query('SELECT id FROM categories WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Category not found.' : 'القسم غير موجود.' 
            });
        }

        // Ensure slug is unique (exclude current category)
        if (finalSlug) {
            const [slugConflict] = await db.query('SELECT id FROM categories WHERE slug = ? AND id != ?', [finalSlug, id]);
            if (slugConflict.length > 0) {
                finalSlug = finalSlug + '-' + Date.now();
            }
        }

        if (finalUnitType) {
            await db.query(
                'UPDATE categories SET name_ar = ?, name_en = ?, slug = ?, parent_id = ?, image_url = ?, unit_type = ? WHERE id = ?',
                [name_ar, name_en || null, finalSlug, parent_id || null, finalImage, finalUnitType, id]
            );
        } else {
            await db.query(
                'UPDATE categories SET name_ar = ?, name_en = ?, slug = ?, parent_id = ?, image_url = ? WHERE id = ?',
                [name_ar, name_en || null, finalSlug, parent_id || null, finalImage, id]
            );
        }

        res.status(200).json({ 
            message: lang === 'en' ? 'Category updated successfully.' : 'تم تحديث القسم بنجاح.' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 5. حذف قسم (DELETE /:id) 🔒
export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    const lang = req.lang;

    try {
        const [existing] = await db.query('SELECT id FROM categories WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Category not found.' : 'القسم غير موجود.' 
            });
        }

        await db.query('DELETE FROM categories WHERE id = ?', [id]);

        res.status(200).json({ 
            message: lang === 'en' ? 'Category deleted successfully.' : 'تم حذف القسم بنجاح.' 
        });
    } catch (error) {
        // Handle foreign key constraint errors
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1451) {
            return res.status(400).json({ 
                message: lang === 'en' 
                    ? 'Cannot delete category because it has products or subcategories.' 
                    : 'لا يمكن حذف القسم لأنه يحتوي على منتجات أو أقسام فرعية.' 
            });
        }
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 6. تغيير حالة التنشيط (PATCH /:id/status) 🔒
export const toggleCategoryStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    const lang = req.lang;

    try {
        const [existing] = await db.query('SELECT id FROM categories WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Category not found.' : 'القسم غير موجود.' 
            });
        }

        await db.query('UPDATE categories SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);

        res.status(200).json({ 
            message: lang === 'en' 
                ? `Category ${is_active ? 'activated' : 'deactivated'} successfully.` 
                : `تم ${is_active ? 'تفعيل' : 'إيقاف'} القسم بنجاح.` 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};
