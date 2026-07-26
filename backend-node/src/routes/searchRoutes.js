const express = require('express');
const router = express.Router();
const { validateSearchRequest } = require('../validators/searchValidator');
const { searchOrdersController } = require('../controllers/searchController');
const { isAdmin } = require('../middleware/authMiddleware');

/**
 * Search Routes
 * 
 * POST /api/search/orders - Search orders with OpenSearch
 */

router.post('/orders', isAdmin, validateSearchRequest, searchOrdersController);

module.exports = router;
