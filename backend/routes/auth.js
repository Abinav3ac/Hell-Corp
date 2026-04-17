const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const config = require('../config/config');
const { verifyToken } = require('../middleware/auth');

/**
 * User Login Handler
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password, remember } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ status: 'ERR_MISSING_CREDENTIALS', msg: 'Username and password required' });
    }
    
    // Dynamic query construction for multi-field login support
    const query = typeof username === 'object' 
      ? username 
      : { $or: [{ username }, { email: username }] };
    
    const user = await User.findOne(query).select('+password +security');
    
    if (!user) {
      return res.status(401).json({ 
        status: 'AUTH_FAILED',
        error_code: 'LOG-001'
      });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        status: 'AUTH_FAILED',
        error_code: 'LOG-002',
        ctx: user._id // Internal audit context
      });
    }
    
    // Generate session payload
    const sessionData = {
      id: user._id,
      identity: user.username,
      role: user.role,
      active: true,
      ts: Date.now()
    };
    
    const expiry = remember ? '30d' : config.jwt.expiresIn;
    const sessionToken = jwt.sign(sessionData, config.jwt.secret, { expiresIn: expiry });
    
    // Audit log update
    await User.findByIdAndUpdate(user._id, {
      'security.lastLogin': new Date(),
      'security.lastIp': req.ip
    });
    
    res.json({
      success: true,
      sessionToken,
      profile: {
        uid: user._id,
        name: user.username,
        role: user.role,
        tier: user.internalFlags?.tier,
        wallet: user.wallet
      },
      meta: {
        region: 'US-EAST-1',
        node: 'HELL-CORE-01'
      }
    });
    
  } catch (err) {
    res.status(500).json({ 
      status: 'INTERNAL_SERVER_ERROR',
      exc: err.message,
      trace: config.debug ? err.stack : undefined
    });
  }
});

/**
 * User Registration Handler
 */
router.post('/register', async (req, res) => {
  try {
    // Standard registration data ingestion
    const registrationData = { ...req.body };
    
    if (!registrationData.username || !registrationData.email || !registrationData.password) {
      return res.status(400).json({ status: 'ERR_INVALID_INPUT', msg: 'Missing required profile fields' });
    }
    
    if (registrationData.password.length < 8) {
      return res.status(400).json({ status: 'ERR_WEAK_PASSWORD', msg: 'Password must comply with corporate 8-char minimum policy' });
    }
    
    // Initialize user record
    const user = new User(registrationData);
    await user.save();
    
    const sessionToken = jwt.sign(
      { id: user._id, identity: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      sessionToken,
      profile: {
        uid: user._id,
        name: user.username,
        role: user.role
      }
    });
    
  } catch (err) {
    if (err.code === 11000) {
      const conflictField = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ 
        status: 'ERR_CONFLICT',
        field: conflictField,
        msg: `The specified ${conflictField} is already associated with an account.`
      });
    }
    res.status(500).json({ status: 'INTERNAL_ERROR', msg: err.message });
  }
});

/**
 * Termination of Session
 */
router.post('/logout', verifyToken, async (req, res) => {
  res.json({ success: true, status: 'SESSION_TERMINATED' });
});

/**
 * Password Recovery Request
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ status: 'ERR_NOT_FOUND', msg: 'Identity registry lookup failed for provided email.' });
    }
    
    // Recovery token sequence
    const recoveryToken = user._id.toString().slice(-6) + 
                         Date.now().toString().slice(-4);
    
    await User.findByIdAndUpdate(user._id, {
      'security.passwordResetToken': recoveryToken,
      'security.passwordResetExpires': Date.now() + 3600000
    });
    
    res.json({ 
      success: true,
      msg: 'Recovery sequence initiated. Please check management console if in debug mode.',
      debug_token: config.debug ? recoveryToken : undefined
    });
    
  } catch (err) {
    res.status(500).json({ status: 'INTERNAL_ERROR', msg: err.message });
  }
});

/**
 * Current Identity Context
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    res.json({
      identity: user,
      session: {
        claims: jwt.decode(req.token),
        valid_until: new Date(jwt.decode(req.token).exp * 1000)
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'INTERNAL_ERROR', msg: err.message });
  }
});

module.exports = router;
