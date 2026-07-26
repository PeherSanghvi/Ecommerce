/**
 * Search Request Validator
 * 
 * Validates query or body parameters for order search
 */

function validateSearchRequest(req, res, next) {
  // Accept parameters from both query string and request body
  const params = { ...req.query, ...req.body };
  
  const { keyword, status, dateFrom, dateTo, minAmount, maxAmount, customerName, productTitle, page, size, sortBy, sortDir } = params;

  // Validate page
  if (page !== undefined) {
    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page parameter'
      });
    }
    req.validatedPage = pageNum;
  } else {
    req.validatedPage = 0;
  }

  // Validate size
  if (size !== undefined) {
    const sizeNum = parseInt(size, 10);
    if (isNaN(sizeNum) || sizeNum < 1 || sizeNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid size parameter (must be between 1 and 100)'
      });
    }
    req.validatedSize = sizeNum;
  } else {
    req.validatedSize = 20;
  }

  // Validate sortBy
  const allowedSortFields = ['order_date', 'total_minor', 'status', 'created_at'];
  if (sortBy && !allowedSortFields.includes(sortBy)) {
    return res.status(400).json({
      success: false,
      error: `Invalid sortBy. Allowed values: ${allowedSortFields.join(', ')}`
    });
  }
  req.validatedSortBy = sortBy || 'order_date';

  // Validate sortDir
  if (sortDir && sortDir !== 'asc' && sortDir !== 'desc') {
    return res.status(400).json({
      success: false,
      error: 'Invalid sortDir. Must be "asc" or "desc"'
    });
  }
  req.validatedSortDir = sortDir || 'desc';

  // Validate status
  const allowedStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'PROCESSING'];
  if (status && !allowedStatuses.includes(status.toUpperCase())) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
    });
  }
  req.validatedStatus = status ? status.toUpperCase() : null;

  // Validate dateFrom
  if (dateFrom) {
    const dateFromDate = new Date(dateFrom);
    if (isNaN(dateFromDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid dateFrom format'
      });
    }
    req.validatedDateFrom = dateFromDate;
  }

  // Validate dateTo
  if (dateTo) {
    const dateToDate = new Date(dateTo);
    if (isNaN(dateToDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid dateTo format'
      });
    }
    req.validatedDateTo = dateToDate;
  }

  // Validate minAmount
  if (minAmount !== undefined) {
    const minAmountNum = parseInt(minAmount, 10);
    if (isNaN(minAmountNum) || minAmountNum < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid minAmount'
      });
    }
    req.validatedMinAmount = minAmountNum;
  }

  // Validate maxAmount
  if (maxAmount !== undefined) {
    const maxAmountNum = parseInt(maxAmount, 10);
    if (isNaN(maxAmountNum) || maxAmountNum < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid maxAmount'
      });
    }
    req.validatedMaxAmount = maxAmountNum;
  }

  // Store string parameters
  req.validatedKeyword = keyword || null;
  req.validatedCustomerName = customerName || null;
  req.validatedProductTitle = productTitle || null;

  next();
}

module.exports = {
  validateSearchRequest
};
