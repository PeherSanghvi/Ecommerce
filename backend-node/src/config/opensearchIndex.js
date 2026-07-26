const { getOpenSearchClient } = require('./opensearch');

/**
 * OpenSearch Index Configuration
 * 
 * DESIGN DECISIONS:
 * 
 * 1. INDEX MAPPING:
 *    - Defines the structure of the orders index
 *    - Uses keyword fields for exact matching (IDs, status)
 *    - Uses text fields with custom analyzer for full-text search
 *    - Nested type for items array to enable nested queries
 * 
 * 2. CUSTOM ANALYZER:
 *    - Standard tokenizer for word boundaries
 *    - Lowercase filter for case-insensitive search
 *    - Asciifolding for accent-insensitive search
 * 
 * 3. SETTINGS:
 *    - Single shard for development (can be increased for production)
 *    - No replicas for development (can be increased for production)
 */

const INDEX_NAME = 'orders';

const INDEX_MAPPING = {
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0,
    analysis: {
      analyzer: {
        custom_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding']
        }
      }
    }
  },
  mappings: {
    properties: {
      id: { type: 'keyword' },
      idempotency_key: { type: 'keyword' },
      status: { type: 'keyword' },
      currency: { type: 'keyword' },
      total_minor: { type: 'long' },
      subtotal_minor: { type: 'long' },
      shipping_minor: { type: 'long' },
      source_version: { type: 'long' },
      order_date: { type: 'date' },
      updated_at: { type: 'date' },
      created_at: { type: 'date' },
      customer: {
        properties: {
          id: { type: 'keyword' },
          name: { 
            type: 'text', 
            analyzer: 'custom_analyzer',
            fields: { keyword: { type: 'keyword' } }
          },
          email: { type: 'keyword' }
        }
      },
      items: {
        type: 'nested',
        properties: {
          product_id: { type: 'keyword' },
          sku: { type: 'keyword' },
          title: { 
            type: 'text', 
            analyzer: 'custom_analyzer'
          },
          quantity: { type: 'integer' },
          unit_price_minor: { type: 'long' },
          line_total_minor: { type: 'long' }
        }
      }
    }
  }
};

/**
 * Check if index exists
 */
async function indexExists() {
  try {
    const client = getOpenSearchClient();
    const response = await client.indices.exists({
      index: INDEX_NAME
    });
    return response.statusCode === 200;
  } catch (error) {
    console.error('Error checking index existence:', error.message);
    return false;
  }
}

/**
 * Create the orders index with mapping
 */
async function createIndex() {
  try {
    const client = getOpenSearchClient();
    const response = await client.indices.create({
      index: INDEX_NAME,
      body: INDEX_MAPPING
    });

    if (response.statusCode === 200) {
      console.log(`✓ Created OpenSearch index: ${INDEX_NAME}`);
      return true;
    }

    console.error('✗ Failed to create index:', response.body);
    return false;
  } catch (error) {
    if (error.message.includes('resource_already_exists_exception')) {
      console.log(`✓ OpenSearch index already exists: ${INDEX_NAME}`);
      return true;
    }
    console.error('✗ Error creating index:', error.message);
    return false;
  }
}

/**
 * Delete the orders index
 */
async function deleteIndex() {
  try {
    const client = getOpenSearchClient();
    const response = await client.indices.delete({
      index: INDEX_NAME
    });

    if (response.statusCode === 200) {
      console.log(`✓ Deleted OpenSearch index: ${INDEX_NAME}`);
      return true;
    }

    console.error('✗ Failed to delete index:', response.body);
    return false;
  } catch (error) {
    console.error('✗ Error deleting index:', error.message);
    return false;
  }
}

/**
 * Initialize the orders index (create if not exists)
 */
async function initializeIndex() {
  const exists = await indexExists();
  
  if (!exists) {
    return await createIndex();
  }
  
  console.log(`✓ OpenSearch index already exists: ${INDEX_NAME}`);
  return true;
}

/**
 * Recreate the orders index (delete and create)
 */
async function recreateIndex() {
  const exists = await indexExists();
  
  if (exists) {
    await deleteIndex();
  }
  
  return await createIndex();
}

module.exports = {
  INDEX_NAME,
  indexExists,
  createIndex,
  deleteIndex,
  initializeIndex,
  recreateIndex
};
