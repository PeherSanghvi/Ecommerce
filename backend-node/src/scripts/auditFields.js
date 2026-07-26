require('dotenv').config();
const { connectToDatabase, closeDatabaseConnection } = require('../config/database');
const Product = require('../models/Product');

async function auditFields() {
  try {
    await connectToDatabase();
    console.log('=== FIELD AUDIT ===\n');

    // Get sample products to see structure
    const samples = await Product.find({ active: true }).limit(5);
    
    console.log('Sample product structure:');
    samples.forEach((p, i) => {
      console.log(`\nProduct ${i + 1}:`);
      console.log(`  _id: ${p._id}`);
      console.log(`  title: ${p.title.substring(0, 50)}`);
      console.log(`  category: ${p.category || 'MISSING'}`);
      console.log(`  primaryCategory: ${p.primaryCategory || 'MISSING'}`);
      console.log(`  subCategory: ${p.subCategory || 'MISSING'}`);
      console.log(`  price_minor: ${p.price_minor}`);
      console.log(`  stock: ${p.stock}`);
    });

    // Check unique categories field
    const uniqueCategories = await Product.distinct('category', { active: true });
    console.log(`\n\nUnique 'category' values: ${uniqueCategories.length}`);
    if (uniqueCategories.length > 0) {
      console.log('Sample categories:');
      uniqueCategories.slice(0, 10).forEach(cat => {
        console.log(`  - ${cat}`);
      });
    }

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

auditFields();
