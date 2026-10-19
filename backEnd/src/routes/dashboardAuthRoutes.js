// src/routes/dashboardAuthRoutes.js
// Dashboard-only auth routes — mounted WITHOUT the storefront rate limiter.
import express from 'express';
import {
    dashboardLogin,
    dashboardProfile,
    dashboardLogout
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', dashboardLogin);
router.get('/profile', protect, dashboardProfile);
router.post('/logout', dashboardLogout);

export default router;
