import express from 'express';
import { uploadImage, uploadMultipleImages } from '../controllers/uploadController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Single image upload (admin only)
router.post('/', protect, authorizeRoles('super_admin', 'store_manager'), uploadImage);

// Multiple images upload (admin only)
router.post('/multiple', protect, authorizeRoles('super_admin', 'store_manager'), uploadMultipleImages);

export default router;
