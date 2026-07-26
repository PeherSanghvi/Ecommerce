const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod';
const JWT_EXPIRES_IN = '24h';

/**
 * Auth Routes - User & Admin
 * 
 * Provides authentication endpoints for both regular users and admins
 * Regular users and admins have separate login flows
 */

/**
 * POST /api/auth/login
 * 
 * Login regular user by email
 * Only allows USER role users
 */
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found. Try registering first.'
      });
    }

    // Check user is not admin (admin users should use admin login)
    if (user.role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin users must use admin login'
      });
    }

    // Return user with real JWT
    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role || 'USER', email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      user: {
        _id: user._id.toString(),
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'USER'
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/admin/login
 * 
 * Admin-only login
 * Only allows ADMIN role users
 */
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    // Find admin user by email
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role: 'ADMIN'
    }).lean();

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        error: 'Admin user not found or invalid credentials'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Admin user not found or invalid credentials'
      });
    }

    // Return admin user with real JWT
    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      user: {
        _id: user._id.toString(),
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/admin/create
 * 
 * Create an admin user
 */
router.post('/admin/create', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and phone are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create admin user
    const adminUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      role: 'ADMIN',
      address: {
        street: '123 Admin Street',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India'
      },
      created_at: new Date(),
      updated_at: new Date()
    });

    await adminUser.save();

    res.status(201).json({
      success: true,
      user: {
        _id: adminUser._id.toString(),
        name: adminUser.name,
        email: adminUser.email,
        phone: adminUser.phone,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('Admin user creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create admin user'
    });
  }
});

/**
 * POST /api/auth/register
 * 
 * Register new regular user (always USER role)
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and phone are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create default address if not provided
    const userAddress = address || {
      street: '123 Default Street',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India'
    };

    // Create new user (always USER role)
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: userAddress,
      role: 'USER',
      created_at: new Date(),
      updated_at: new Date()
    });

    await newUser.save();

    const token = jwt.sign(
      { _id: newUser._id.toString(), role: newUser.role, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      user: {
        _id: newUser._id.toString(),
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      },
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/auth/user/:id
 * 
 * Get user by MongoDB ObjectId
 */
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id.toString(),
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'USER'
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
