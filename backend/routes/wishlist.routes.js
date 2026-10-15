import express from 'express';
import {addToWishlist, getWishlist, removeFromWishlist, toggleWishlist} from '../controllers/wishlist.controller.js';
import {isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.use(isAuthenticated);

router.post('/:productId', addToWishlist);
router.get('/', getWishlist);
router.delete('/:productId', removeFromWishlist);
router.patch('/:productId/toggle', toggleWishlist);

export default router;
