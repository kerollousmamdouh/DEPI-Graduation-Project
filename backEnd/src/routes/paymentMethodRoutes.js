import express from 'express';
import {
    getAllPaymentMethods,
    getActivePaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    togglePaymentMethodStatus,
    changePriority,
    setDefault
} from '../controllers/paymentMethodController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// مسار عام لجلب طرق الدفع النشطة (للـ Frontend)
router.get('/active', getActivePaymentMethods);

// مسارات محمية للأدمن 🔒
router.get('/', protect, authorizeRoles('super_admin', 'store_manager'), getAllPaymentMethods);
router.post('/', protect, authorizeRoles('super_admin', 'store_manager'), createPaymentMethod);
router.put('/:id', protect, authorizeRoles('super_admin', 'store_manager'), updatePaymentMethod);
router.delete('/:id', protect, authorizeRoles('super_admin', 'store_manager'), deletePaymentMethod);
router.patch('/:id/status', protect, authorizeRoles('super_admin', 'store_manager'), togglePaymentMethodStatus);
router.patch('/:id/priority', protect, authorizeRoles('super_admin', 'store_manager'), changePriority);
router.patch('/:id/default', protect, authorizeRoles('super_admin', 'store_manager'), setDefault);

export default router;
