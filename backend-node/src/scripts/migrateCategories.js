require('dotenv').config();

const { connectToDatabase, closeDatabaseConnection } = require('../config/database');
const Product = require('../models/Product');

/**
 * Migration script to add primaryCategory and subCategory to existing products
 * Maps fashion terms to Fashion category and electronics terms to Electronics
 */
async function migrateCategories() {
  try {
    await connectToDatabase();
    console.log('✓ Connected to database');

    // Define category mappings
    const categoryMappings = {
      Fashion: {
        subcategories: {
          'Tops': ['top', 'shirt', 'blouse', 'sweater', 'hoodie', 'tank', 'tee', 't-shirt', 'crop'],
          'Dresses': ['dress', 'gown'],
          'Jeans': ['jeans', 'denim'],
          'Shoes': ['shoe', 'sneaker', 'boot', 'heel', 'loafer', 'sandal', 'slipper'],
          'Accessories': ['accessories', 'scarf', 'belt', 'hat', 'bag', 'purse', 'wallet'],
          'Trousers': ['trouser', 'pant', 'slack', 'jogger', 'legging'],
          'Coats': ['coat', 'jacket', 'blazer', 'cardigan', 'vest', 'parka']
        }
      },
      Electronics: {
        subcategories: {
          'Smartphones': ['phone', 'smartphone', 'mobile'],
          'Laptops': ['laptop', 'computer', 'macbook'],
          'Headphones': ['headphone', 'earphone', 'headset', 'airpod', 'earbud'],
          'Smart Watches': ['watch', 'smartwatch'],
          'Cameras': ['camera', 'dslr']
        }
      },
      Home: {
        subcategories: {
          'Furniture': ['furniture', 'sofa', 'chair', 'table', 'desk'],
          'Decor': ['decor', 'decoration', 'wall', 'picture', 'frame'],
          'Kitchen': ['kitchen', 'utensil', 'cookware', 'dish'],
          'Bedding': ['bed', 'pillow', 'sheet', 'blanket', 'duvet'],
          'Lighting': ['light', 'lamp', 'bulb', 'chandelier']
        }
      },
      Beauty: {
        subcategories: {
          'Skincare': ['skincare', 'cream', 'moisturizer', 'serum', 'face wash'],
          'Makeup': ['makeup', 'lipstick', 'foundation', 'mascara', 'eyeshadow'],
          'Haircare': ['haircare', 'shampoo', 'conditioner', 'hair oil'],
          'Fragrances': ['fragrance', 'perfume', 'cologne'],
          'Tools': ['tool', 'brush', 'applicator']
        }
      },
      Sports: {
        subcategories: {
          'Activewear': ['activewear', 'workout', 'gym', 'athletic'],
          'Footwear': ['sports shoe', 'running shoe', 'athletic shoe'],
          'Equipment': ['equipment', 'dumbbell', 'kettlebell', 'mat'],
          'Accessories': ['sports accessories', 'wristband', 'headband'],
          'Outdoor': ['outdoor', 'tent', 'backpack', 'hiking']
        }
      }
    };

    /**
     * Determine primary category and subcategory based on title
     */
    function categorizeProduct(title) {
      const titleLower = title.toLowerCase();

      // Check each primary category
      for (const [primaryCat, data] of Object.entries(categoryMappings)) {
        for (const [subCat, keywords] of Object.entries(data.subcategories)) {
          for (const keyword of keywords) {
            if (titleLower.includes(keyword)) {
              return { primaryCategory: primaryCat, subCategory: subCat };
            }
          }
        }
      }

      // Default to Fashion if not found
      return { primaryCategory: 'Fashion', subCategory: 'Accessories' };
    }

    // Get all products
    const products = await Product.find({});
    console.log(`✓ Found ${products.length} products`);

    let updated = 0;
    const updatePromises = [];

    for (const product of products) {
      // Skip if already has categories
      if (product.primaryCategory && product.subCategory) {
        continue;
      }

      const { primaryCategory, subCategory } = categorizeProduct(product.title);

      updatePromises.push(
        Product.updateOne(
          { _id: product._id },
          {
            $set: {
              primaryCategory,
              subCategory
            }
          }
        )
      );

      updated++;
    }

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(`✓ Updated ${updated} products with categories`);
    } else {
      console.log('✓ All products already have categories');
    }

    console.log('✓ Migration complete');

  } catch (error) {
    console.error('✗ Migration error:', error.message);
    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

migrateCategories();
