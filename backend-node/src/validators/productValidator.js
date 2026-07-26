/**
 * Product Query Parameter Validator
 * 
 * Validates and sanitizes query parameters for the products endpoint.
 * Ensures only valid values are passed to the service layer.
 */

/**
 * Validate page parameter
 */
function validatePage(page) {
  const pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    return 1; // Default to page 1
  }
  return pageNum;
}

/**
 * Validate limit parameter
 */
function validateLimit(limit) {
  const limitNum = parseInt(limit, 10);
  if (isNaN(limitNum) || limitNum < 1) {
    return 10; // Default to 10 items per page
  }
  if (limitNum > 100) {
    return 100; // Maximum 100 items per page
  }
  return limitNum;
}

/**
 * Validate sort parameter
 */
function validateSort(sort) {
  const validSorts = ['price_asc', 'price_desc', 'title_asc', 'title_desc', 'newest'];
  if (!sort || !validSorts.includes(sort)) {
    return 'newest'; // Default sort
  }
  return sort;
}

/**
 * Validate category parameter
 */
function validateCategory(category) {
  if (!category || typeof category !== 'string') {
    return null;
  }
  return category.trim();
}

/**
 * Validate search parameter
 */
function validateSearch(search) {
  if (!search || typeof search !== 'string') {
    return null;
  }
  return search.trim();
}

/**
 * Validate all product query parameters
 */
function validateProductQuery(req, res, next) {
  const { page, limit, sort, category, search } = req.query;

  req.validatedQuery = {
    page: validatePage(page),
    limit: validateLimit(limit),
    sort: validateSort(sort),
    category: validateCategory(category),
    search: validateSearch(search)
  };

  next();
}

module.exports = {
  validateProductQuery
};
