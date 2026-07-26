require('dotenv').config();

const { connectToDatabase, closeDatabaseConnection } = require('../config/database');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

/**
 * Seed Orders Script
 * 
 * This script generates realistic historical order data for testing and development.
 * 
 * DESIGN DECISIONS:
 * 
 * 1. PRODUCT SNAPSHOTS EMBEDDED:
 *    - Product data (sku, title, price) is embedded in each order item
 *    - WHY: Historical orders must never change when products are renamed, price-changed, or discontinued
 *    - This ensures accurate historical pricing and product identification for audit trails and customer disputes
 * 
 * 2. CUSTOMER SNAPSHOTS EMBEDDED:
 *    - Customer data (name, email) is embedded in each order
 *    - WHY: Historical orders must reflect customer info at the time of purchase
 *    - If a customer changes their name/email, historical orders should show the original data
 *    - Critical for legal compliance and customer service
 * 
 * 3. TOTALS CALCULATED DURING SEEDING:
 *    - Subtotal, shipping, and total are calculated from actual product prices
 *    - WHY: Ensures mathematical accuracy and consistency
 *    - Validates that the order structure correctly handles financial calculations
 *    - Prevents data inconsistencies that could cause issues in production
 * 
 * 4. HISTORICAL DATES:
 *    - Orders are spread across the last 6 months with realistic distribution
 *    - WHY: Enables testing of time-based queries, reporting, and analytics
 *    - Simulates real-world order patterns for dashboard and search functionality
 *    - Allows testing of date-range filters and time-based aggregations
 */

// Configuration
const ORDER_COUNT_MIN = 100;
const ORDER_COUNT_MAX = 200;
const SHIPPING_OPTIONS = [0, 299, 499, 699]; // Shipping costs in minor units
const STATUS_DISTRIBUTION = {
  PENDING: 0.15,
  PROCESSING: 0.20,
  SHIPPED: 0.55,
  CANCELLED: 0.10
};

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random date within the last 6 months
 */
function randomDate() {
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime);
}

/**
 * Select a random status based on distribution
 */
function randomStatus() {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const [status, probability] of Object.entries(STATUS_DISTRIBUTION)) {
    cumulative += probability;
    if (rand < cumulative) {
      return status;
    }
  }
  
  return 'SHIPPED'; // Default fallback
}

/**
 * Select n unique random items from an array
 */
function selectRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Generate a unique idempotency key
 */
function generateIdempotencyKey(index) {
  return `seed-order-${String(index).padStart(6, '0')}`;
}

/**
 * Calculate line total
 */
function calculateLineTotal(quantity, unitPrice) {
  return quantity * unitPrice;
}

/**
 * Seed orders into MongoDB
 */
async function seedOrders() {
  const startTime = Date.now();
  
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Check if orders already exist
    const existingOrderCount = await Order.countDocuments();
    if (existingOrderCount > 0) {
      console.log(`✓ ${existingOrderCount} orders already exist. Skipping seed.`);
      return;
    }

    // Load users from MongoDB
    console.log('Loading Users...');
    const users = await User.find({}).lean();
    console.log(`✓ Users Loaded: ${users.length}`);

    if (users.length === 0) {
      throw new Error('No users found in database. Please run seed:users first.');
    }

    // Load products from MongoDB
    console.log('Loading Products...');
    const products = await Product.find({ active: true }).lean();
    console.log(`✓ Products Loaded: ${products.length}`);

    if (products.length === 0) {
      throw new Error('No active products found in database. Please run seed:products first.');
    }

    // Determine number of orders to generate
    const orderCount = randomInt(ORDER_COUNT_MIN, ORDER_COUNT_MAX);
    console.log(`Generating ${orderCount} orders...`);

    const orders = [];
    const usedIdempotencyKeys = new Set();

    // Generate orders
    for (let i = 0; i < orderCount; i++) {
      // Select random customer
      const customer = users[randomInt(0, users.length - 1)];

      // Select 1-5 unique random products
      const itemCount = randomInt(1, 5);
      const selectedProducts = selectRandomItems(products, itemCount);

      // Build order items with embedded product snapshots
      const items = selectedProducts.map(product => {
        const quantity = randomInt(1, 4);
        const unitPrice = product.price_minor;
        const lineTotal = calculateLineTotal(quantity, unitPrice);

        return {
          product_id: product._id,
          sku: product.sku,
          title: product.title,
          quantity: quantity,
          unit_price_minor: unitPrice,
          line_total_minor: lineTotal
        };
      });

      // Calculate subtotal (sum of all line totals)
      const subtotal_minor = items.reduce((sum, item) => sum + item.line_total_minor, 0);

      // Select random shipping cost
      const shipping_minor = SHIPPING_OPTIONS[randomInt(0, SHIPPING_OPTIONS.length - 1)];

      // Calculate total
      const total_minor = subtotal_minor + shipping_minor;

      // Generate unique idempotency key
      let idempotencyKey;
      do {
        idempotencyKey = generateIdempotencyKey(i + 1);
      } while (usedIdempotencyKeys.has(idempotencyKey));
      usedIdempotencyKeys.add(idempotencyKey);

      // Generate order date within last 6 months
      const orderDate = randomDate();

      // Create order with embedded customer snapshot
      const order = {
        order_date: orderDate,
        updated_at: orderDate,
        version: 1,
        status: randomStatus(),
        currency: 'USD',
        total_minor: total_minor,
        idempotency_key: idempotencyKey,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email
        },
        items: items,
        subtotal_minor: subtotal_minor,
        shipping_minor: shipping_minor,
        created_at: orderDate
      };

      orders.push(order);

      // Progress indicator
      if ((i + 1) % 20 === 0) {
        console.log(`  Generated ${i + 1}/${orderCount} orders...`);
      }
    }

    // Insert orders using insertMany for performance
    console.log('Inserting Orders...');
    const insertedOrders = await Order.insertMany(orders);
    console.log(`✓ Orders Created: ${insertedOrders.length}`);

    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✓ Execution Time: ${executionTime}s`);
    console.log('✓ Database Seed Complete');

  } catch (error) {
    console.error('✗ Error during seed:', error.message);
    
    // Handle specific error types
    if (error.code === 11000) {
      console.error('✗ Duplicate key error - Idempotency key must be unique');
    }
    
    process.exit(1);
  } finally {
    // Close database connection
    await closeDatabaseConnection();
  }
}

// Run the seed script
seedOrders();
