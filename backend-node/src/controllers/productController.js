const { getProducts, getCategories, getCategoriesHierarchy, getProduct } = require('../services/productService');

/**
 * ProductController
 * 
 * Handles HTTP requests for product endpoints.
 * Delegates business logic to the service layer.
 * 
 * DESIGN DECISIONS:
 * 
 * 1. SEPARATION OF CONCERNS:
 *    - Controller handles HTTP request/response
 *    - Service handles business logic and database queries
 *    - Makes the code testable and maintainable
 * 
 * 2. ERROR HANDLING:
 *    - Catches service layer errors
 *    - Returns appropriate HTTP status codes
 *    - Provides meaningful error messages
 * 
 * 3. RESPONSE FORMAT:
 *    - Consistent JSON response structure
 *    - Includes data and pagination metadata
 *    - Follows REST conventions
 */

/**
 * GET /api/products
 * 
 * Retrieves products with filtering, sorting, and pagination.
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - category: Filter by category
 * - search: Search by title (case-insensitive)
 * - sort: Sort order (price_asc, price_desc, title_asc, title_desc, newest)
 */
async function getProductsController(req, res) {
  try {
    const query = req.validatedQuery;
    const result = await getProducts(query);

    res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error in getProductsController:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * GET /api/products/categories
 * 
 * Retrieves all unique categories from the database (legacy endpoint)
 */
async function getCategoriesController(req, res) {
  try {
    const categories = await getCategories();

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error in getCategoriesController:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * GET /api/products/categories/hierarchy
 * 
 * Retrieves hierarchical categories with subcategories
 * Response: [
 *   { name: "Electronics", subcategories: ["Smartphones", "Laptops", ...] },
 *   { name: "Fashion", subcategories: ["Tops", "Dresses", ...] },
 *   ...
 * ]
 */
async function getCategoriesHierarchyController(req, res) {
  try {
    const hierarchy = await getCategoriesHierarchy();

    res.status(200).json({
      success: true,
      data: hierarchy
    });

  } catch (error) {
    console.error('Error in getCategoriesHierarchyController:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * GET /api/products/:id
 * 
 * Retrieves a single product by ID
 */
async function getProductController(req, res) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    const product = await getProduct(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error in getProductController:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  getProductsController,
  getCategoriesController,
  getCategoriesHierarchyController,
  getProductController
};
