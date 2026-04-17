const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  threadId: { type: String },
  
  subject: { type: String },
  content: { type: String, required: true },
  
  isRead: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  isEncrypted: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);
