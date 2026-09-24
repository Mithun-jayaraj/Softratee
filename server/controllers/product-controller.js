const Product = require('../models/product');
const Category = require('../models/category');
const getProducts = async (req, res) => {
  try {
    const { keyword, category, size, color, minPrice, maxPrice } = req.query;
    let query = {};
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }
    if (category) {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const categoryDoc = await Category.findOne({ name: { $regex: `^${category}$`, $options: 'i' } });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        } else {
          return res.json([]);
        }
      }
    }
    if (size) {
      query.sizes = { $in: [size] };
    }
    if (color) {
      query.$or = [
        { 'colors.name': color },
        { 'colors.hex': color }
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    const products = await Product.find(query).populate('category', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching products' });
  }
};
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching product' });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting product' });
  }
};
const createProduct = async (req, res) => {
  try {
    const { price = 0, countInStock = 0 } = req.body;
    if (price < 0 || countInStock < 0) {
      return res.status(400).json({ message: 'Price and stock cannot be negative' });
    }
    const product = new Product({
      name: req.body.name || 'Sample name',
      price,
      image: req.body.image || '/images/sample.jpg',
      category: req.body.category || '60d5ecb54d6f8f5548c26f75',
      countInStock,
      description: req.body.description || 'Sample description',
      sizes: req.body.sizes || ['S', 'M', 'L'],
      colors: req.body.colors || [
        { name: 'Black', hex: '#000000', image: req.body.image || '/images/sample.jpg' },
        { name: 'White', hex: '#ffffff', image: req.body.image || '/images/sample.jpg' }
      ],
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating product' });
  }
};
const updateProduct = async (req, res) => {
  const { name, price, description, image, category, countInStock, sizes, colors } = req.body;
  if (price !== undefined && price < 0) {
    return res.status(400).json({ message: 'Price cannot be negative' });
  }
  if (countInStock !== undefined && countInStock < 0) {
    return res.status(400).json({ message: 'Stock cannot be negative' });
  }
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.category = category || product.category;
      product.countInStock = countInStock || product.countInStock;
      product.sizes = sizes || product.sizes;
      product.colors = colors || product.colors;
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error updating product' });
  }
};
module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
};
