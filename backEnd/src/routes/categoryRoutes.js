// src/routes/categoryRoutes.js
import express from 'express';
import { 
    createCategory, 
    getAllCategories, 
    getAllCategoriesAdmin, 
    updateCategory, 
    deleteCategory, 
    toggleCategoryStatus 
} from '../controllers/categoryController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// مسار عام لجلب الأقسام (للـ Frontend)
router.get('/', getAllCategories);

// مسار محمي للأدمن لجلب جميع الأقسام (بما فيها غير النشطة)
router.get('/admin', protect, authorizeRoles('super_admin', 'store_manager'), getAllCategoriesAdmin);

// 🔒 مسار محمي للأدمن والمديرين لإنشاء قسم جديد
router.post('/', protect, authorizeRoles('super_admin', 'store_manager'), createCategory);

// 🔒 تحديث قسم
router.put('/:id', protect, authorizeRoles('super_admin', 'store_manager'), updateCategory);

// 🔒 حذف قسم
router.delete('/:id', protect, authorizeRoles('super_admin', 'store_manager'), deleteCategory);

// 🔒 تغيير حالة التنشيط
router.patch('/:id/status', protect, authorizeRoles('super_admin', 'store_manager'), toggleCategoryStatus);

export default router;
