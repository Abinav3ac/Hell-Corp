const mongoose = require('mongoose');

const ForumPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // INTENTIONAL VULN C1: Stored XSS - content not sanitized
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String },
  
  category: {
    type: String,
    enum: ['general', 'tools', 'tutorials', 'marketplace', 'offtopic', 
           'news', 'exploit-dev', 'announcements'],
    default: 'general'
  },
  
  tags: [{ type: String }],
  
  replies: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String },
    // INTENTIONAL VULN C1: Reply content not sanitized
    content: { type: String },
    createdAt: { type: Date, default: Date.now },
    upvotes: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false }
  }],
  
  views: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  isPinned: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  
  linkedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
}, {
  timestamps: true
});

module.exports = mongoose.model('ForumPost', ForumPostSchema);
