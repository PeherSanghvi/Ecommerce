const { fullReindex } = require('../services/orderSyncService');
const { recreateIndex } = require('../config/opensearchIndex');

/**
 * Admin Controller
 * 
 * Handles admin-only operations like reindexing
 */

async function reindexController(req, res) {
  try {
    // Recreate the index
    await recreateIndex();
    
    // Perform full reindex
    const count = await fullReindex();
    
    res.status(200).json({
      success: true,
      reindexed: count,
      message: `Successfully reindexed ${count} orders`
    });

  } catch (error) {
    console.error('Error in reindexController:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  reindexController
};
