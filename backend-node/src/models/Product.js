const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    category: {
      type: String
    },
    primaryCategory: {
      type: String
    },
    subCategory: {
      type: String
    },
    department: {
      type: String
    },
    subcategory: {
      type: String
    },
    color: {
      type: String
    },
    price_minor: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true
    },
    stock: {
      type: Number,
      required: true
    },
    active: {
      type: Boolean,
      required: true
    },
    images: {
      type: [String],
      default: []
    },
    created_at: {
      type: String
    },
    updated_at: {
      type: String
    }
  },
  {
    timestamps: false // Disable automatic timestamps since we use created_at and updated_at
  }
);

// Create indexes
// Equivalent to: db.products.createIndex({ active: 1, title: 1 })
productSchema.index({ active: 1, title: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
