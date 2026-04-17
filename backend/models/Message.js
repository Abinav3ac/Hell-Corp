const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // INTENTIONAL VULN A1: IDOR - messages accessible by ID without auth check
  threadId: { type: String },
  
  // INTENTIONAL VULN C1: XSS in messages
  subject: { type: String },
  content: { type: String, required: true },
  
  isRead: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  isEncrypted: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);
