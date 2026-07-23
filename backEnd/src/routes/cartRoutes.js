import express from 'express';
import { addToCart, getCart, removeFromCart, clearCart } from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); 

router.post('/', addToCart);          // Add or update quantity
router.post('/add', addToCart);       // Alias for add (frontend compatibility)
router.get('/', getCart);             // View cart
router.delete('/clear', clearCart);   // Clear entire cart — MUST be before /:productId
router.delete('/:productId', removeFromCart); // Remove specific product

export default router;