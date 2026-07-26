require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

async function audit() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const total = await Product.countDocuments();
    console.log(`\n=== Total product count: ${total} ===\n`);

    const categories = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('=== Distinct existing category values and counts ===');
    categories.forEach(c => {
      console.log(`- ${c._id || 'UNASSIGNED'}: ${c.count}`);
    });

    console.log('\n=== Checking for specific departments ===');
    const departmentsToCheck = ['Fashion', 'Electronics', 'Home & Garden', 'Beauty'];
    for (const dept of departmentsToCheck) {
      // We will check by primaryCategory/department or just check category string
      const count = await Product.countDocuments({
        $or: [
          { category: new RegExp(dept, 'i') },
          { primaryCategory: new RegExp(dept, 'i') },
          { department: new RegExp(dept, 'i') }
        ]
      });
      console.log(`- ${dept}: ${count > 0 ? 'YES' : 'NO'} (${count} products match roughly)`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

audit();
