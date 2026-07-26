const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'India'
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      // Optional because regular users might not have passwords in the current flow
      required: false
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: addressSchema,
      required: true
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
      required: true
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false // Disable automatic timestamps since we use created_at and updated_at
  }
);

// Create indexes for common queries
userSchema.index({ name: 1 });
userSchema.index({ 'address.city': 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
