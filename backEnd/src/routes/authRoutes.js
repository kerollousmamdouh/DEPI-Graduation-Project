// src/routes/authRoutes.js
import express from 'express';
import { 
    register, 
    login, 
    verifyEmail, 
    resendOTP, 
    forgotPassword, 
    resetPassword, 
    getProfile, 
    updateProfile,
    changePassword
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

// مسارات التحقق والتسجيل الافتراضية
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/login', login);

// مسارات الحساب الشخصي المحمية
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;