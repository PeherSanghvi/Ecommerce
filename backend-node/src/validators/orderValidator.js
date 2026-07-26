/**
 * Order Request Validator
 * 
 * Validates and sanitizes request payload for order creation.
 * Ensures all required fields are present and valid.
 * 
 * DESIGN DECISIONS:
 * 
 * 1. OPTIONAL CUSTOMER ID:
 *    - Guest checkout supported (customerId can be empty/null)
 *    - WHY: Allows users to checkout without account
 *    - If customerId provided, must be valid string (MongoDB ObjectId)
 * 
 * 2. ITEM VALIDATION:
 *    - productId: Must be valid MongoDB ObjectId string
 *    - quantity: Must be positive integer
 *    - Items array must have at least 1 item
 */

/**
 * Validate checkout request payload
 * 
 * Accepts:
 * - customerId: Optional MongoDB ObjectId (string) or empty for guest
 * - items: Array of {productId, quantity}
 * - idempotencyKey: Unique request key
 */
function validateCheckoutRequest(req, res, next) {
  const { customerId, items, idempotencyKey } = req.body;

  // Validate customerId
  // For authenticated orders: must be a valid MongoDB ObjectId (24-char hex string)
  // For guest orders: must be empty string or omitted
  if (customerId && customerId !== '') {
    // Provided customerId must be exactly 24 hexadecimal characters (MongoDB ObjectId format)
    if (typeof customerId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(customerId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: `Invalid customer ID format. Must be a valid MongoDB ObjectId (24 hexadecimal characters), got: "${customerId}". If you don't have a valid ObjectId, use an empty string for guest checkout.`
      });
    }
  }

  // Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request',
      message: 'Items array is required and must contain at least one item'
    });
  }

  // Validate each item
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item.productId || typeof item.productId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: `Item at index ${i}: Product ID is required and must be a string`
      });
    }

    if (!item.quantity || typeof item.quantity !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: `Item at index ${i}: Quantity is required and must be a number`
      });
    }

    if (!Number.isInteger(item.quantity)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: `Item at index ${i}: Quantity must be an integer`
      });
    }

    if (item.quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: `Item at index ${i}: Quantity must be greater than 0`
      });
    }
  }

  // Validate idempotency key
  if (!idempotencyKey || typeof idempotencyKey !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid request',
      message: 'Idempotency key is required and must be a string'
    });
  }

  // Attach validated data to request
  req.validatedOrder = {
    customerId,
    items,
    idempotencyKey
  };

  next();
}

module.exports = {
  validateCheckoutRequest
};
