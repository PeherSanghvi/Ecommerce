const http = require('http');
require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.collection('products');
    
    const fashion = await db.countDocuments({ department: 'Fashion' });
    const electronics = await db.countDocuments({ department: 'Electronics' });
    const home = await db.countDocuments({ department: 'Home & Garden' });
    const beauty = await db.countDocuments({ department: 'Beauty' });
    
    console.log('DATABASE DISTRIBUTION:');
    console.log(`Fashion: ${fashion}`);
    console.log(`Electronics: ${electronics}`);
    console.log(`Home & Garden: ${home}`);
    console.log(`Beauty: ${beauty}`);
    
    const subcategories = await db.aggregate([
      { $match: { department: 'Fashion' } },
      { $group: { _id: '$subcategory', count: { $sum: 1 } } }
    ]).toArray();
    
    console.log('\nSubcategory counts for Fashion:');
    subcategories.forEach(s => console.log(`  ${s._id}: ${s.count}`));
    
    http.get('http://localhost:8082/api/products?department=Fashion&limit=1', (res) => {
      let data = '';
      res.on('data', chunk => data+=chunk);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        console.log('\nAPI Test Response:', JSON.stringify(parsed.data[0], null, 2));
        process.exit(0);
      });
    }).on('error', (err) => {
      console.log('\nAPI Test failed:', err.message);
      process.exit(1);
    });
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();
