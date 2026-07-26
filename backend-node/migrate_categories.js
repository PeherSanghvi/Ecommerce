require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const hierarchy = {
  'Jeans': [/jeans/i],
  'Pants / Trousers': [/trouser/i, /jogger/i, /pants/i, /chinos/i],
  'T-Shirts': [/t-shirt/i, /tee/i],
  'Shirts': [/shirt/i, /blouse/i],
  'Dresses': [/dress/i],
  'Shoes': [/shoe/i, /sneaker/i, /boot/i, /heel/i, /sandal/i],
  'Accessories': [/bra/i, /thong/i, /brief/i, /sock/i, /belt/i, /scarf/i, /bag/i, /hat/i, /mask/i],
  'Tops': [/top/i, /vest/i, /cami/i, /corset/i, /bandeau/i],
  'Outerwear': [/jacket/i, /coat/i, /blazer/i, /shacket/i, /parka/i, /gilet/i, /puffer/i],
  'Knitwear': [/cardigan/i, /jumper/i, /sweater/i, /knit/i, /cardi/i],
  'Swimwear': [/bikini/i, /beach/i, /swimsuit/i],
  'Activewear': [/active/i, /training/i, /gym/i],
  'Sets': [/set/i, /co-ord/i, /pyjama/i]
};

function classify(title) {
  for (const [cat, regexes] of Object.entries(hierarchy)) {
    if (regexes.some(r => r.test(title))) {
      return { department: 'Fashion', subcategory: cat };
    }
  }
  return { department: 'Fashion', subcategory: 'Tops' }; // fallback
}

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Fetching products...');
    const products = await Product.find({}, { _id: 1, title: 1 }).lean();
    
    console.log(`Found ${products.length} products. Beginning migration...`);
    
    const bulkOps = products.map(product => {
      const { department, subcategory } = classify(product.title);
      return {
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { department, subcategory } }
        }
      };
    });

    const batchSize = 1000;
    for (let i = 0; i < bulkOps.length; i += batchSize) {
      const batch = bulkOps.slice(i, i + batchSize);
      await Product.bulkWrite(batch);
      console.log(`Processed ${i + batch.length} of ${bulkOps.length}`);
    }
    
    console.log('Migration complete!');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
