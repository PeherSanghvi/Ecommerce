const express = require('express');
const router = express.Router();
const { validateCheckoutRequest } = require('../validators/orderValidator');
const { 
  createOrderController, 
  getOrderByIdController, 
  updateOrderStatusController,
  getOrdersByCustomerIdController 
} = require('../controllers/orderController');
const { isAdmin } = require('../middleware/authMiddleware');

/**
 * Order Routes
 * 
 * Defines all order-related endpoints.
 * Applies validation middleware before controller.
 */

/**
 * POST /api/orders
 * 
 * Create a new order with inventory validation and MongoDB transaction.
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
router.post('/', validateCheckoutRequest, createOrderController);

/**
 * GET /api/orders/customer/:customerId
 * 
 * Get all orders for a specific customer (paginated).
 * Returns orders sorted by date (newest first).
 * 
 * Query Parameters:
 *   - page: page number (default: 1)
 *   - limit: items per page (default: 20)
 * 
 * Response:
 * {
 *   "success": true,
 *   "orders": [...],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 20,
 *     "total": 5,
 *     "totalPages": 1
 *   }
 * }
 */
router.get('/customer/:customerId', getOrdersByCustomerIdController);

/**
 * GET /api/orders/:id
 * 
 * Get a single order by ID from MongoDB.
 */
router.get('/:id', getOrderByIdController);

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
router.patch('/:id/status', isAdmin, updateOrderStatusController);

module.exports = router;
