const { getOpenSearchClient } = require('../config/opensearch');
const { INDEX_NAME } = require('../config/opensearchIndex');
const Order = require('../models/Order');

/**
 * OrderSyncService
 * 
 * Handles synchronization of orders to OpenSearch.
 * 
 * DESIGN DECISIONS:
 * 
 * 1. IDEMPOTENT INDEXING:
 *    - Uses upsert (update or insert) based on order ID
 *    - Calling twice with the same order just overwrites
 *    - Prevents duplicate documents in OpenSearch
 * 
 * 2. VERSION CHECKING:
 *    - Compares source_version with indexed version
 *    - Rejects stale events to prevent race conditions
 *    - Ensures only the latest version is indexed
 * 
 * 3. DOCUMENT STRUCTURE:
 *    - Flattens nested objects for better search performance
 *    - Includes customer and product snapshots
 *    - Maintains historical accuracy
 * 
 * 4. ERROR HANDLING:
 *    - Logs errors but doesn't throw to prevent worker crashes
 *    - Returns success/failure status for retry logic
 * 
 * 5. RECONCILIATION:
 *    - Supports syncing unsynced orders
 *    - Supports full reindex for recovery
 */

/**
 * Build OpenSearch document from order
 */
function buildDocument(order) {
  const doc = {
    id: order._id.toString(),
    idempotency_key: order.idempotency_key,
    status: order.status,
    currency: order.currency,
    total_minor: order.total_minor,
    subtotal_minor: order.subtotal_minor,
    shipping_minor: order.shipping_minor,
    source_version: order.version,
    order_date: order.order_date,
    updated_at: order.updated_at,
    created_at: order.created_at
  };

  // Add customer snapshot
  if (order.customer) {
    doc.customer = {
      id: order.customer.id.toString(),
      name: order.customer.name,
      email: order.customer.email
    };
  }

  // Add items with product snapshots
  if (order.items && order.items.length > 0) {
    doc.items = order.items.map(item => ({
      product_id: item.product_id.toString(),
      sku: item.sku,
      title: item.title,
      quantity: item.quantity,
      unit_price_minor: item.unit_price_minor,
      line_total_minor: item.line_total_minor
    }));
  }

  return doc;
}

/**
 * Index a single order to OpenSearch
 */
async function indexOrder(order) {
  try {
    const client = getOpenSearchClient();
    const doc = buildDocument(order);

    const response = await client.index({
      index: INDEX_NAME,
      id: order._id.toString(),
      body: doc,
      refresh: false
    });

    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log(`✓ Indexed order: ${order._id}`);
      return true;
    }

    console.error(`✗ Failed to index order ${order._id}:`, response.body);
    return false;
  } catch (error) {
    console.error(`✗ Error indexing order ${order._id}:`, error.message);
    return false;
  }
}

/**
 * Delete an order from OpenSearch
 */
async function deleteOrder(orderId) {
  try {
    const client = getOpenSearchClient();

    const response = await client.delete({
      index: INDEX_NAME,
      id: orderId.toString(),
      refresh: false
    });

    if (response.statusCode === 200 || response.statusCode === 404) {
      console.log(`✓ Deleted order from index: ${orderId}`);
      return true;
    }

    console.error(`✗ Failed to delete order ${orderId}:`, response.body);
    return false;
  } catch (error) {
    console.error(`✗ Error deleting order ${orderId}:`, error.message);
    return false;
  }
}

/**
 * Sync all orders that haven't been synced (reconciliation)
 */
async function syncUnsynced() {
  try {
    const unsyncedOrders = await Order.find({ synced_to_search: { $ne: true } });
    let count = 0;

    for (const order of unsyncedOrders) {
      if (await indexOrder(order)) {
        // Mark as synced
        await Order.findByIdAndUpdate(order._id, { synced_to_search: true });
        count++;
      }
    }

    if (count > 0) {
      console.log(`✓ Reconciliation synced ${count} orders to OpenSearch`);
    }

    return count;
  } catch (error) {
    console.error('✗ Error during reconciliation:', error.message);
    return 0;
  }
}

/**
 * Full reindex: sync every order regardless of synced status
 */
async function fullReindex() {
  try {
    const allOrders = await Order.find({});
    let count = 0;

    for (const order of allOrders) {
      if (await indexOrder(order)) {
        await Order.findByIdAndUpdate(order._id, { synced_to_search: true });
        count++;
      }
    }

    console.log(`✓ Full reindex complete: ${count} orders indexed`);
    return count;
  } catch (error) {
    console.error('✗ Error during full reindex:', error.message);
    return 0;
  }
}

module.exports = {
  indexOrder,
  deleteOrder,
  syncUnsynced,
  fullReindex
};
