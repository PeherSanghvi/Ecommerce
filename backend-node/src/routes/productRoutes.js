const express = require('express');
const router = express.Router();
const { validateProductQuery } = require('../validators/productValidator');
const { getProductsController, getCategoriesController, getCategoriesHierarchyController, getProductController } = require('../controllers/productController');

/**
 * Product Routes
 * 
 * Defines all product-related endpoints.
 * Applies validation middleware before controller.
 */

/**
 * GET /api/products/categories/hierarchy
 * 
 * Retrieve hierarchical categories with subcategories from active products.
 * 
 * Response:
 * {
 *   success: true,
 *   data: [
 *     { name: "Electronics", subcategories: ["Smartphones", "Laptops", ...] },
 *     { name: "Fashion", subcategories: ["Tops", "Dresses", ...] },
 *     ...
 *   ]
 * }
 */
router.get('/categories/hierarchy', getCategoriesHierarchyController);

/**
 * GET /api/products/categories
 * 
 * Retrieve all unique categories from active products.
 * 
 * Response:
 * {
 *   success: true,
 *   data: ["Accessories", "Dresses", "Shoes", "Tops", ...]
 * }
 */
router.get('/categories', getCategoriesController);

/**
 * GET /api/products/:id
 * 
 * Retrieve a single product by ID.
 * 
 * Response:
 * {
 *   success: true,
 *   data: { _id, title, description, price_minor, ... }
 * }
 */
router.get('/:id', getProductController);

/**
 * GET /api/products
 * 
 * Retrieve products with filtering, sorting, and pagination.
 * 
 * Query Parameters:
 * - page: Page number (default: 1, min: 1)
 * - limit: Items per page (default: 10, min: 1, max: 100)
 * - category: Filter by primary or sub category
 * - primaryCategory: Filter by primary category
 * - subCategory: Filter by sub category
 * - search: Search by title (case-insensitive)
 * - sort: Sort order (price_asc, price_desc, title_asc, title_desc, newest)
 * 
 * Response:
 * {
 *   success: true,
 *   data: [...products],
 *   pagination: {
 *     page: 1,
 *     limit: 10,
 *     totalItems: 200,
 *     totalPages: 20,
 *     hasNext: true,
 *     hasPrevious: false
 *   }
 * }
 */
router.get('/', validateProductQuery, getProductsController);

module.exports = router;
