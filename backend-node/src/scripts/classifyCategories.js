require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const hierarchy = {
  'Dresses': [/dress/i],
  'Outerwear': [/jacket/i, /coat/i, /blazer/i, /shacket/i, /parka/i, /gilet/i, /puffer/i],
  'Knitwear': [/cardigan/i, /jumper/i, /sweater/i, /knit/i, /cardi/i],
  'Bottoms': [/jeans/i, /trouser/i, /jogger/i, /skirt/i, /pants/i, /shorts/i],
  'Lingerie & Swimwear': [/thong/i, /bra/i, /bikini/i, /beach/i, /body/i, /swimsuit/i, /suspender/i, /briefs/i],
  'Tops': [/t-shirt/i, /shirt/i, /blouse/i, /cami/i, /corset/i, /top/i, /vest/i, /tee/i, /bandeau/i],
  'Activewear': [/active/i, /training/i, /sport/i, /gym/i],
  'Accessories': [/scarf/i, /bag/i, /hat/i, /mask/i],
  'Co-ords & Sets': [/set/i, /co-ord/i, /pyjama/i]
};

function classify(title) {
  for (const [cat, regexes] of Object.entries(hierarchy)) {
    if (regexes.some(r => r.test(title))) {
      return { primary: 'Fashion', secondary: cat };
    }
  }
  return { primary: 'Fashion', secondary: 'Other' };
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecom');
  const products = await Product.find({}).lean();
  
  const counts = {};
  
  for (const p of products) {
    const { primary, secondary } = classify(p.title);
    if (!counts[primary]) counts[primary] = {};
    counts[primary][secondary] = (counts[primary][secondary] || 0) + 1;
  }
  
  console.log(JSON.stringify(counts, null, 2));
  process.exit(0);
}

run().catch(console.error);
