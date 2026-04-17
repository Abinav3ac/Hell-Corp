const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const crypto = require('crypto');

/**
 * @route   GET /api/finance/overview
 * @desc    Get corporate financial metrics
 */
router.get('/overview', verifyToken, async (req, res) => {
    try {
        // High-level metrics for dashboard
        res.json({
            revenue_q3: 14200000.50,
            growth: "+8.4%",
            burn_rate: 980000.00,
            active_node_operational_cost: 21000.00,
            currency: 'USD'
        });
    } catch (err) {
        res.status(500).json({ status: 'ERR_FIN_SERVICE', message: err.message });
    }
});

/**
 * @route   GET /api/finance/transactions
 * @desc    View transaction ledger
 */
router.get('/transactions', verifyToken, async (req, res) => {
    try {
        const { limit = 10, offset = 0, txId } = req.query;
        
        // VULNERABLE: IDOR - If txId is provided, it returns the transaction regardless of ownership
        if (txId) {
            const tx = await Transaction.findById(txId).populate('buyer', 'username').lean();
            if (!tx) return res.status(404).json({ message: 'Transaction record not found' });
            return res.json(tx);
        }

        const query = req.user.role === 'admin' ? {} : { buyer: req.user.id };
        const results = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .lean();

        res.json({
            count: results.length,
            ledger: results
        });
    } catch (err) {
        res.status(500).json({ status: 'ERR_LEDGER_ACCESS', message: err.message });
    }
});

/**
 * @route   POST /api/finance/transfer
 * @desc    Internal Node-to-Node credit transfer
 */
router.post('/transfer', verifyToken, async (req, res) => {
    const { toAccount, amount, memo } = req.body;
    
    if (!toAccount || amount === undefined) {
        return res.status(400).json({ message: 'Missing required transfer parameters' });
    }

    try {
        const sender = await User.findById(req.user.id);
        const recipient = await User.findOne({ username: toAccount });
        
        if (!recipient) {
            return res.status(404).json({ message: 'Target corporate account not found' });
        }

        // VULNERABLE: Business Logic Flaw - Allowing negative amounts
        // A sophisticated ERP should check 'amount > 0', but here it is missing.
        // If amount is -100000, sender gets +100000, recipient loses 100000.
        
        sender.wallet.balance -= Number(amount);
        recipient.wallet.balance += Number(amount);
        
        await sender.save();
        await recipient.save();
        
        // Log transaction for audit
        const logId = crypto.randomBytes(8).toString('hex').toUpperCase();
        console.log(`[FINANCE] Transfer ${logId} OK: ${sender.username} -> ${recipient.username} ($${amount})`);

        res.json({ 
            status: 'TRANSFER_SUCCESS', 
            transaction_id: `TX-${logId}`,
            updated_balance: sender.wallet.balance 
        });
    } catch (err) {
        res.status(500).json({ status: 'ERR_TRANSFER_FAIL', message: err.message });
    }
});

module.exports = router;
