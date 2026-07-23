import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorizeRoles('super_admin', 'store_manager'), getDashboardStats);

export default router;
