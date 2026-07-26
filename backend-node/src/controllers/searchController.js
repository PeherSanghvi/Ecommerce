const { searchOrders } = require('../services/searchService');

/**
 * Search Controller
 * 
 * Handles HTTP requests for order search
 */

async function searchOrdersController(req, res) {
  try {
    const params = {
      keyword: req.validatedKeyword,
      status: req.validatedStatus,
      dateFrom: req.validatedDateFrom,
      dateTo: req.validatedDateTo,
      minAmount: req.validatedMinAmount,
      maxAmount: req.validatedMaxAmount,
      customerName: req.validatedCustomerName,
      productTitle: req.validatedProductTitle,
      page: req.validatedPage,
      size: req.validatedSize,
      sortBy: req.validatedSortBy,
      sortDir: req.validatedSortDir
    };

    const result = await searchOrders(params);

    res.status(200).json(result);

  } catch (error) {
    console.error('Error in searchOrdersController:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  searchOrdersController
};
