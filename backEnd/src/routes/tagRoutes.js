import express from 'express';
import { getAllTags, getProductsByTag, assignTag } from '../controllers/tagController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('super_admin', 'store_manager', 'team_member'), getAllTags);
router.get('/:tagName', getProductsByTag); 
router.post('/assign', protect, authorizeRoles('super_admin', 'store_manager', 'team_member'), assignTag);

export default router;