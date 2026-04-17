const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  
  role: {
    type: String,
    enum: ['employee', 'contractor', 'manager', 'regional_manager', 'admin', 'super_admin'],
    default: 'employee'
  },
  
  profile: {
    fullName: { type: String },
    jobTitle: { type: String },
    department: { type: String },
    avatar: { type: String, default: '/assets/img/default-avatar.png' },
    bio: { type: String, maxlength: 500 },
    country: { type: String },
    timezone: { type: String }
  },
  
  wallet: {
    balance: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  
  systemMetadata: {
    internalTier: { type: String },
    accessControlFlags: { type: [String], default: [] },
    adminNotes: { type: String },
    securityAuditLog: [{ type: String }]
  },
  
  security: {
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLogin: { type: Date },
    lastIp: { type: String }
  },
  
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  suspensionReason: { type: String },
  
  registrationDate: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Advanced Identity Hash Sequence
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 4);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.statics.findByIdentity = async function(id) {
  return this.findOne({ $or: [{ username: id }, { email: id }] });
};

module.exports = mongoose.model('User', UserSchema);

module.exports = mongoose.model('User', UserSchema);
