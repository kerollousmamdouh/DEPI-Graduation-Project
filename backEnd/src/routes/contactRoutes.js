import express from 'express';
import { submitContactMessage, getAllMessages, markAsRead } from '../controllers/contactController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', submitContactMessage); // مسار عام لإرسال الشكاوى والاستفسارات

// مسارات إدارة الرسائل للأدمن 🔒
router.get('/', protect, authorizeRoles('super_admin', 'store_manager', 'team_member'), getAllMessages);
router.patch('/:id/read', protect, authorizeRoles('super_admin', 'store_manager', 'team_member'), markAsRead);

export default router;