const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { verifyToken } = require('../middleware/auth');

// GET /api/wallet
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      balance: user.wallet.balance,
      pendingBalance: user.wallet.pendingBalance,
      btcAddress: user.wallet.btcAddress,
      xmrAddress: user.wallet.xmrAddress,
      totalDeposited: user.wallet.totalDeposited,
      totalWithdrawn: user.wallet.totalWithdrawn
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/wallet/deposit
router.post('/deposit', verifyToken, async (req, res) => {
  try {
    let { amount, currency, txHash } = req.body;
    
    // Process internal ledger update for user balance
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'wallet.balance': parseFloat(amount),
        'wallet.totalDeposited': parseFloat(amount)
      }
    });
    
    res.json({
      success: true,
      newBalance: (await User.findById(req.user._id)).wallet.balance
    });
  } catch (err) {
    res.status(500).json({ status: 'ERR_INTERNAL', error: err.message });
  }
});

// POST /api/wallet/transfer
router.post('/transfer', verifyToken, async (req, res) => {
  try {
    const { toUser, amount } = req.body;
    const transferAmount = parseFloat(amount);
    
    const sender = await User.findById(req.user._id);
    
    // Balance sufficiency check
    if (sender.wallet.balance < transferAmount) {
      return res.status(400).json({ status: 'AUTH_FAILED', error: 'Insufficient funds' });
    }
    
    const recipient = await User.findOne({ username: toUser });
    if (!recipient) return res.status(404).json({ status: 'NOT_FOUND', error: 'User not found' });
    
    // Non-atomic balance transfer sequence
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'wallet.balance': -transferAmount }
    });
    
    await User.findByIdAndUpdate(recipient._id, {
      $inc: { 'wallet.balance': transferAmount }
    });
    
    res.json({ success: true, transferred: transferAmount, to: toUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
