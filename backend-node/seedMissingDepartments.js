require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const newProducts = [
  // ELECTRONICS
  {
    title: "iPhone 15 Pro Max 256GB",
    description: "The latest flagship smartphone with advanced camera system.",
    department: "Electronics",
    subcategory: "Smartphones",
    price_minor: 119900,
    currency: "USD",
    stock: 50,
    active: true,
    sku: "ELEC-SP-001",
    images: ["https://loremflickr.com/400/400/smartphone,iphone"]
  },
  {
    title: "Samsung Galaxy S24 Ultra",
    description: "Android flagship with AI features and S-Pen.",
    department: "Electronics",
    subcategory: "Smartphones",
    price_minor: 129900,
    currency: "USD",
    stock: 30,
    active: true,
    sku: "ELEC-SP-002",
    images: ["https://loremflickr.com/400/400/smartphone,samsung"]
  },
  {
    title: "MacBook Pro 16-inch M3 Max",
    description: "Powerful laptop for professionals.",
    department: "Electronics",
    subcategory: "Laptops",
    price_minor: 349900,
    currency: "USD",
    stock: 15,
    active: true,
    sku: "ELEC-LT-001",
    images: ["https://loremflickr.com/400/400/laptop,macbook"]
  },
  {
    title: "LG OLED evo C3 65 inch 4K Smart TV",
    description: "Stunning OLED picture quality and smart features.",
    department: "Electronics",
    subcategory: "TVs",
    price_minor: 169900,
    currency: "USD",
    stock: 20,
    active: true,
    sku: "ELEC-TV-001",
    images: ["https://loremflickr.com/400/400/television"]
  },
  {
    title: "Sony WH-1000XM5 Wireless Noise Canceling",
    description: "Industry leading noise cancellation headphones.",
    department: "Electronics",
    subcategory: "Headphones",
    price_minor: 39800,
    currency: "USD",
    stock: 100,
    active: true,
    sku: "ELEC-HP-001",
    images: ["https://loremflickr.com/400/400/headphones"]
  },
  {
    title: "Apple Watch Series 9",
    description: "Advanced health tracking smartwatch.",
    department: "Electronics",
    subcategory: "Smartwatches",
    price_minor: 39900,
    currency: "USD",
    stock: 75,
    active: true,
    sku: "ELEC-SW-001",
    images: ["https://loremflickr.com/400/400/smartwatch"]
  },
  {
    title: "Anker 737 Power Bank (PowerCore 24K)",
    description: "Ultra-powerful portable charger.",
    department: "Electronics",
    subcategory: "Accessories",
    price_minor: 14900,
    currency: "USD",
    stock: 120,
    active: true,
    sku: "ELEC-ACC-001",
    images: ["https://loremflickr.com/400/400/powerbank"]
  },

  // HOME & GARDEN
  {
    title: "Mid-Century Modern Sofa",
    description: "Comfortable and stylish 3-seater sofa.",
    department: "Home & Garden",
    subcategory: "Furniture",
    price_minor: 89900,
    currency: "USD",
    stock: 10,
    active: true,
    sku: "HOME-FURN-001",
    images: ["https://loremflickr.com/400/400/sofa,furniture"]
  },
  {
    title: "Ninja Foodi 10-in-1 Pressure Cooker",
    description: "Versatile kitchen appliance for all cooking needs.",
    department: "Home & Garden",
    subcategory: "Kitchen",
    price_minor: 19900,
    currency: "USD",
    stock: 45,
    active: true,
    sku: "HOME-KIT-001",
    images: ["https://loremflickr.com/400/400/kitchen,cooker"]
  },
  {
    title: "Ceramic Minimalist Vase Set",
    description: "Set of 3 aesthetic ceramic vases for decoration.",
    department: "Home & Garden",
    subcategory: "Home Decor",
    price_minor: 4500,
    currency: "USD",
    stock: 60,
    active: true,
    sku: "HOME-DEC-001",
    images: ["https://loremflickr.com/400/400/vase,decor"]
  },
  {
    title: "Philips Hue White and Color Ambiance Starter Kit",
    description: "Smart lighting starter kit with 4 bulbs and a bridge.",
    department: "Home & Garden",
    subcategory: "Lighting",
    price_minor: 19900,
    currency: "USD",
    stock: 35,
    active: true,
    sku: "HOME-LIG-001",
    images: ["https://loremflickr.com/400/400/lighting,lamp"]
  },
  {
    title: "7-Piece Outdoor Patio Furniture Set",
    description: "Weather-resistant wicker sectional sofa set.",
    department: "Home & Garden",
    subcategory: "Garden",
    price_minor: 69900,
    currency: "USD",
    stock: 5,
    active: true,
    sku: "HOME-GAR-001",
    images: ["https://loremflickr.com/400/400/patio,garden"]
  },

  // BEAUTY
  {
    title: "CeraVe Hydrating Facial Cleanser",
    description: "Gentle daily face wash with ceramides and hyaluronic acid.",
    department: "Beauty",
    subcategory: "Skincare",
    price_minor: 1599,
    currency: "USD",
    stock: 200,
    active: true,
    sku: "BEAU-SKI-001",
    images: ["https://loremflickr.com/400/400/skincare,bottle"]
  },
  {
    title: "Charlotte Tilbury Pillow Talk Lipstick",
    description: "Iconic matte revolution lipstick.",
    department: "Beauty",
    subcategory: "Makeup",
    price_minor: 3400,
    currency: "USD",
    stock: 85,
    active: true,
    sku: "BEAU-MAK-001",
    images: ["https://loremflickr.com/400/400/lipstick,makeup"]
  },
  {
    title: "Chanel Coco Mademoiselle Eau de Parfum",
    description: "Classic floral amber fragrance for women.",
    department: "Beauty",
    subcategory: "Fragrances",
    price_minor: 13500,
    currency: "USD",
    stock: 25,
    active: true,
    sku: "BEAU-FRA-001",
    images: ["https://loremflickr.com/400/400/perfume"]
  },
  {
    title: "Olaplex No. 7 Bonding Oil",
    description: "Highly concentrated, weightless reparative styling oil.",
    department: "Beauty",
    subcategory: "Hair Care",
    price_minor: 3000,
    currency: "USD",
    stock: 150,
    active: true,
    sku: "BEAU-HAI-001",
    images: ["https://loremflickr.com/400/400/haircare,oil"]
  },
  {
    title: "Oral-B iO Series 9 Electric Toothbrush",
    description: "Advanced electric toothbrush with 3D teeth tracking.",
    department: "Beauty",
    subcategory: "Personal Care",
    price_minor: 29900,
    currency: "USD",
    stock: 40,
    active: true,
    sku: "BEAU-PER-001",
    images: ["https://loremflickr.com/400/400/toothbrush"]
  }
];

async function seedMissingDepartments() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    let addedCount = 0;

    for (const product of newProducts) {
      // Check if product already exists by SKU to ensure idempotency
      const existing = await Product.findOne({ sku: product.sku });
      if (!existing) {
        await Product.create(product);
        addedCount++;
        console.log(`Added: ${product.title}`);
      } else {
        console.log(`Skipped existing SKU: ${product.sku}`);
      }
    }

    console.log(`\nSeed complete. Added ${addedCount} products.`);
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedMissingDepartments();
