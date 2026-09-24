const mongoose = require('mongoose');
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    },
    type: {
      type: String,
      required: true,
      default: 'Classic',
    },
    isNewProduct: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    sizes: [
      {
        type: String,
      },
    ],
    colors: [
      {
        name: { type: String },
        hex: { type: String },
        image: { type: String }
      },
    ],
    isCustomizable: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);
const Product = mongoose.model('Product', productSchema);
module.exports = Product;
