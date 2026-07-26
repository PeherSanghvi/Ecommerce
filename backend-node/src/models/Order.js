const mongoose = require('mongoose');

/**
 * CustomerSnapshotSchema
 * 
 * DESIGN DECISION: Embedded customer snapshot
 * 
 * WHY: Historical orders must never change when customer information is updated.
 * If a customer changes their name or email, historical orders should reflect
 * the data at the time of purchase, not the current customer data.
 * 
 * This ensures data integrity for:
 * - Audit trails
 * - Historical reporting
 * - Customer service (seeing what the customer's info was at order time)
 * - Legal compliance (records must reflect state at transaction time)
 */
const customerSnapshotSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      comment: 'Reference to the user who placed this order'
    },
    name: {
      type: String,
      required: true,
      trim: true,
      comment: 'Customer name at the time of order (snapshot)'
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      comment: 'Customer email at the time of order (snapshot)'
    }
  },
  { _id: false }
);

/**
 * OrderItemSchema
 * 
 * DESIGN DECISION: Embedded product snapshot
 * 
 * WHY: Historical orders must never change when product information is updated.
 * If a product is renamed, price-changed, or discontinued, the order should
 * reflect the product data at the time of purchase.
 * 
 * This ensures:
 * - Accurate historical pricing
 * - Correct product identification even if SKU changes
 * - Proper inventory accounting
 * - Customer disputes can be resolved with historical data
 * 
 * MONEY STORAGE: All monetary values stored as integer minor units (cents/paise)
 * Example: $19.99 stored as 1999, ₹499.00 stored as 49900
 * This avoids floating-point precision issues in financial calculations.
 */
const orderItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      comment: 'Reference to the product at time of order'
    },
    sku: {
      type: String,
      required: true,
      comment: 'Product SKU at time of order (snapshot)'
    },
    title: {
      type: String,
      required: true,
      comment: 'Product title at time of order (snapshot)'
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer greater than 0'
      },
      comment: 'Quantity of this product ordered'
    },
    unit_price_minor: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Unit price must be an integer in minor units'
      },
      comment: 'Price per unit in minor units (e.g., 1999 for $19.99)'
    },
    line_total_minor: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Line total must be an integer in minor units'
      },
      comment: 'Total for this line item (quantity × unit_price_minor)'
    }
  },
  { _id: false }
);

/**
 * Order Schema
 * 
 * DESIGN DECISIONS:
 * 
 * 1. EMBEDDED SNAPSHOTS: Customer and product data are embedded, not referenced.
 *    This ensures historical accuracy even if source data changes.
 * 
 * 2. IDEMPOTENCY KEY: Prevents duplicate order creation from the same request.
 *    Critical for payment processing to avoid double-charging customers.
 * 
 * 3. VERSION FIELD: Enables optimistic locking for concurrent updates.
 *    Prevents race conditions when multiple processes modify the same order.
 * 
 * 4. MONEY STORAGE: All monetary values as integers in minor units.
 *    Eliminates floating-point arithmetic errors in financial calculations.
 * 
 * 5. STATUS ENUM: Restricted set of valid order states.
 *    Ensures data consistency and enables proper state machine transitions.
 * 
 * 6. INDEXES: Optimized for common query patterns:
 *    - idempotency_key: Prevents duplicate orders
 *    - status + order_date: Dashboard queries, reporting
 *    - customer.id + order_date: Customer order history
 */
const orderSchema = new mongoose.Schema(
  {
    order_date: {
      type: Date,
      required: true,
      default: Date.now,
      comment: 'Date and time when the order was placed'
    },
    updated_at: {
      type: Date,
      required: true,
      default: Date.now,
      comment: 'Last update timestamp for this order'
    },
    version: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Version must be a positive integer'
      },
      comment: 'Optimistic locking version to prevent concurrent modification conflicts'
    },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
      uppercase: true,
      comment: 'Current order status following the order lifecycle'
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      trim: true,
      comment: 'Currency code for all monetary values in this order (ISO 4217)'
    },
    total_minor: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Total must be an integer in minor units'
      },
      comment: 'Final order total including shipping (subtotal + shipping)'
    },
    idempotency_key: {
      type: String,
      required: true,
      trim: true,
      comment: 'Unique key to prevent duplicate order creation from same request'
    },
    customer: {
      type: customerSnapshotSchema,
      required: [true, 'Customer information is required'],
      comment: 'Embedded customer snapshot at time of order'
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order must contain at least one item'],
      validate: {
        validator: function(items) {
          return items && items.length > 0;
        },
        message: 'Order must contain at least one item'
      },
      comment: 'Array of order items with embedded product snapshots'
    },
    subtotal_minor: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Subtotal must be an integer in minor units'
      },
      comment: 'Sum of all line item totals (before shipping)'
    },
    shipping_minor: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Shipping must be an integer in minor units'
      },
      comment: 'Shipping cost in minor units'
    },
    created_at: {
      type: Date,
      required: true,
      default: Date.now,
      comment: 'Creation timestamp'
    }
  },
  {
    timestamps: false, // Disable automatic timestamps since we use created_at and updated_at
    collection: 'orders'
  }
);

/**
 * INDEXES
 * 
 * These indexes optimize for the most common query patterns in an e-commerce system:
 * 
 * 1. idempotency_key (unique): Prevents duplicate orders from the same request
 *    - Used during order creation to check for existing orders with same key
 *    - Critical for payment processing to avoid double-charging
 * 
 * 2. status + order_date (descending): Dashboard and reporting queries
 *    - Used for: "Show all pending orders sorted by date"
 *    - Used for: "Generate daily sales report by status"
 *    - Compound index supports filtering by status and sorting by date
 * 
 * 3. customer.id + order_date (descending): Customer order history
 *    - Used for: "Show all orders for customer X, sorted by date"
 *    - Enables efficient pagination through customer's order history
 *    - Compound index supports filtering by customer and sorting by date
 */

// Equivalent to: db.orders.createIndex({ idempotency_key: 1 }, { unique: true })
orderSchema.index({ idempotency_key: 1 }, { unique: true });

// Equivalent to: db.orders.createIndex({ status: 1, order_date: -1 })
orderSchema.index({ status: 1, order_date: -1 });

// Equivalent to: db.orders.createIndex({ "customer.id": 1, order_date: -1 })
orderSchema.index({ 'customer.id': 1, order_date: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
