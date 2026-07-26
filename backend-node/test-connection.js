require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 MongoDB Atlas Connection Diagnostic Test');
console.log('='.repeat(50));

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env');
  process.exit(1);
}

// Log the connection string (with password masked)
const maskedUri = MONGODB_URI.replace(/:[^:]+@/, ':***@');
console.log(`\n📍 Connection String: ${maskedUri}\n`);

// Parse the URI to extract components
const urlObj = new URL(MONGODB_URI);
console.log('🔎 Parsed URI Components:');
console.log(`   Protocol: ${urlObj.protocol}`);
console.log(`   Username: ${urlObj.username}`);
console.log(`   Hostname: ${urlObj.hostname}`);
console.log(`   Pathname: ${urlObj.pathname}`);
console.log(`   App Name: ${urlObj.searchParams.get('appName') || 'not set'}\n`);

async function testConnection() {
  try {
    console.log('⏳ Attempting to connect...\n');

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Shorter timeout for testing
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000
    });

    console.log('✅ Successfully connected to MongoDB Atlas!\n');
    
    // Get connection info
    const connection = mongoose.connection;
    console.log('📊 Connection Information:');
    console.log(`   Database: ${connection.name}`);
    console.log(`   Host: ${connection.host}`);
    console.log(`   Port: ${connection.port}`);
    console.log(`   Ready State: ${connection.readyState === 1 ? 'Connected' : 'Not Connected'}\n`);

    // Try a simple operation
    console.log('🧪 Testing database operation...');
    const testCollection = connection.collection('test_connection');
    const result = await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Test document from connection diagnostic'
    });
    console.log(`   ✅ Successfully inserted test document: ${result.insertedId}\n`);

    // Clean up
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('   ✅ Cleaned up test document\n');

    console.log('🎉 All tests passed! Your MongoDB Atlas connection is working!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Connection Failed\n');
    console.error(`Error Type: ${error.name}`);
    console.error(`Error Message: ${error.message}\n`);

    // Provide helpful diagnostics
    if (error.message.includes('querySrv')) {
      console.error('💡 DIAGNOSIS: DNS/Network Issue');
      console.error('   - Your machine cannot resolve the MongoDB Atlas DNS record');
      console.error('   - Possible causes:');
      console.error('     1. Network Access List is empty in MongoDB Atlas');
      console.error('     2. Your IP is not whitelisted');
      console.error('     3. Corporate/home firewall blocking outbound connections');
      console.error('     4. ISP blocking MongoDB domains\n');
      console.error('   ACTION: Go to MongoDB Atlas → Network Access and add your IP\n');
    } else if (error.message.includes('authentication failed')) {
      console.error('💡 DIAGNOSIS: Authentication Error');
      console.error('   - Username or password is incorrect');
      console.error('   - Check your .env file has correct credentials\n');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('💡 DIAGNOSIS: Hostname not found');
      console.error('   - Atlas cluster hostname is unreachable');
      console.error('   - Check your cluster is running in Atlas Dashboard\n');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 DIAGNOSIS: Connection refused');
      console.error('   - Atlas cluster is not accepting connections');
      console.error('   - Your IP may not be whitelisted\n');
    }

    console.error('Full Error Stack:');
    console.error(error.stack);
    process.exit(1);
  }
}

testConnection();
