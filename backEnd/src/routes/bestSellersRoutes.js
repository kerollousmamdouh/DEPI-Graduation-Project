import express from 'express';
import { getBestSellingProducts } from '../controllers/bestSellersController.js';

const router = express.Router();

router.get('/', getBestSellingProducts);

export default router;
