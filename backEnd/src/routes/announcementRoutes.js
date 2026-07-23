import express from 'express';
import { getCurrentAnnouncement, publishAnnouncement, clearAnnouncement } from '../controllers/announcementController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/current', getCurrentAnnouncement);

router.use(protect);
router.use(authorizeRoles('super_admin', 'store_manager'));

router.post('/', publishAnnouncement);
router.delete('/current', clearAnnouncement);

export default router;
