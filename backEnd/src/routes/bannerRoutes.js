import express from 'express';
import { 
    getActiveBanners, 
    getAllBanners, 
    createBanner, 
    deleteBanner, 
    updateBanner, 
    toggleBannerStatus, 
    changeBannerPriority 
} from '../controllers/bannerController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/active', getActiveBanners);

// مسارات الأدمن المحمية 🔒
router.use(protect);
router.use(authorizeRoles('super_admin', 'store_manager'));

router.get('/', getAllBanners);
router.post('/', createBanner);
router.put('/:id', updateBanner);
router.delete('/:id', deleteBanner);
router.patch('/:id/status', toggleBannerStatus);
router.patch('/:id/priority', changeBannerPriority);

export default router;
