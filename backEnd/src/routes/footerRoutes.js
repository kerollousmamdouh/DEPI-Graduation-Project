import express from 'express';
import { getFooterSettings, saveFooterSettings } from '../controllers/footerController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getFooterSettings);

router.use(protect);
router.use(authorizeRoles('super_admin', 'store_manager'));

router.put('/', saveFooterSettings);

export default router;
