const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewerName: { type: String },
  
  rating: { type: Number, min: 1, max: 5, required: true },
  
  // INTENTIONAL VULN C1: Blind XSS via review content
  title: { type: String },
  content: { type: String, required: true },
  
  // INTENTIONAL VULN A5: Any user can mark verified without owning product
  isVerifiedPurchase: { type: Boolean, default: false },
  
  upvotes: { type: Number, default: 0 },
  isHidden: { type: Boolean, default: false },
  adminNote: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', ReviewSchema);
