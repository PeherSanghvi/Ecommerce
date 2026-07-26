const { Client } = require('@opensearch-project/opensearch');

/**
 * OpenSearch Client Configuration
 * 
 * DESIGN DECISIONS:
 * 
 * 1. CONNECTION MANAGEMENT:
 *    - Uses environment variables for configuration
 *    - Falls back to localhost defaults for development
 *    - Supports both HTTP and HTTPS schemes
 * 
 * 2. CLIENT REUSE:
 *    - Singleton pattern to reuse the same client instance
 *    - Reduces connection overhead
 *    - Ensures consistent configuration
 * 
 * 3. ERROR HANDLING:
 *    - Validates connection on startup
 *    - Provides meaningful error messages
 */

const OPENSEARCH_HOST = process.env.OPENSEARCH_HOST || 'localhost';
const OPENSEARCH_PORT = process.env.OPENSEARCH_PORT || 9200;
const OPENSEARCH_SCHEME = process.env.OPENSEARCH_SCHEME || 'http';
const OPENSEARCH_USERNAME = process.env.OPENSEARCH_USERNAME || '';
const OPENSEARCH_PASSWORD = process.env.OPENSEARCH_PASSWORD || '';

let client = null;

/**
 * Get or create OpenSearch client instance
 */
function getOpenSearchClient() {
  if (!client) {
    const node = `${OPENSEARCH_SCHEME}://${OPENSEARCH_HOST}:${OPENSEARCH_PORT}`;
    
    const auth = OPENSEARCH_USERNAME && OPENSEARCH_PASSWORD
      ? {
          username: OPENSEARCH_USERNAME,
          password: OPENSEARCH_PASSWORD
        }
      : undefined;

    client = new Client({
      node,
      auth,
      ssl: {
        rejectUnauthorized: false // For development only
      }
    });

    console.log(`✓ OpenSearch client configured: ${node}`);
  }

  return client;
}

/**
 * Test OpenSearch connection
 */
async function testConnection() {
  try {
    const client = getOpenSearchClient();
    const response = await client.ping();
    
    if (response.statusCode === 200) {
      console.log('✓ OpenSearch connection successful');
      return true;
    }
    
    console.error('✗ OpenSearch connection failed');
    return false;
  } catch (error) {
    console.error('✗ OpenSearch connection error:', error.message);
    return false;
  }
}

module.exports = {
  getOpenSearchClient,
  testConnection
};
