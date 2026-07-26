require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const stableImages = {
  'Smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600',
  'Laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600',
  'TVs': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=600',
  'Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600',
  'Smartwatches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600',
  'Accessories': 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?q=80&w=600',
  'Furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600',
  'Kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600',
  'Home Decor': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600',
  'Lighting': 'https://images.unsplash.com/photo-1513506003901-1e6a229e9d15?q=80&w=600',
  'Garden': 'https://images.unsplash.com/photo-1585320806052-a167d32c0d23?q=80&w=600',
  'Skincare': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600',
  'Makeup': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600',
  'Fragrances': 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600',
  'Hair Care': 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=600',
  'Personal Care': 'https://images.unsplash.com/photo-1556228720-1c2a0153f572?q=80&w=600'
};

async function fixImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const products = await Product.find({ "images": { $regex: 'loremflickr.com' } });
    console.log(`Found ${products.length} products with loremflickr images.`);

    for (const p of products) {
      if (stableImages[p.subcategory]) {
        p.images = [stableImages[p.subcategory]];
        await p.save();
        console.log(`Updated ${p.title} to use stable image.`);
      }
    }
    console.log('Done!');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

fixImages();
