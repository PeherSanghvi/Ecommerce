const { createOrder, getOrderById, updateOrderStatus, getOrdersByCustomerId } = require('../services/orderService');

/**
 * OrderController
 * 
 * Handles HTTP requests for order endpoints.
 * Delegates business logic to the service layer.
 * 
 * DESIGN DECISIONS:
 * 
 * 1. SEPARATION OF CONCERNS:
 *    - Controller handles HTTP request/response
 *    - Service handles business logic and database transactions
 *    - Makes the code testable and maintainable
 * 
 * 2. ERROR HANDLING:
 *    - Catches service layer errors
 *    - Returns appropriate HTTP status codes
 *    - Provides meaningful error messages
 * 
 * 3. RESPONSE FORMAT:
 *    - Consistent JSON response structure
 *    - Includes order data, totals, and success message
 *    - Follows REST conventions
 */

/**
 * POST /api/orders
 * 
 * Creates a new order with inventory validation and MongoDB transaction.
 * 
 * Request body:
 * {
 *   "customerId": "...",
 *   "items": [
 *     {
 *       "productId": "...",
 *       "quantity": 2
 *     }
 *   ],
 *   "idempotencyKey": "checkout-xxxxxxxx"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "order": {...},
 *   "totals": {
 *     "subtotal_minor": ...,
 *     "shipping_minor": ...,
 *     "total_minor": ...
 *   },
 *   "message": "Order created successfully"
 * }
 */
async function createOrderController(req, res) {
  try {
    const orderData = req.validatedOrder;
    const result = await createOrder(orderData);

    res.status(201).json({
      success: result.success,
      order: result.order,
      totals: result.totals,
      message: result.message
    });

  } catch (error) {
    console.error('Error in createOrderController:', error);
    
    // Determine appropriate HTTP status code based on error type
    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error.message.includes('Customer not found')) {
      statusCode = 404;
      errorMessage = error.message;
    } else if (error.message.includes('Product') && error.message.includes('not found')) {
      statusCode = 404;
      errorMessage = error.message;
    } else if (error.message.includes('Insufficient stock')) {
      statusCode = 409;
      errorMessage = error.message;
    } else if (error.message.includes('Failed to update stock')) {
      statusCode = 409;
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message
    });
  }
}

/**
 * GET /api/orders/customer/:customerId
 * 
 * Get all orders for a specific customer (paginated).
 * Returns orders sorted by date (newest first).
 */
async function getOrdersByCustomerIdController(req, res) {
  try {
    const { customerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID is required'
      });
    }

    const result = await getOrdersByCustomerId(customerId, page, limit);

    res.status(200).json({
      success: true,
      orders: result.orders,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error in getOrdersByCustomerIdController:', error);

    let statusCode = 500;
    let errorMessage = 'Failed to fetch orders';

    if (error.message.includes('Invalid')) {
      statusCode = 400;
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message
    });
  }
}

/**
 * GET /api/orders/:id
 * 
 * Get a single order by ID from MongoDB.
 */
async function getOrderByIdController(req, res) {
  try {
    const { id } = req.params;
    const order = await getOrderById(id);

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Error in getOrderByIdController:', error);

    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error.message.includes('not found')) {
      statusCode = 404;
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message
    });
  }
}

/**
 * PATCH /api/orders/:id/status
 * 
 * Update order status with optimistic concurrency.
 * 
 * Request body:
 * {
 *   "status": "CONFIRMED",
 *   "version": 1
 * }
 * 
 * Returns HTTP 409 if version doesn't match (stale update).
 */
async function updateOrderStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status, version } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    if (version === undefined || version === null) {
      return res.status(400).json({
        success: false,
        error: 'Version is required for optimistic locking'
      });
    }

    const result = await updateOrderStatus(id, status, version);

    res.status(200).json({
      success: true,
      order: result.order,
      message: result.message
    });

  } catch (error) {
    console.error('Error in updateOrderStatusController:', error);

    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error.message.includes('not found')) {
      statusCode = 404;
      errorMessage = error.message;
    } else if (error.message.includes('Stale update') || error.message.includes('version')) {
      statusCode = 409;
      errorMessage = error.message;
    } else if (error.message.includes('Invalid status')) {
      statusCode = 400;
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message
    });
  }
}

module.exports = {
  createOrderController,
  getOrdersByCustomerIdController,
  getOrderByIdController,
  updateOrderStatusController
};
