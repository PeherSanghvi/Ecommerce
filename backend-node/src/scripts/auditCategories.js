require('dotenv').config();
const { connectToDatabase, closeDatabaseConnection } = require('../config/database');
const Product = require('../models/Product');

async function auditCategories() {
  try {
    await connectToDatabase();
    console.log('=== MONGODB CATEGORY AUDIT ===\n');

    // Get total count
    const totalCount = await Product.countDocuments({ active: true });
    console.log(`Total active products: ${totalCount}\n`);

    // Get unique primary categories
    const categories = await Product.distinct('primaryCategory', { active: true });
    console.log(`Primary categories found: ${categories.length}`);
    console.log('Categories:', categories.sort());

    // Count by category
    console.log('\n--- Products per category ---');
    const categoryStats = [];
    for (const cat of categories.sort()) {
      const count = await Product.countDocuments({ primaryCategory: cat, active: true });
      categoryStats.push({ category: cat, count });
      console.log(`${cat}: ${count} products`);
    }

    // Get sample products from each category
    console.log('\n--- Sample products from each category ---');
    for (const { category } of categoryStats) {
      const sample = await Product.findOne({ primaryCategory: category, active: true }).select('title primaryCategory subCategory');
      console.log(`\n${category}:`);
      console.log(`  Sample: ${sample.title.substring(0, 60)}`);
      console.log(`  SubCategory: ${sample.subCategory}`);
    }

    // Check for missing fields
    console.log('\n--- Data quality check ---');
    const missingPrimary = await Product.countDocuments({ primaryCategory: { $exists: false }, active: true });
    const missingSub = await Product.countDocuments({ subCategory: { $exists: false }, active: true });
    const missingTitle = await Product.countDocuments({ title: { $exists: false }, active: true });
    const missingPrice = await Product.countDocuments({ price_minor: { $exists: false }, active: true });

    console.log(`Products without primaryCategory: ${missingPrimary}`);
    console.log(`Products without subCategory: ${missingSub}`);
    console.log(`Products without title: ${missingTitle}`);
    console.log(`Products without price: ${missingPrice}`);

    // Overall status
    console.log('\n=== SUMMARY ===');
    console.log(`Categories with products: ${categoryStats.length}`);
    console.log(`Total products in DB: ${totalCount}`);
    console.log(`Data complete: ${missingPrimary === 0 && missingSub === 0 ? 'YES' : 'NO'}`);

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

auditCategories();
