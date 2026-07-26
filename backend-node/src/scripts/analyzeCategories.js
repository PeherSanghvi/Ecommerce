require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const fs = require('fs');

async function analyze() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecom');
  const products = await Product.find({}).select('title').lean();
  
  const titles = products.map(p => p.title);
  fs.writeFileSync('all_titles.json', JSON.stringify(titles, null, 2));
  console.log(`Saved ${titles.length} titles`);
  process.exit(0);
}

analyze().catch(console.error);
