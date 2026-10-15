import mongoose from 'mongoose'
import Product from '../models/product.model.js'

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body

    if (name === undefined || description === undefined || price === undefined || category === undefined || image === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, description, price, category, image, stock) are required'
      });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a number greater than 0'
      })
    }

    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a non-negative number'
      })
    }

    const newProduct = await Product.create({
      name: String(name).trim(),
      description: String(description).trim(),
      price: numPrice,
      category: String(category).trim(),
      image: String(image).trim(),
      stock: numStock
    })

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    })
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    })
  }
}

export const getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query
    const query = {}

    if (search && search.trim() !== '') {
      query.name = { $regex: search.trim(), $options: 'i' }
    }

    if (category && category.trim() !== '' && category.toLowerCase() !== 'all' && category.toLowerCase() !== 'all categories') {
      query.category = { $regex: `^${category.trim()}$`, $options: 'i' }
    }

    const products = await Product.find(query).sort({createdAt: -1})

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    })
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      })
    }

    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    return res.status(200).json({
      success: true,
      product
    })
  } catch (error) {
    console.error('Error fetching product by ID:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    })
  }
}