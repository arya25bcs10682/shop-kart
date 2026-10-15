import mongoose from "mongoose"
import User from "../models/customer.model.js"
import Product from "../models/product.model.js"

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      })
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      })
    }

    if (!user.wishlist) {
      user.wishlist = []
    }

    const isAlreadyWishlisted = user.wishlist.some(
      (id) => id.toString() === productId,
    )

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
      })
    }

    user.wishlist.push(productId);
    await user.save()

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist",
    })
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    })
  }
}

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock description",
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      })
    }

    const activeWishlist = (user.wishlist || []).filter(
      (item) => item !== null,
    )

    return res.status(200).json({
      success: true,
      count: activeWishlist.length,
      wishlist: activeWishlist,
    })
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    })
  }
}

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      })
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      })
    }

    if (!user.wishlist || user.wishlist.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      })
    }

    const itemIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId,
    )

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      })
    }

    user.wishlist.splice(itemIndex, 1)
    await user.save()

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    })
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    })
  }
}

export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      })
    }

    if (!user.wishlist) {
      user.wishlist = []
    }

    const itemIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId,
    )

    let saved = false
    let message = ""

    if (itemIndex !== -1) {
      user.wishlist.splice(itemIndex, 1)
      saved = false
      message = "Product removed from wishlist"
    } else {
      user.wishlist.push(productId)
      saved = true
      message = "Product added to wishlist"
    }

    await user.save()

    return res.status(200).json({
      success: true,
      saved,
      message,
    })
  } catch (error) {
    console.error("Error toggling wishlist:", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    })
  }
}
