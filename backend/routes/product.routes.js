import express from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {createProduct, getAllProducts, getSingleProduct} from '../controllers/product.controller.js';

const router = express.Router();
router.use(isAuthenticated);

router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:id', getSingleProduct);

export default router;

