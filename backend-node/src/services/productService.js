const Product = require('../models/Product');

/**
 * ProductService
 * 
 * Handles business logic for product queries.
 * Builds MongoDB queries based on validated parameters.
 * 
 * DESIGN DECISIONS:
 * 
 * 1. QUERY BUILDING:
 *    - Separates query construction from controller logic
 *    - Makes the code testable and reusable
 *    - Centralizes filtering and sorting logic
 * 
 * 2. PROJECTION:
 *    - Returns only necessary fields to reduce payload size
 *    - Improves network performance and reduces bandwidth
 *    - Excludes internal fields like __v and full images array
 * 
 * 3. INDEX USAGE:
 *    - Current indexes: { active: 1, title: 1 }, { sku: 1 }
 *    - The active filter will use the compound index
 *    - Text search would benefit from a text index on title
 *    - Category filtering would benefit from a category index
 *    - RECOMMENDED: Add text index on title for search, index on category
 */

/**
 * Build MongoDB filter based on query parameters
 */
function buildFilter(query) {
  const filter = { active: true };

  // Filter by department or subcategory
  if (query.department) {
    filter.department = { $regex: new RegExp(`^${query.department}$`, 'i') };
  }
  if (query.subcategory) {
    filter.subcategory = { $regex: new RegExp(`^${query.subcategory}$`, 'i') };
  }

  // Filter by generic category (backward compatibility)
  if (query.category) {
    filter.category = { $regex: query.category, $options: 'i' };
  } else {
    if (query.primaryCategory) {
      filter.category = { $regex: query.primaryCategory, $options: 'i' };
    }
    if (query.subCategory) {
      filter.category = { $regex: query.subCategory, $options: 'i' };
    }
  }

  // Add search filter if provided (case-insensitive title search)
  if (query.search) {
    filter.title = { $regex: query.search, $options: 'i' };
  }

  return filter;
}

/**
 * Build MongoDB sort based on sort parameter
 */
function buildSort(sort) {
  const sortMap = {
    'price_asc': { price_minor: 1 },
    'price_desc': { price_minor: -1 },
    'title_asc': { title: 1 },
    'title_desc': { title: -1 },
    'newest': { created_at: -1 }
  };

  return sortMap[sort] || { created_at: -1 };
}

/**
 * Build projection to return only necessary fields
 */
function buildProjection() {
  return {
    _id: 1,
    title: 1,
    description: 1,
    price_minor: 1,
    currency: 1,
    stock: 1,
    category: 1,
    primaryCategory: 1,
    subCategory: 1,
    department: 1,
    subcategory: 1,
    brand: 1,
    thumbnail: { $arrayElemAt: ['$images', 0] } // Get first image as thumbnail
  };
}

/**
 * Calculate pagination metadata
 */
function calculatePagination(totalItems, page, limit) {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1
  };
}

/**
 * Get products with filtering, sorting, and pagination
 */
async function getProducts(query) {
  try {
    // Build filter, sort, and projection
    const filter = buildFilter(query);
    const sort = buildSort(query.sort);
    const projection = buildProjection();

    // Get total count for pagination
    const totalItems = await Product.countDocuments(filter);

    // Skip and limit for pagination
    const skip = (query.page - 1) * query.limit;

    // Execute query
    const products = await Product
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .select(projection)
      .lean();

    // Calculate pagination metadata
    const pagination = calculatePagination(totalItems, query.page, query.limit);

    return {
      products,
      pagination
    };

  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
}

/**
 * Get flat list of all unique categories from active products
 * This is the legacy endpoint - kept for backward compatibility
 */
async function getCategories() {
  try {
    const categories = await Product.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: null,
          categories: {
            $addToSet: {
              $cond: [
                { $and: [{ $ne: ["$category", null] }, { $ne: ["$category", ""] }] },
                "$category",
                null
              ]
            }
          }
        }
      }
    ]);

    if (categories.length === 0 || !categories[0].categories) {
      return [];
    }

    // Filter out null values and sort
    return categories[0].categories
      .filter(cat => cat && cat.trim().length > 0)
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    throw new Error(`Error fetching categories: ${error.message}`);
  }
}

/**
 * Get hierarchical categories with subcategories
 * Returns ONLY primary categories that have at least one product
 * Sorted alphabetically with product counts
 */
async function getCategoriesHierarchy() {
  try {
    const hierarchy = await Product.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
          subcategories: { $addToSet: "$subcategory" }
        }
      },
      {
        $match: {
          _id: { $ne: null, $ne: "" },
          count: { $gt: 0 } // Only categories with products
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          productCount: "$count",
          subcategories: {
            $filter: {
              input: "$subcategories",
              as: "sub",
              cond: { $and: [{ $ne: ["$$sub", null] }, { $ne: ["$$sub", ""] }] }
            }
          }
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    return hierarchy;
  } catch (error) {
    throw new Error(`Error fetching category hierarchy: ${error.message}`);
  }
}

/**
 * Get a single product by ID
 */
async function getProduct(productId) {
  try {
    const product = await Product.findById(productId)
      .select({
        _id: 1,
        title: 1,
        description: 1,
        price_minor: 1,
        currency: 1,
        stock: 1,
        category: 1,
        department: 1,
        subcategory: 1,
        images: 1,
        brand: 1,
        rating: 1,
        reviewsCount: 1,
        created_at: 1
      })
      .lean();

    return product;
  } catch (error) {
    throw new Error(`Error fetching product: ${error.message}`);
  }
}

module.exports = {
  getProducts,
  getCategories,
  getCategoriesHierarchy,
  getProduct
};
