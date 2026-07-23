import express from 'express';
import { getAllDeals, createDeal, updateDeal, deleteDeal } from '../controllers/dealsController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('super_admin', 'store_manager'));

router.get('/', getAllDeals);
router.post('/', createDeal);
router.put('/:id', updateDeal);
router.delete('/:id', deleteDeal);

export default router;
