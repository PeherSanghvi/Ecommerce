const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * MongoDB Connection Configuration
 * 
 * DESIGN DECISIONS:
 * 
 * 1. ATLAS-OPTIMIZED OPTIONS:
 *    - serverSelectionTimeoutMS: 30 seconds for Atlas network latency
 *    - connectTimeoutMS: 10 seconds for initial connection
 *    - socketTimeoutMS: 45 seconds for query operations
 *    - retryWrites: true (included in Atlas connection string)
 *    - w: majority (included in Atlas connection string)
 * 
 * 2. CONNECTION POOLING:
 *    - maxPoolSize: 10 for standard connections
 *    - Mongoose handles connection reuse automatically
 * 
 * 3. ERROR HANDLING:
 *    - Validates MONGODB_URI is set
 *    - Provides clear error messages
 *    - Connection events for monitoring
 * 
 * 4. GRACEFUL SHUTDOWN:
 *    - Properly closes connection
 *    - Allows in-flight operations to complete
 */

/**
 * Connect to MongoDB (Local or Atlas)
 * @returns {Promise<void>}
 */
async function connectToDatabase() {
  // Validate connection string is configured
  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI environment variable not set. ' +
      'For MongoDB Atlas, use: mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority'
    );
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Hide credentials in logs
    const displayUri = MONGODB_URI.replace(/:[^:]+@/, ':***@');
    console.log(`   URI: ${displayUri}`);

    await mongoose.connect(MONGODB_URI, {
      // Connection timeout settings optimized for Atlas
      serverSelectionTimeoutMS: 30000, // 30 seconds for Atlas network
      connectTimeoutMS: 10000,         // 10 seconds for initial connection
      socketTimeoutMS: 45000,          // 45 seconds for socket operations
      
      // Connection pooling
      maxPoolSize: 10,
      minPoolSize: 5,
      
      // Automatically retry failed operations
      retryWrites: true,
      retryReads: true
    });

    console.log('✓ Connected to MongoDB');
    console.log(`✓ Database: ${mongoose.connection.name}`);
    console.log(`✓ State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting'}`);

    // Set up connection event listeners
    setupConnectionEvents();

  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    
    // Provide helpful debugging information
    if (error.message.includes('ENOTFOUND')) {
      console.error('  → Host not found. Check your MongoDB Atlas cluster URL.');
    } else if (error.message.includes('authentication failed')) {
      console.error('  → Authentication failed. Check your username and password.');
    } else if (error.message.includes('IP address')) {
      console.error('  → IP address not whitelisted. Add your IP to MongoDB Atlas Network Access.');
    }
    
    throw error;
  }
}

/**
 * Set up connection event listeners for monitoring
 */
function setupConnectionEvents() {
  const connection = mongoose.connection;

  connection.on('connected', () => {
    console.log('✓ MongoDB connection established');
  });

  connection.on('error', (err) => {
    console.error('✗ MongoDB connection error:', err.message);
  });

  connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
  });

  connection.on('reconnected', () => {
    console.log('✓ MongoDB reconnected');
  });
}

/**
 * Close MongoDB connection gracefully
 * @returns {Promise<void>}
 */
async function closeDatabaseConnection() {
  try {
    console.log('🔌 Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('✓ MongoDB connection closed');
  } catch (error) {
    console.error('✗ Error closing database connection:', error.message);
    throw error;
  }
}

/**
 * Health check - verify MongoDB is connected
 * @returns {boolean}
 */
function isConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectToDatabase,
  closeDatabaseConnection,
  isConnected,
  mongoose
};
