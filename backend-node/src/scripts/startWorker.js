const path = require('path');
const envPath = path.join(__dirname, '..', '..', '.env');
console.log('Loading .env from:', envPath);
require('dotenv').config({ path: envPath });

if (!process.env.MONGODB_URI) {
  console.error('✗ MONGODB_URI environment variable not set');
  console.error('   Please configure MONGODB_URI in your .env file');
  console.error('   Example: mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority');
  process.exit(1);
}

console.log('✓ MONGODB_URI configured from environment');

const { connectToDatabase } = require('../config/database');
const { testConnection } = require('../config/opensearch');
const { initializeIndex } = require('../config/opensearchIndex');
const { startWorker } = require('../workers/changeStreamWorker');

/**
 * Worker Startup Script
 * 
 * DESIGN DECISIONS:
 * 
 * 1. INITIALIZATION SEQUENCE:
 *    - Connect to MongoDB first
 *    - Test OpenSearch connection
 *    - Initialize OpenSearch index
 *    - Start the change stream worker
 * 
 * 2. ERROR HANDLING:
 *    - Fails fast if any initialization step fails
 *    - Provides clear error messages
 *    - Exits with non-zero code on failure
 * 
 * 3. GRACEFUL SHUTDOWN:
 *    - Handles process signals
 *    - Ensures clean shutdown of worker
 */

async function start() {
  try {
    console.log('🚀 Starting OpenSearch Sync Worker');
    console.log('=====================================');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await connectToDatabase();
    console.log('✓ MongoDB connected');

    // Test OpenSearch connection
    console.log('📡 Testing OpenSearch connection...');
    const openSearchConnected = await testConnection();
    
    if (!openSearchConnected) {
      console.error('✗ Failed to connect to OpenSearch');
      console.error('Please ensure OpenSearch is running at localhost:9200');
      process.exit(1);
    }

    // Initialize OpenSearch index
    console.log('📋 Initializing OpenSearch index...');
    const indexInitialized = await initializeIndex();
    
    if (!indexInitialized) {
      console.error('✗ Failed to initialize OpenSearch index');
      process.exit(1);
    }

    // Start change stream worker
    console.log('🔄 Starting Change Stream Worker...');
    await startWorker();

    console.log('✓ Worker started successfully');
    console.log('🎉 Ready to sync orders to OpenSearch');

  } catch (error) {
    console.error('✗ Failed to start worker:', error.message);
    process.exit(1);
  }
}

// Start the worker
start();
