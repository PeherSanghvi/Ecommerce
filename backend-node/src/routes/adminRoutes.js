const express = require('express');
const router = express.Router();
const { reindexController } = require('../controllers/adminController');
const { isAdmin } = require('../middleware/authMiddleware');

/**
 * Admin Routes
 * 
 * POST /api/admin/reindex - Trigger full reindex of orders to OpenSearch
 */

router.post('/reindex', isAdmin, reindexController);

module.exports = router;
