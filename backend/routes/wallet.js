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
// INTENTIONAL VULN B1: No server-side validation of deposit amount
router.post('/deposit', verifyToken, async (req, res) => {
  try {
    // INTENTIONAL VULN B1: Amount taken from request body
    let { amount, currency, txHash } = req.body;
    
    // INTENTIONAL VULN B3: Negative amount not checked
    // amount = -1000 gives the user 1000 credit
    
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
    res.status(500).json({ error: err.message });
  }
});

// POST /api/wallet/transfer
// INTENTIONAL VULN B5: Race condition on transfer
// INTENTIONAL VULN B2: No rate limiting
router.post('/transfer', verifyToken, async (req, res) => {
  try {
    const { toUser, amount } = req.body;
    const transferAmount = parseFloat(amount);
    
    const sender = await User.findById(req.user._id);
    
    // INTENTIONAL VULN B5: TOCTOU race condition
    if (sender.wallet.balance < transferAmount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    
    const recipient = await User.findOne({ username: toUser });
    if (!recipient) return res.status(404).json({ error: 'User not found' });
    
    // Non-atomic - race condition window
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
