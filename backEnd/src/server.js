// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './config/db.js';

// استدعاء الروتس السابقة
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import logRoutes from './routes/logRoutes.js';

// استيراد الموديولات الإضافية النهائية
import seoRoutes from './routes/seoRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';

import rateLimit from 'express-rate-limit';
import paymentRoutes from './routes/paymentRoutes.js';

// استيراد مسارات الإدارة الجديدة
import dashboardRoutes from './routes/dashboardRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import usersManagementRoutes from './routes/usersManagementRoutes.js';
import adminOrderRoutes from './routes/adminOrderRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import footerRoutes from './routes/footerRoutes.js';
import bestSellersRoutes from './routes/bestSellersRoutes.js';
import dealsRoutes from './routes/dealsRoutes.js';
import complaintsRoutes from './routes/complaintsRoutes.js';
import paymentMethodRoutes from './routes/paymentMethodRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const app = express();

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🌐 1. الـ Middleware الخاص بتحديد اللغة (عربي / إنجليزي)
const langMiddleware = (req, res, next) => {
    // لقط اللغة من الـ Header أو من الـ Query string، الافتراضي هو 'ar'
    let lang = req.headers['accept-language'] || req.query.lang || 'ar';
    
    // تنظيف القيمة للتأكد من أنها إما 'en' أو 'ar' فقط
    lang = lang.toLowerCase().startsWith('en') ? 'en' : 'ar';
    
    req.lang = lang; // تثبيت اللغة في الـ request لتكون متاحة في الكنترولرات
    next();
};

// Rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // 2000 requests per 15 min (Dashboard polling + normal usage)
    handler: (req, res) => {
        res.status(429).json({
            message: req.lang === 'en' 
                ? 'Too many requests, please try again later.' 
                : 'لقد قمت بإرسال طلبات كثيرة جداً، يرجى المحاولة لاحقاً.'
        });
    }
});

// Auth-specific: more generous limit for login attempts
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, // 50 login attempts per 15 min
    handler: (req, res) => {
        res.status(429).json({
            message: req.lang === 'en'
                ? 'Too many login attempts, please try again later.'
                : 'محاولات تسجيل دخول كثيرة جداً، يرجى المحاولة لاحقاً.'
        });
    }
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(langMiddleware);
app.use('/api/', limiter);
app.use('/api/auth', authLimiter);

// ربط المسارات بالـ API الأساسي
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
// مسار الأكثر مبيعاً يجب أن يكون قبل /api/products عشان ما يتداخلش مع الـ wildcard
app.use('/api/products/best-sellers', bestSellersRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/logs', logRoutes);

// تفعيل مسارات الإدارة الجديدة
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/users-management', usersManagementRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/footer-settings', footerRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/upload', uploadRoutes);

// تفعيل روترات الـ SEO والمخزون والمدفوعات
app.use('/api/seo', seoRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payments', paymentRoutes);

// الروت الافتراضي للتأكد أن السيرفر شغال
app.get('/', (req, res) => {
    res.send('🚀 Delora Hypermarket API is Running Successfully (ES Modules)!');
});

// Global Error Handling Middleware (متوافق مع اللغتين)
app.use((err, req, res, next) => {
    console.error('❌ خطأ غير متوقع في السيرفر:', err.stack);
    
    const errorMessage = req.lang === 'en'
        ? 'An internal server error occurred, we are working on it.'
        : 'حدث خطأ داخلي في السيرفر، جاري العمل على حل المشكلة.';

    res.status(500).json({
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? err.message : {} // إظهار التفاصيل فقط في بيئة التطوير
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`📡 السيرفر شغال حالياً على بورت: http://localhost:${PORT}`);
});