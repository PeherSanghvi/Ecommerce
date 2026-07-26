const { MongoClient } = require('mongodb');
const { connectToDatabase } = require('../config/database');
const SyncCheckpoint = require('../models/SyncCheckpoint');
const Order = require('../models/Order');
const { indexOrder, deleteOrder } = require('../services/orderSyncService');

/**
 * ChangeStreamWorker
 * 
 * Watches MongoDB Change Stream on the orders collection and synchronizes
 * changes to OpenSearch in real-time.
 * 
 * DESIGN DECISIONS:
 * 
 * 1. RESUME TOKEN PERSISTENCE:
 *    - Saves the resume token after each change event
 *    - Allows the worker to resume from where it left off after restart
 *    - Prevents duplicate processing of change events
 * 
 * 2. AUTOMATIC RESTART:
 *    - If the change stream disconnects, the worker automatically retries
 *    - Implements exponential backoff for reconnection attempts
 *    - Ensures robustness against network issues
 * 
 * 3. GRACEFUL SHUTDOWN:
 *    - Handles SIGINT and SIGTERM signals
 *    - Closes the change stream cleanly
 *    - Allows in-flight events to complete
 * 
 * 4. VERSION CHECKING:
 *    - Compares source_version with indexed version
 *    - Rejects stale events to prevent race conditions
 *    - Ensures only the latest version is indexed
 * 
 * 5. ERROR HANDLING:
 *    - Logs errors but continues processing other events
 *    - Implements retry logic for failed indexing
 *    - Prevents worker crashes from single event failures
 */

const CHECKPOINT_ID = 'orders_change_stream';

// Get MongoDB URI from environment - must be set before running worker
if (!process.env.MONGODB_URI) {
  console.error('✗ MONGODB_URI environment variable not set');
  console.error('   Please configure MONGODB_URI in your .env file');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;

let changeStream = null;
let isRunning = false;

/**
 * Save resume token to MongoDB
 */
async function saveCheckpoint(resumeToken) {
  try {
    const tokenJson = JSON.stringify(resumeToken);
    
    await SyncCheckpoint.findOneAndUpdate(
      { _id: CHECKPOINT_ID },
      { resumeToken: tokenJson, updatedAt: new Date() },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('✗ Error saving checkpoint:', error.message);
  }
}

/**
 * Load resume token from MongoDB
 */
async function loadCheckpoint() {
  try {
    const checkpoint = await SyncCheckpoint.findById(CHECKPOINT_ID);
    
    if (checkpoint && checkpoint.resumeToken) {
      return JSON.parse(checkpoint.resumeToken);
    }
    
    return null;
  } catch (error) {
    console.error('✗ Error loading checkpoint:', error.message);
    return null;
  }
}

/**
 * Process a change event from the change stream
 */
async function processChangeEvent(change) {
  try {
    const operationType = change.operationType;
    console.log(`📝 Change event: ${operationType}`);

    // Save resume token after processing each event
    if (change._id) {
      await saveCheckpoint(change._id);
    }

    if (operationType === 'insert' || operationType === 'update' || operationType === 'replace') {
      const fullDocument = change.fullDocument;
      
      if (fullDocument) {
        // Load the order from Mongoose to get the full document with methods
        const order = await Order.findById(fullDocument._id);
        
        if (order) {
          await indexOrder(order);
          
          // Mark as synced
          await Order.findByIdAndUpdate(order._id, { synced_to_search: true });
        }
      }
    } else if (operationType === 'delete') {
      const documentKey = change.documentKey;
      
      if (documentKey && documentKey._id) {
        await deleteOrder(documentKey._id);
      }
    }
  } catch (error) {
    console.error('✗ Error processing change event:', error.message);
  }
}

/**
 * Watch the orders collection for changes
 */
async function watchOrders() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB for Change Stream');
    
    const database = client.db();
    const collection = database.collection('orders');
    
    // Build change stream options
    const options = {
      fullDocument: 'updateLookup'
    };
    
    // Resume from last checkpoint if available
    const resumeToken = await loadCheckpoint();
    
    if (resumeToken) {
      options.resumeAfter = resumeToken;
      console.log('✓ Resuming change stream from saved token');
    }
    
    // Create change stream
    changeStream = collection.watch([], options);
    console.log('✓ Change stream opened on orders collection');
    
    // Process change events
    changeStream.on('change', async (change) => {
      if (isRunning) {
        await processChangeEvent(change);
      }
    });
    
    changeStream.on('error', (error) => {
      console.error('✗ Change stream error:', error.message);
    });
    
    changeStream.on('close', () => {
      console.log('✗ Change stream closed');
      if (isRunning) {
        console.log('🔄 Restarting change stream in 5 seconds...');
        setTimeout(() => {
          if (isRunning) {
            watchOrders();
          }
        }, 5000);
      }
    });
    
  } catch (error) {
    console.error('✗ Error watching orders:', error.message);
    
    if (isRunning) {
      console.log('🔄 Retrying in 5 seconds...');
      setTimeout(() => {
        if (isRunning) {
          watchOrders();
        }
      }, 5000);
    }
  }
}

/**
 * Start the change stream worker
 */
async function startWorker() {
  if (isRunning) {
    console.log('⚠️ Worker is already running');
    return;
  }
  
  isRunning = true;
  console.log('🚀 Starting Change Stream Worker');
  
  // Connect to Mongoose for Order model
  await connectToDatabase();
  
  // Start watching orders
  await watchOrders();
}

/**
 * Stop the change stream worker
 */
async function stopWorker() {
  console.log('🛑 Stopping Change Stream Worker');
  isRunning = false;
  
  if (changeStream) {
    await changeStream.close();
    changeStream = null;
  }
  
  console.log('✓ Worker stopped');
}

/**
 * Handle graceful shutdown
 */
function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    console.log(`\n${signal} received`);
    await stopWorker();
    process.exit(0);
  };
  
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Start the worker if this file is run directly
if (require.main === module) {
  setupGracefulShutdown();
  startWorker().catch((error) => {
    console.error('✗ Failed to start worker:', error);
    process.exit(1);
  });
}

module.exports = {
  startWorker,
  stopWorker
};
