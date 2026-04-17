const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  // Corporate Transaction IDs
  txId: {
    type: String,
    unique: true,
    default: function() {
      return 'TX-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
  },
  
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  
  status: {
    type: String,
    enum: ['pending', 'escrow', 'completed', 'disputed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  
  escrow: {
    inEscrow: { type: Boolean, default: false },
    releasedAt: { type: Date },
    releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  
  // Refund processing logic
  refund: {
    requested: { type: Boolean, default: false },
    requestedAt: { type: Date },
    reason: { type: String },
    approved: { type: Boolean },
    approvedAt: { type: Date }
  },
  
  downloadToken: { type: String },
  downloadTokenExpires: { type: Date },
  downloadCount: { type: Number, default: 0 },
  
  ipAddress: { type: String },
  userAgent: { type: String },
  
  notes: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', TransactionSchema);
