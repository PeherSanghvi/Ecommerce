require('dotenv').config();

const { connectToDatabase, closeDatabaseConnection } = require('../config/database');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

/**
 * Seed products from JSON file to MongoDB
 */
async function seedProducts() {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Load products from JSON file
    const jsonPath = path.join(__dirname, '../../seed/products_seed.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    let products = JSON.parse(jsonData);

    // Remove _id field from each product to let MongoDB auto-generate ObjectIds
    products = products.map(product => {
      const { _id, ...productWithoutId } = product;
      return productWithoutId;
    });

    // Delete existing products
    await Product.deleteMany({});
    console.log('✓ Deleted Existing Products');

    // Bulk insert products
    console.log('✓ Inserting Products...');
    const insertedProducts = await Product.insertMany(products);
    console.log(`✓ Inserted ${insertedProducts.length} Products`);

    console.log('✓ Database Seed Complete');

  } catch (error) {
    console.error('✗ Error during seed:', error.message);
    
    // Handle specific error types
    if (error.code === 11000) {
      console.error('✗ Duplicate key error - SKU must be unique');
    } else if (error instanceof SyntaxError) {
      console.error('✗ JSON parsing error - check the seed file format');
    }
    
    process.exit(1);
  } finally {
    // Close database connection
    await closeDatabaseConnection();
  }
}

// Run the seed script
seedProducts();
