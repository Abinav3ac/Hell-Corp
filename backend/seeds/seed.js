require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Product = require('../models/Product');
const ForumPost = require('../models/Forum');
const Review = require('../models/Review');
const Transaction = require('../models/Transaction');
const Message = require('../models/Message');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hellcorp_enterprise';

// FLAGS (CTF)
// Node Flags: HC{br0k3n_rbac_2024}, HC{l34ky_m3m0ry_42}, HC{cl0ud_pr0xy_f41l}

const USERS = [
  { username: 'ceo_hellcorp', email: 'v.hell@hellcorp.com', password: 'Password123!', role: 'super_admin', profile: { fullName: 'Victor Hell', jobTitle: 'CEO', department: 'Executive' }, systemMetadata: { adminNotes: 'Flag 1: HC{f1rst_st3p_cl34r}' } },
  { username: 'admin_sys', email: 'sysadmin@hellcorp.com', password: 'AdminPassword!', role: 'admin', profile: { fullName: 'Systems Admin', jobTitle: 'IT Manager', department: 'IT' } },
  { username: 'regional_mgr_east', email: 'east.mgr@hellcorp.com', password: 'EastPassword!', role: 'regional_manager', profile: { fullName: 'Regional Manager East', department: 'Management' } },
  { username: 'hr_lead', email: 'hr.lead@hellcorp.com', password: 'HRPassword!', role: 'manager', profile: { fullName: 'HR Lead', jobTitle: 'HR Director', department: 'HR' } },
  { username: 'finance_controller', email: 'finance@hellcorp.com', password: 'FinancePassword!', role: 'manager', profile: { fullName: 'Finance Controller', department: 'Finance' }, wallet: { balance: 1500000 } },
];

// Generate 50+ employees
for (let i = 1; i <= 50; i++) {
  USERS.push({
    username: `employee_${i}`,
    email: `employee_${i}@hellcorp.com`,
    password: `EmployeePassword${i}!`,
    role: i % 10 === 0 ? 'manager' : 'employee',
    profile: {
      fullName: `Employee ${i}`,
      department: ['IT', 'HR', 'Finance', 'R&D', 'Sales'][i % 5],
      jobTitle: ['Engineer', 'Associate', 'Analyst', 'Specialist'][i % 4]
    },
    wallet: { balance: Math.floor(Math.random() * 5000) + 1000 }
  });
}

const ASSETS = [
  {
    name: 'Hellcorp Core Firewall Config',
    category: 'internal_tool',
    valuation: { baseValue: 50000 },
    specifications: { securityTier: 'secret' },
    content: { description: 'Primary firewall configuration for Hellcorp headquarters.', fullDocumentation: 'Flag 2: HC{n0tw0rk_pwn3d_99}' }
  },
  {
    name: 'AI Risk Predictor v4',
    category: 'software',
    valuation: { baseValue: 120000 },
    specifications: { securityTier: 'confidential' },
    content: { description: 'Predictive analytics for market risk.' }
  },
  {
    name: 'Legacy Wiki Database',
    category: 'documentation',
    valuation: { baseValue: 10000 },
    specifications: { securityTier: 'internal' },
    content: { description: 'Historic wiki records.' }
  }
];

// Add more assets
for (let i = 1; i <= 30; i++) {
  ASSETS.push({
    name: `Corporate Asset ${i}`,
    category: ['software', 'hardware', 'service', 'license'][i % 4],
    valuation: { baseValue: Math.floor(Math.random() * 20000) + 5000 },
    specifications: { securityTier: i % 5 === 0 ? 'secret' : 'internal' },
    content: { description: `Description for corporate asset ${i}` }
  });
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('[HELLCORP ENTERPRISE SEED] Connected to MongoDB');
  
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    ForumPost.deleteMany({}),
    Transaction.deleteMany({}),
    Message.deleteMany({})
  ]);
  
  const createdUsers = [];
  for (const userData of USERS) {
    const user = new User(userData);
    await user.save();
    createdUsers.push(user);
    console.log(`[+] User created: ${user.username}`);
  }
  
  for (const assetData of ASSETS) {
    const owner = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const asset = new Product({
      ...assetData,
      owner: owner._id,
      ownerName: owner.username,
      slug: assetData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    });
    await asset.save();
    console.log(`[+] Asset created: ${asset.name}`);
  }
  
  console.log('[SEED COMPLETE]');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
