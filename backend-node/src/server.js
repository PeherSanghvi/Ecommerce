require('dotenv').config();

const express = require('express');
const { connectToDatabase } = require('./config/database');
const { testConnection } = require('./config/opensearch');
const { initializeIndex } = require('./config/opensearchIndex');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const searchRoutes = require('./routes/searchRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

/**
 * Express Server Setup
 * 
 * DESIGN DECISIONS:
 * 
 * 1. DATABASE CONNECTION:
 *    - Connects to MongoDB before starting the server
 *    - Ensures database is available for requests
 * 
 * 2. MIDDLEWARE:
 *    - JSON parsing for request bodies
 *    - Error handling middleware
 * 
 * 3. ROUTE ORGANIZATION:
 *    - Routes are modular and separated by domain
 *    - API routes are prefixed with /api
 */

const app = express();
const PORT = process.env.PORT || 8082;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Test OpenSearch connection
    const osConnected = await testConnection();
    if (!osConnected) {
      console.warn('⚠ OpenSearch connection failed, continuing without search...');
    }

    // Initialize OpenSearch index
    await initializeIndex();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log(`✓ Products API: http://localhost:${PORT}/api/products`);
      console.log(`✓ Orders API: http://localhost:${PORT}/api/orders`);
      console.log(`✓ Search API: http://localhost:${PORT}/api/search`);
      console.log(`✓ Admin API: http://localhost:${PORT}/api/admin`);
      console.log(`✓ Auth API: http://localhost:${PORT}/api/auth`);
    });

  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
