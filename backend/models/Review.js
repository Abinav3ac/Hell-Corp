const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewerName: { type: String },
  
  rating: { type: Number, min: 1, max: 5, required: true },
  
  title: { type: String },
  content: { type: String, required: true },
  
  isVerifiedPurchase: { type: Boolean, default: false },
  
  upvotes: { type: Number, default: 0 },
  isHidden: { type: Boolean, default: false },
  adminNote: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', ReviewSchema);
