// src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'delora_dash_token';

export const protect = async (req, res, next) => {
    let token;
    const lang = req.lang;

    // 1. Try httpOnly cookie first (dashboard)
    if (req.cookies && req.cookies[COOKIE_NAME]) {
        token = req.cookies[COOKIE_NAME];
    }

    // 2. Fall back to Authorization header (storefront)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            message: lang === 'en'
                ? 'Not authorized, token was not provided.'
                : 'غير مصرح بالدخول، لم يتم إرسال التوكن'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role, source? }
        return next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(401).json({
            message: lang === 'en'
                ? 'Not authorized, token is invalid or expired.'
                : 'غير مصرح بالدخول، التوكن غير صالح أو منتهي'
        });
    }
};

// Authorize specific roles. Works for both storefront roles
// (super_admin, store_manager, customer) and dashboard team_member.
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const lang = req.lang;

        if (req.user && allowedRoles.includes(req.user.role)) {
            return next();
        } else {
            return res.status(403).json({
                message: lang === 'en'
                    ? `Access denied, this path is restricted to: ${allowedRoles.join(', ')}`
                    : `غير مسموح بالدخول، هذا المسار مخصص للأدوار التالية: ${allowedRoles.join(', ')}`
            });
        }
    };
};
