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
    changePassword,
    dashboardLogin,
    dashboardProfile,
    dashboardLogout
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

// Storefront auth
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/login', login);

// Storefront profile (customers)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Dashboard auth (team_members table — separate from storefront users)
// These controller functions already existed in authController.js but were
// never wired to a route, which is why POST /auth/dashboard/login was 401ing
// (or would 404, depending on how your app.js catches unmatched routes).
router.post('/dashboard/login', dashboardLogin);
router.get('/dashboard/profile', protect, dashboardProfile);
router.post('/dashboard/logout', dashboardLogout);

export default router;