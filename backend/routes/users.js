const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Message = require('../models/Message');
const { verifyToken, optionalAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const users = await User.find({}).select('-__v').limit(100);
    res.json({ users, total: users.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/purchases', verifyToken, async (req, res) => {
  try {
    const purchases = await Transaction.find({ buyer: req.params.id })
      .populate('product', 'name category pricing')
      .populate('seller', 'username')
      .sort({ createdAt: -1 });
    res.json({ purchases });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/message', verifyToken, async (req, res) => {
  try {
    const { subject, content } = req.body;
    const message = new Message({
      from: req.user._id,
      to: req.params.id,
      subject,
      content,
      threadId: require('crypto').randomBytes(4).toString('hex')
    });
    await message.save();
    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/messages', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ to: req.params.id }, { from: req.params.id }]
    })
    .populate('from', 'username')
    .populate('to', 'username')
    .sort({ createdAt: -1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
