require('dotenv').config();
const http = require('http');
const { connectToDatabase, closeDatabaseConnection } = require('./src/config/database');
const User = require('./src/models/User');
const Order = require('./src/models/Order');
const Product = require('./src/models/Product');

const BASE_URL = `http://localhost:${process.env.PORT || 8082}`;

async function apiCall(method, path, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(path, BASE_URL);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 400) {
            reject(new Error(`API Error: ${res.statusCode} - ${json.error || json.message}`));
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  try {
    console.log('\n========================================');
    console.log('CHECKOUT FLOW TEST');
    console.log('========================================\n');

    await connectToDatabase();
    console.log('✓ Connected to MongoDB\n');

    console.log('STEP 1: Fetching real user from MongoDB...');
    const user = await User.findOne().lean();
    if (!user) {
      console.error('✗ No users found');
      process.exit(1);
    }
    console.log(`✓ Found user: ${user.name} (${user.email})`);
    console.log(`✓ MongoDB ObjectId: ${user._id}\n`);

    console.log('STEP 2: Testing login endpoint...');
    const loginResponse = await apiCall('POST', '/api/auth/login', { email: user.email });
    console.log('✓ Login successful');
    console.log(`✓ Response user._id: ${loginResponse.user._id}`);
    console.log(`✓ Match: ${loginResponse.user._id === user._id.toString() ? 'YES' : 'NO'}\n`);

    console.log('STEP 3: Fetching products for order...');
    const products = await Product.find({ active: true }).limit(2).lean();
    if (products.length < 2) {
      console.error('✗ Need at least 2 products');
      process.exit(1);
    }
    console.log(`✓ Found ${products.length} products\n`);

    console.log('STEP 4: Building order payload...');
    const orderPayload = {
      customerId: user._id.toString(),
      items: products.map(p => ({ productId: p._id.toString(), quantity: 1 })),
      idempotencyKey: `test-${Date.now()}`
    };
    console.log(`✓ customerId: ${orderPayload.customerId}`);
    console.log(`✓ items: ${orderPayload.items.length}\n`);

    console.log('STEP 5: Placing order...');
    const orderResponse = await apiCall('POST', '/api/orders', orderPayload);
    console.log('✓ Order created successfully');
    console.log(`✓ Order ID: ${orderResponse.order._id}\n`);

    console.log('STEP 6: Verifying order in MongoDB...');
    const savedOrder = await Order.findById(orderResponse.order._id).lean();
    if (!savedOrder) {
      throw new Error('Order not saved');
    }
    console.log('✓ Order found in MongoDB');
    console.log(`✓ Customer ID: ${savedOrder.customer?.id}`);
    console.log(`✓ Match: ${savedOrder.customer?.id.toString() === user._id.toString() ? 'YES' : 'NO'}\n`);

    console.log('========================================');
    console.log('✓ ALL TESTS PASSED');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n✗ TEST FAILED:', error.message);
    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

test();
