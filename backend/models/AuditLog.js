const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String },
  action: { type: String, required: true },
  resource: { type: String },
  resourceId: { type: String },
  
  details: { type: mongoose.Schema.Types.Mixed },
  
  ipAddress: { type: String },
  userAgent: { type: String },
  method: { type: String },
  path: { type: String },
  statusCode: { type: Number },
  
  severity: {
    type: String,
    enum: ['info', 'warn', 'error', 'critical'],
    default: 'info'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
