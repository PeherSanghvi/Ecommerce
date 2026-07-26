require('dotenv').config();
const { connectToDatabase, closeDatabaseConnection } = require('../config/database');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

/**
 * Multi-Category Seeding Script
 * 1. Categorizes existing Fashion products properly
 * 2. Fetches Electronics from DummyJSON
 * 3. Seeds Beauty and Home products
 * 4. Preserves all Fashion products
 */

// Fashion keyword mappings
const fashionMappings = {
  'Tops': ['top', 'shirt', 'blouse', 'sweater', 'hoodie', 'tank', 'tee', 't-shirt', 'crop', 'vest'],
  'Dresses': ['dress', 'gown', 'midi'],
  'Jeans': ['jeans', 'denim'],
  'Shoes': ['shoe', 'sneaker', 'boot', 'heel', 'loafer', 'sandal', 'slipper', 'trainer'],
  'Accessories': ['accessories', 'scarf', 'belt', 'hat', 'bag', 'purse', 'wallet', 'watch'],
  'Trousers': ['trouser', 'pant', 'slack', 'jogger', 'legging', 'flare'],
  'Coats': ['coat', 'jacket', 'blazer', 'cardigan', 'parka']
};

function categorizeProduct(title) {
  const titleLower = title.toLowerCase();
  for (const [subCat, keywords] of Object.entries(fashionMappings)) {
    for (const keyword of keywords) {
      if (titleLower.includes(keyword)) {
        return subCat;
      }
    }
  }
  return 'Accessories'; // Default
}

async function categorizeFashionProducts() {
  console.log('\n📦 Step 1: Categorizing existing Fashion products...');
  try {
    const fashionProducts = await Product.find({ active: true });
    console.log(`Found ${fashionProducts.length} products to categorize`);

    let updated = 0;
    const subCategoryCounts = {};

    for (const product of fashionProducts) {
      const subCategory = categorizeProduct(product.title);
      subCategoryCounts[subCategory] = (subCategoryCounts[subCategory] || 0) + 1;

      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            primaryCategory: 'Fashion',
            subCategory: subCategory
          }
        }
      );
      updated++;
    }

    console.log(`✓ Categorized ${updated} Fashion products`);
    console.log('Fashion subcategory distribution:');
    Object.entries(subCategoryCounts).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });

    return updated;
  } catch (error) {
    console.error('✗ Error categorizing fashion:', error.message);
    return 0;
  }
}

async function fetchElectronicsProducts() {
  console.log('\n📦 Step 2: Fetching Electronics products from DummyJSON...');
  try {
    const response = await fetch('https://dummyjson.com/products?limit=100');
    const data = await response.json();
    const dummyProducts = data.products || [];
    console.log(`✓ Fetched ${dummyProducts.length} products from DummyJSON`);

    const processedProducts = dummyProducts.map((p, idx) => {
      // Determine subcategory based on product category
      let subCategory = 'Accessories';
      const category = p.category?.toLowerCase() || '';
      
      if (category.includes('phone') || category.includes('mobile')) subCategory = 'Smartphones';
      else if (category.includes('laptop') || category.includes('computer')) subCategory = 'Laptops';
      else if (category.includes('headphone') || category.includes('audio')) subCategory = 'Headphones';
      else if (category.includes('watch') || category.includes('wearable')) subCategory = 'Smart Watches';
      else if (category.includes('camera') || category.includes('photo')) subCategory = 'Cameras';

      return {
        sku: `ELEC-${Date.now()}-${idx}`,
        title: p.title,
        description: p.description || JSON.stringify([{ 'Product Details': p.description || '' }]),
        category: p.category,
        primaryCategory: 'Electronics',
        subCategory: subCategory,
        brand: p.brand || 'Generic',
        price_minor: Math.round((p.price || 0) * 100),
        currency: 'USD',
        stock: Math.floor(Math.random() * 100) + 10,
        active: true,
        images: [p.thumbnail || p.image || 'https://via.placeholder.com/400'],
        rating: p.rating || parseFloat((Math.random() * 2 + 3).toFixed(1)),
        reviewsCount: p.reviews?.length || Math.floor(Math.random() * 200),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    return processedProducts;
  } catch (error) {
    console.error('✗ Error fetching electronics:', error.message);
    return [];
  }
}

function generateBeautyProducts() {
  console.log('\n📦 Step 3: Generating Beauty products...');
  
  const beautyBrands = ['Maybelline', 'MAC', 'Sephora', 'Charlotte Tilbury', 'Urban Decay'];
  const skincareTitles = ['Hydrating Face Cream', 'Anti-Aging Serum', 'Gentle Cleanser', 'Night Moisturizer', 'Eye Contour'];
  const makeupTitles = ['Matte Lipstick', 'HD Foundation', 'Eyeshadow Palette', 'Mascara Black', 'Contour Kit'];
  const haircoreTitles = ['Volumizing Shampoo', 'Repair Conditioner', 'Hair Oil', 'Styling Gel', 'Deep Mask'];
  
  const beautyCategories = {
    'Skincare': skincareTitles,
    'Makeup': makeupTitles,
    'Haircare': haircoreTitles
  };

  let products = [];
  let idx = 0;

  for (const [subCat, titles] of Object.entries(beautyCategories)) {
    for (let i = 0; i < 5; i++) {
      const title = titles[i % titles.length];
      const brand = beautyBrands[i % beautyBrands.length];
      
      products.push({
        sku: `BEAUTY-${Date.now()}-${idx}`,
        title: `${brand} ${title}`,
        description: JSON.stringify([{ 'Product Details': `Premium ${subCat.toLowerCase()} product by ${brand}` }]),
        category: 'Beauty',
        primaryCategory: 'Beauty',
        subCategory: subCat,
        brand: brand,
        price_minor: Math.round(Math.random() * 5000) + 1500,
        currency: 'USD',
        stock: Math.floor(Math.random() * 80) + 20,
        active: true,
        images: ['https://via.placeholder.com/400?text=Beauty'],
        rating: parseFloat((Math.random() * 2 + 3.5).toFixed(1)),
        reviewsCount: Math.floor(Math.random() * 300),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      idx++;
    }
  }

  console.log(`✓ Generated ${products.length} Beauty products`);
  return products;
}

function generateHomeProducts() {
  console.log('\n📦 Step 4: Generating Home products...');
  
  const homeBrands = ['IKEA', 'West Elm', 'Restoration Hardware', 'Article', 'Room & Board'];
  const categories = {
    'Furniture': ['Modern Sofa', 'Dining Table', 'Bookshelf', 'Bed Frame', 'Office Chair'],
    'Decor': ['Wall Art', 'Throw Pillow', 'Mirror', 'Rug', 'Lamp'],
    'Kitchen': ['Cookware Set', 'Coffee Maker', 'Blender', 'Knife Set', 'Baking Pan'],
    'Bedding': ['Sheet Set', 'Comforter', 'Pillowcase', 'Duvet Cover', 'Mattress Pad'],
    'Lighting': ['Ceiling Lamp', 'Table Light', 'Desk Lamp', 'Wall Sconce', 'Floor Light']
  };

  let products = [];
  let idx = 0;

  for (const [subCat, titles] of Object.entries(categories)) {
    for (let i = 0; i < 4; i++) {
      const title = titles[i % titles.length];
      const brand = homeBrands[i % homeBrands.length];
      
      products.push({
        sku: `HOME-${Date.now()}-${idx}`,
        title: `${brand} ${title}`,
        description: JSON.stringify([{ 'Product Details': `Quality ${subCat.toLowerCase()} for your home by ${brand}` }]),
        category: 'Home',
        primaryCategory: 'Home',
        subCategory: subCat,
        brand: brand,
        price_minor: Math.round(Math.random() * 50000) + 5000,
        currency: 'USD',
        stock: Math.floor(Math.random() * 60) + 15,
        active: true,
        images: ['https://via.placeholder.com/400?text=Home'],
        rating: parseFloat((Math.random() * 2 + 3.5).toFixed(1)),
        reviewsCount: Math.floor(Math.random() * 400),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      idx++;
    }
  }

  console.log(`✓ Generated ${products.length} Home products`);
  return products;
}

async function seedMultipleCategories() {
  try {
    await connectToDatabase();
    console.log('✓ Connected to MongoDB');
    console.log('=== MULTI-CATEGORY SEEDING ===');

    // Step 1: Categorize existing Fashion products
    const fashionUpdated = await categorizeFashionProducts();

    // Step 2: Fetch and add Electronics
    const electronicsProducts = await fetchElectronicsProducts();
    if (electronicsProducts.length > 0) {
      await Product.insertMany(electronicsProducts);
      console.log(`✓ Inserted ${electronicsProducts.length} Electronics products`);
    }

    // Step 3: Generate and add Beauty
    const beautyProducts = generateBeautyProducts();
    if (beautyProducts.length > 0) {
      await Product.insertMany(beautyProducts);
      console.log(`✓ Inserted ${beautyProducts.length} Beauty products`);
    }

    // Step 4: Generate and add Home
    const homeProducts = generateHomeProducts();
    if (homeProducts.length > 0) {
      await Product.insertMany(homeProducts);
      console.log(`✓ Inserted ${homeProducts.length} Home products`);
    }

    // Summary
    console.log('\n=== SEEDING COMPLETE ===');
    const totalFinal = await Product.countDocuments({ active: true });
    console.log(`\nTotal active products: ${totalFinal}`);

    const stats = await Product.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: '$primaryCategory',
          count: { $sum: 1 },
          subcats: { $addToSet: '$subCategory' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('\nFinal category distribution:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} products (${stat.subcats.sort().join(', ')})`);
    });

    console.log('\n✓ All categories seeded successfully!');

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

seedMultipleCategories();
