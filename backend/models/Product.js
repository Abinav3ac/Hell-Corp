const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  assetId: {
    type: String,
    unique: true,
    default: function() {
      return 'HC-ASSET-' + String(Math.floor(Math.random() * 9000) + 1000);
    }
  },
  
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  
  category: {
    type: String,
    enum: ['software', 'hardware', 'service', 'license', 'cloud_node', 'documentation', 'internal_tool', 'proprietary_exploit'],
    required: true
  },
  
  department: { type: String },
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: { type: String },
  
  valuation: {
    baseValue: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    maintenanceCost: { type: Number, default: 0 }
  },
  
  specifications: {
    version: { type: String },
    deploymentDate: { type: Date, default: Date.now },
    lastAudit: { type: Date, default: Date.now },
    operatingSystem: [{ type: String }],
    dependencies: [{ type: String }],
    securityTier: { type: String, enum: ['unclassified', 'internal', 'confidential', 'secret', 'top_secret'] }
  },
  
  content: {
    description: { type: String, required: true },
    fullDocumentation: { type: String },
    technicalSpecifications: { type: String },
    changeLog: { type: String }
  },
  
  attachments: [{
    filename: { type: String },
    originalName: { type: String },
    size: { type: Number },
    mimeType: { type: String },
    uploadDate: { type: Date, default: Date.now },
    storageKey: { type: String }
  }],
  
  usageStats: {
    activeUsers: { type: Number, default: 0 },
    accessCount: { type: Number, default: 0 },
    incidentCount: { type: Number, default: 0 },
    healthRating: { type: Number, default: 100 }
  },
  
  status: {
    type: String,
    enum: ['active', 'decommissioned', 'under_review', 'maintenance', 'draft'],
    default: 'active'
  },
  
  governance: {
    internalNotes: { type: String },
    complianceFlags: [{ type: String }],
    authorizedGroups: [{ type: String }]
  },
  
  isManaged: { type: Boolean, default: true },
  isMissionCritical: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

AssetSchema.index({ category: 1, status: 1 });
AssetSchema.index({ name: 'text', 'content.description': 'text' });

module.exports = mongoose.model('Product', AssetSchema);
