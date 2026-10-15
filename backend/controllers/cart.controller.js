import mongoose from 'mongoose';
import User from '../models/customer.model.js';
import Product from '../models/product.model.js';

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is currently out of stock'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.cart) {
      user.cart = [];
    }


    const itemIndex = user.cart.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (itemIndex > -1) {
      const newQuantity = user.cart[itemIndex].quantity + 1;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more units. Available stock is ${product.stock}`
        });
      }
      user.cart[itemIndex].quantity = newQuantity;
    } else {
      user.cart.push({
        product: productId,
        quantity: 1
      });
    }

    await user.save();

    const updatedUser = await User.findById(user._id).populate({
      path: 'cart.product',
      select: 'name price category image stock description'
    });

    const activeCart = (updatedUser.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      cart: activeCart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price category image stock description'
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const activeCart = (user.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      cart: activeCart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const parsedQty = Number(quantity);
    if (!Number.isInteger(parsedQty) || parsedQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be an integer of at least 1'
      });
    }


    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (parsedQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${product.stock})`
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.cart) {
      user.cart = [];
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart'
      });
    }

    user.cart[itemIndex].quantity = parsedQty;
    await user.save();

    const updatedUser = await User.findById(user._id).populate({
      path: 'cart.product',
      select: 'name price category image stock description'
    });

    const activeCart = (updatedUser.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated',
      cart: activeCart
    });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart'
      });
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart'
      });
    }


    user.cart.splice(itemIndex, 1);
    await user.save();

    const updatedUser = await User.findById(user._id).populate({
      path: 'cart.product',
      select: 'name price category image stock description'
    });

    const activeCart = (updatedUser.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: activeCart
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

