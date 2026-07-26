const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { indexOrder, deleteOrder } = require('./orderSyncService');

/**
 * OrderService
 * 
 * Handles business logic for order creation with MongoDB transactions.
 * 
 * DESIGN DECISIONS:
 * 
 * 1. MONGODB TRANSACTIONS:
 *    - All operations (inventory update + order creation) happen in one transaction
 *    - WHY: Ensures atomicity - either both succeed or both fail
 *    - Prevents inconsistent state where inventory is decremented but order not created
 *    - Critical for financial data integrity
 * 
 * 2. ATOMIC INVENTORY UPDATE:
 *    - Uses findOneAndUpdate() with condition: stock >= requested quantity
 *    - WHY: Prevents race conditions where multiple orders could oversell stock
 *    - If condition fails, update returns null and transaction is aborted
 *    - No read-then-write pattern that could allow overselling
 * 
 * 3. PRICE RECALCULATION:
 *    - Prices are reloaded from MongoDB, never trusted from frontend
 *    - WHY: Prevents price manipulation attacks
 *    - Ensures customers pay current prices, not old prices from cart
 *    - Financial accuracy - always use source of truth
 * 
 * 4. EMBEDDED SNAPSHOTS:
 *    - Customer and product data embedded in order
 *    - WHY: Historical orders must never change when source data changes
 *    - Audit trails, legal compliance, customer service
 *    - Orders reflect state at time of purchase
 * 
 * 5. IDEMPOTENCY:
 *    - Checks for existing order with same idempotency key before processing
 *    - WHY: Prevents duplicate orders from network retries or double-submits
 *    - Critical for payment processing to avoid double-charging
 *    - Returns existing order if key already used
 */

/**
 * Calculate shipping cost (simplified logic)
 */
function calculateShipping(subtotal) {
  // Free shipping for orders over 5000 minor units ($50)
  if (subtotal >= 5000) {
    return 0;
  }
  // Flat rate shipping
  return 499; // $4.99
}

/**
 * Validate if a string is a valid MongoDB ObjectId (24-character hex string)
 */
function isValidMongoDBObjectId(id) {
  if (!id || typeof id !== 'string') return false;
  // MongoDB ObjectId is 24 hexadecimal characters
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Create order with MongoDB transaction
 * 
 * Supports both authenticated orders (with customerId) and guest orders (without).
 * Customer reference is optional for maximum flexibility.
 */
async function createOrder(orderData) {
  // Validate customerId: if provided, must be valid MongoDB ObjectId
  // Empty string is OK (for guest orders), but fake IDs are rejected
  if (orderData.customerId && orderData.customerId.trim() !== '') {
    if (!isValidMongoDBObjectId(orderData.customerId)) {
      throw new Error(`Invalid customer ID format. Expected MongoDB ObjectId (24 hex characters), got: "${orderData.customerId}"`);
    }
  }

  const session = await mongoose.startSession();
  
  try {
    // Start transaction
    session.startTransaction();

    // Check for existing order with same idempotency key
    const existingOrder = await Order.findOne({ idempotency_key: orderData.idempotencyKey })
      .session(session)
      .lean();

    if (existingOrder) {
      await session.commitTransaction();
      return {
        success: true,
        order: existingOrder,
        message: 'Order already exists (idempotent request)'
      };
    }

    // Load customer if customerId provided (optional for guest checkout)
    let customer = null;
    if (orderData.customerId && orderData.customerId.trim() !== '') {
      customer = await User.findById(orderData.customerId).session(session).lean();
      // If customer not found but ID provided, treat as guest (don't fail)
      if (!customer) {
        console.warn(`Customer ${orderData.customerId} not found, creating guest order`);
      }
    }

    // Load all products and validate
    const productIds = orderData.items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds }, active: true })
      .session(session)
      .lean();

    if (products.length !== productIds.length) {
      throw new Error('One or more products not found or inactive');
    }

    // Create product map for easy lookup
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    // Validate stock and build order items with snapshots
    const orderItems = [];
    let subtotal = 0;

    for (const item of orderData.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      // Validate stock
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.title}`);
      }

      // Calculate line total
      const lineTotal = item.quantity * product.price_minor;
      subtotal += lineTotal;

      // Create order item with embedded product snapshot
      orderItems.push({
        product_id: product._id,
        sku: product.sku,
        title: product.title,
        quantity: item.quantity,
        unit_price_minor: product.price_minor,
        line_total_minor: lineTotal
      });
    }

    // Calculate shipping and total
    const shipping = calculateShipping(subtotal);
    const total = subtotal + shipping;

    // Atomically decrement inventory for each product
    for (const item of orderData.items) {
      const product = productMap.get(item.productId);

      const updateResult = await Product.findOneAndUpdate(
        { 
          _id: product._id, 
          stock: { $gte: item.quantity } 
        },
        { 
          $inc: { stock: -item.quantity } 
        },
        { 
          session,
          new: false 
        }
      );

      if (!updateResult) {
        throw new Error(`Failed to update stock for product: ${product.title}`);
      }
    }

    // Create order with embedded customer snapshot (only if customer exists)
    const order = new Order({
      order_date: new Date(),
      updated_at: new Date(),
      version: 1,
      status: 'PENDING',
      currency: 'USD',
      total_minor: total,
      idempotency_key: orderData.idempotencyKey,
      customer: customer ? {
        id: customer._id,
        name: customer.name,
        email: customer.email
      } : null,
      items: orderItems,
      subtotal_minor: subtotal,
      shipping_minor: shipping,
      created_at: new Date()
    });

    await order.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Sync order to OpenSearch (fire and forget, don't block)
    setImmediate(() => {
      indexOrder(order).catch(err => 
        console.error(`Failed to sync order ${order._id} to OpenSearch:`, err.message)
      );
    });

    return {
      success: true,
      order: order.toObject(),
      totals: {
        subtotal_minor: subtotal,
        shipping_minor: shipping,
        total_minor: total
      },
      message: 'Order created successfully'
    };

  } catch (error) {
    // Abort transaction on any error
    await session.abortTransaction();
    throw error;
  } finally {
    // End session
    await session.endSession();
  }
}

/**
 * Get order by ID from MongoDB
 */
async function getOrderById(orderId) {
  const order = await Order.findById(orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  const orderObj = order.toObject();
  
  // Attach OpenSearch sync state for Admin UI
  try {
    const { getOpenSearchClient } = require('../config/opensearch');
    const { INDEX_NAME } = require('../config/opensearchIndex');
    const client = getOpenSearchClient();
    const response = await client.get({ index: INDEX_NAME, id: orderId.toString() });
    
    if (response.statusCode === 200 && response.body && response.body._source) {
      orderObj.syncedToSearch = true;
      orderObj.sourceVersion = response.body._source.source_version;
    } else {
      orderObj.syncedToSearch = false;
    }
  } catch (err) {
    // If not found in OpenSearch or error occurs, default to not synced
    orderObj.syncedToSearch = false;
  }
  
  return orderObj;
}

/**
 * Get all orders for a customer (paginated)
 * Returns orders sorted by date (newest first)
 */
async function getOrdersByCustomerId(customerId, page = 1, limit = 20) {
  if (!customerId || typeof customerId !== 'string') {
    throw new Error('Invalid customer ID');
  }

  // Validate MongoDB ObjectId format
  if (!isValidMongoDBObjectId(customerId)) {
    throw new Error(`Invalid customer ID format. Expected MongoDB ObjectId (24 hex characters)`);
  }

  // Calculate skip for pagination
  const skip = (page - 1) * limit;

  // Query orders where customer.id matches customerId
  const orders = await Order.find({ 'customer.id': customerId })
    .sort({ order_date: -1 }) // Sort by date, newest first
    .skip(skip)
    .limit(limit)
    .lean();

  // Get total count for pagination
  const total = await Order.countDocuments({ 'customer.id': customerId });

  return {
    orders: orders.map(o => o),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Update order status with optimistic concurrency
 * 
 * DESIGN DECISIONS:
 * 
 * 1. OPTIMISTIC CONCURRENCY:
 *    - Uses version field to detect concurrent modifications
 *    - Only updates if version matches expected value
 *    - Returns HTTP 409 on stale updates
 * 
 * 2. ATOMIC UPDATE:
 *    - Uses findOneAndUpdate with version condition
 *    - Prevents race conditions
 *    - Increments version automatically
 */
async function updateOrderStatus(orderId, newStatus, expectedVersion) {
  const allowedStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  
  if (!allowedStatuses.includes(newStatus)) {
    throw new Error(`Invalid status. Allowed values: ${allowedStatuses.join(', ')}`);
  }
  
  const updatedOrder = await Order.findOneAndUpdate(
    {
      _id: orderId,
      version: expectedVersion
    },
    {
      $set: {
        status: newStatus,
        updated_at: new Date()
      },
      $inc: {
        version: 1
      }
    },
    {
      new: true
    }
  );
  
  if (!updatedOrder) {
    throw new Error('Stale update: version mismatch. Order may have been modified by another process. Please refresh and retry.');
  }
  
  // Sync updated order to OpenSearch (fire and forget, don't block)
  setImmediate(() => {
    indexOrder(updatedOrder).catch(err => 
      console.error(`Failed to sync updated order ${orderId} to OpenSearch:`, err.message)
    );
  });
  
  return {
    order: updatedOrder.toObject(),
    message: 'Order status updated successfully'
  };
}

module.exports = {
  createOrder,
  getOrderById,
  getOrdersByCustomerId,
  updateOrderStatus
};
