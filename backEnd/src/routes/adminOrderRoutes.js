import express from 'express';
import { getAllOrders, getOrderById, updateOrderStatus } from '../controllers/adminOrderController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('super_admin', 'store_manager'));

router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);

export default router;
