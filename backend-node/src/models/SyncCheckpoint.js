const mongoose = require('mongoose');

/**
 * SyncCheckpoint Model
 * 
 * DESIGN DECISIONS:
 * 
 * 1. RESUME TOKEN PERSISTENCE:
 *    - Stores the MongoDB Change Stream resume token
 *    - Allows the worker to resume from where it left off after restart
 *    - Prevents duplicate processing of change events
 * 
 * 2. SINGLE DOCUMENT:
 *    - Uses a fixed ID for the orders change stream checkpoint
 *    - Only one document needed per change stream
 *    - Simplifies retrieval and updates
 * 
 * 3. TIMESTAMP:
 *    - Tracks when the checkpoint was last updated
 *    - Useful for monitoring and debugging
 */

const syncCheckpointSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      comment: 'Fixed ID for the change stream (e.g., "orders_change_stream")'
    },
    resumeToken: {
      type: String,
      required: true,
      comment: 'Serialized MongoDB Change Stream resume token (JSON)'
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      comment: 'Last update timestamp'
    }
  },
  {
    collection: 'sync_checkpoints',
    timestamps: false
  }
);

const SyncCheckpoint = mongoose.model('SyncCheckpoint', syncCheckpointSchema);

module.exports = SyncCheckpoint;
