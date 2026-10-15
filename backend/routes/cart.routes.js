import express from 'express';
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
} from '../controllers/cart.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(isAuthenticated);

router.post('/:productId', addToCart);
router.get('/', getCart);
router.patch('/:productId', updateCartQuantity);
router.delete('/:productId', removeFromCart);

export default router;