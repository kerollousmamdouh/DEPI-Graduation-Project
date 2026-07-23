import db from '../config/db.js';

// Map Dashboard camelCase keys to store_settings key_name format
const DASHBOARD_TO_DB = {
    logo2: 'footer_logo',
    aboutAr: 'footer_about_ar',
    aboutEn: 'footer_about_en',
    workingHoursAr: 'footer_working_hours_ar',
    workingHoursEn: 'footer_working_hours_en',
    phones: 'footer_phones',
    locations: 'footer_locations',
    socialLinks: 'footer_social_links',
};

export const getFooterSettings = async (req, res) => {
    const lang = req.lang;
    try {
        const [settings] = await db.query(
            `SELECT key_name, key_value_ar, key_value_en FROM store_settings 
             WHERE key_name IN (${Object.values(DASHBOARD_TO_DB).map(() => '?').join(',')})`,
            Object.values(DASHBOARD_TO_DB)
        );

        const dbMap = {};
        settings.forEach(item => {
            dbMap[item.key_name] = {
                ar: item.key_value_ar,
                en: item.key_value_en,
            };
        });

        // Build Dashboard format response
        const result = {
            logo2: dbMap.footer_logo?.ar || '',
            aboutAr: dbMap.footer_about_ar?.ar || '',
            aboutEn: dbMap.footer_about_en?.en || '',
            workingHoursAr: dbMap.footer_working_hours_ar?.ar || '',
            workingHoursEn: dbMap.footer_working_hours_en?.en || '',
            phones: [],
            locations: [],
            socialLinks: [],
        };

        // Parse phones (JSON array)
        try {
            const phonesRaw = dbMap.footer_phones?.ar;
            if (phonesRaw) result.phones = JSON.parse(phonesRaw);
        } catch {}

        // Parse locations (JSON array)
        try {
            const locationsRaw = dbMap.footer_locations?.ar;
            if (locationsRaw) result.locations = JSON.parse(locationsRaw);
        } catch {}

        // Parse socialLinks (JSON array)
        try {
            const socialRaw = dbMap.footer_social_links?.ar;
            if (socialRaw) result.socialLinks = JSON.parse(socialRaw);
        } catch {}

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

export const saveFooterSettings = async (req, res) => {
    const lang = req.lang;
    const data = req.body;

    try {
        const entries = [
            { key: 'footer_logo', ar: data.logo2 || null, en: null },
            { key: 'footer_about_ar', ar: data.aboutAr || null, en: null },
            { key: 'footer_about_en', ar: null, en: data.aboutEn || null },
            { key: 'footer_working_hours_ar', ar: data.workingHoursAr || null, en: null },
            { key: 'footer_working_hours_en', ar: null, en: data.workingHoursEn || null },
            { key: 'footer_phones', ar: JSON.stringify(data.phones || []), en: null },
            { key: 'footer_locations', ar: JSON.stringify(data.locations || []), en: null },
            { key: 'footer_social_links', ar: JSON.stringify(data.socialLinks || []), en: null },
        ];

        for (const entry of entries) {
            await db.query(
                `INSERT INTO store_settings (key_name, key_value_ar, key_value_en, display_name_ar) 
                 VALUES (?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                    key_value_ar = IFNULL(VALUES(key_value_ar), key_value_ar),
                    key_value_en = IFNULL(VALUES(key_value_en), key_value_en)`,
                [entry.key, entry.ar, entry.en, entry.key]
            );
        }

        res.status(200).json({
            message: lang === 'en' ? 'Footer settings saved.' : 'تم حفظ إعدادات الفوتر.'
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};
