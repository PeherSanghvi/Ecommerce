const { getOpenSearchClient } = require('../config/opensearch');
const { INDEX_NAME } = require('../config/opensearchIndex');
const Order = require('../models/Order');

/**
 * Search Service
 * 
 * Handles OpenSearch-based order search with full-text, filters, ranges, and aggregations.
 * 
 * DESIGN DECISIONS:
 * 
 * 1. OPENSEARCH-ONLY:
 *    - Never queries MongoDB for search
 *    - All search functionality runs on OpenSearch
 * 
 * 2. QUERY DSL:
 *    - Builds OpenSearch Query DSL programmatically
 *    - Supports multi-match, term, range, nested queries
 * 
 * 3. AGGREGATIONS:
 *    - Returns status counts and total revenue
 *    - Useful for dashboard KPIs
 * 
 * 4. PAGINATION:
 *    - Supports from/size pagination
 *    - Returns total hits for pagination metadata
 */

/**
 * Build OpenSearch query DSL
 */
function buildSearchQuery(params) {
  const {
    keyword,
    status,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    customerName,
    productTitle,
    page,
    size,
    sortBy,
    sortDir
  } = params;

  const body = {
    from: page * size,
    size: size,
    sort: [
      {
        [sortBy]: { order: sortDir }
      }
    ],
    query: {
      bool: {
        must: [],
        filter: []
      }
    },
    aggs: {
      status_counts: {
        terms: {
          field: 'status',
          size: 20
        }
      },
      total_revenue: {
        sum: {
          field: 'total_minor'
        }
      }
    }
  };

  const boolQuery = body.query.bool;

  // Multi-match keyword search (Omni-search)
  if (keyword) {
    boolQuery.must.push({
      bool: {
        should: [
          {
            multi_match: {
              query: keyword,
              fields: [
                'customer.name^1.5',
                'customer.email'
              ],
              type: 'best_fields',
              fuzziness: 'AUTO'
            }
          },
          {
            nested: {
              path: 'items',
              query: {
                multi_match: {
                  query: keyword,
                  fields: ['items.title^2', 'items.sku^2'],
                  type: 'best_fields',
                  fuzziness: 'AUTO'
                }
              },
              score_mode: 'max'
            }
          },
          {
            match: {
              id: keyword
            }
          }
        ],
        minimum_should_match: 1
      }
    });
  }

  // Status filter
  if (status) {
    boolQuery.filter.push({
      term: {
        status: status
      }
    });
  }

  // Date range filter
  if (dateFrom || dateTo) {
    const rangeQuery = {
      range: {
        order_date: {}
      }
    };
    if (dateFrom) rangeQuery.range.order_date.gte = dateFrom.toISOString();
    if (dateTo) rangeQuery.range.order_date.lte = dateTo.toISOString();
    boolQuery.filter.push(rangeQuery);
  }

  // Amount range filter
  if (minAmount !== undefined || maxAmount !== undefined) {
    const rangeQuery = {
      range: {
        total_minor: {}
      }
    };
    if (minAmount !== undefined) rangeQuery.range.total_minor.gte = minAmount;
    if (maxAmount !== undefined) rangeQuery.range.total_minor.lte = maxAmount;
    boolQuery.filter.push(rangeQuery);
  }

  // Customer name filter
  if (customerName) {
    boolQuery.filter.push({
      multi_match: {
        query: customerName,
        fields: ['customer.name'],
        type: 'cross_fields'
      }
    });
  }

  // Product title filter (nested)
  if (productTitle) {
    boolQuery.filter.push({
      nested: {
        path: 'items',
        query: {
          match: {
            'items.title': productTitle
          }
        },
        score_mode: 'none'
      }
    });
  }

  // If no filters, use match_all
  if (boolQuery.must.length === 0 && boolQuery.filter.length === 0) {
    body.query = { match_all: {} };
  }

  return body;
}

/**
 * Search orders in OpenSearch
 */
async function searchOrders(params) {
  try {
    const client = getOpenSearchClient();
    const query = buildSearchQuery(params);

    const response = await client.search({
      index: INDEX_NAME,
      body: query
    });

    const hits = response.body.hits;
    const totalHits = hits.total.value;
    const orders = [];

    // Get full documents from MongoDB for each hit
    for (const hit of hits.hits) {
      const orderId = hit._id;
      const order = await Order.findById(orderId).lean();
      if (order) {
        // Map MongoDB fields to frontend format for consistency
        const mappedOrder = {
          ...order,
          id: order._id.toString(),
          orderId: order._id.toString(),
          totalCents: order.total_minor,
          totalMinor: order.total_minor,
          subtotalCents: order.subtotal_minor,
          subtotalMinor: order.subtotal_minor,
          orderDate: order.order_date,
          createdAt: order.created_at || order.order_date,
          customer: order.customer || {
            name: 'Guest',
            firstName: 'Guest',
            email: ''
          }
        };
        orders.push(mappedOrder);
      }
    }

    // Parse aggregations
    const statusCounts = {};
    const statusBuckets = response.body.aggregations?.status_counts?.buckets || [];
    for (const bucket of statusBuckets) {
      statusCounts[bucket.key] = bucket.doc_count;
    }

    const totalRevenue = response.body.aggregations?.total_revenue?.value || 0;

    return {
      success: true,
      orders,
      data: orders, // For compatibility
      totalHits,
      page: params.page,
      size: params.size,
      totalPages: Math.ceil(totalHits / Math.max(1, params.size)),
      statusCounts,
      totalRevenue
    };

  } catch (error) {
    console.error('Error searching orders:', error.message);
    throw error;
  }
}

module.exports = {
  searchOrders
};
