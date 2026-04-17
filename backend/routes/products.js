const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyToken, optionalAuth } = require('../middleware/auth');

/**
 * Recursive merge for enterprise metadata updates
 * VULNERABLE: Prototype Pollution
 */
const merge = (target, source) => {
    for (const key in source) {
        if (typeof target[key] === 'object' && typeof source[key] === 'object') {
            merge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
};

/**
 * @route   GET /api/assets
 * @desc    Global asset registry
 */
router.get('/', optionalAuth, async (req, res) => {
    try {
        let query = { status: 'active' };
        const { search, category, dept } = req.query;

        // VULNERABLE: NoSQL Injection via regex and query objects
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (category) query.category = category;
        if (dept) query.department = dept;

        const assets = await Product.find(query)
            .select('-__v')
            .lean();

        res.json({
            count: assets.length,
            assets
        });
    } catch (err) {
        res.status(500).json({ status: 'ERR_ASSET_DISCOVERY', message: err.message });
    }
});

/**
 * @route   GET /api/assets/:id
 * @desc    Detailed asset documentation
 */
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        // VULNERABLE: IDOR - Any asset can be retrieved by anyone
        const asset = await Product.findById(req.params.id).lean();
        if (!asset) return res.status(404).json({ message: 'Asset not found in registry' });
        
        res.json(asset);
    } catch (err) {
        res.status(500).json({ message: 'Invalid asset identifier' });
    }
});

/**
 * @route   PUT /api/assets/:id
 * @desc    Update asset metadata
 * @access  Internal Personnel
 */
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const asset = await Product.findById(req.params.id);
        if (!asset) return res.status(404).json({ message: 'Asset not found' });

        // VULNERABLE: Prototype Pollution via recursive merge
        // A hacker can send {"__proto__": {"polluted": true}}
        const updatedData = merge(asset.toObject(), req.body);
        
        // VULNERABLE: Mass Assignment
        // We save the merged object directly back to the database
        await Product.findByIdAndUpdate(req.params.id, updatedData);

        res.json({ status: 'ASSET_PROVISIONED', asset: updatedData });
    } catch (err) {
        res.status(500).json({ status: 'ERR_UPDATE_FAIL', message: err.message });
    }
});

/**
 * @route   POST /api/assets
 * @desc    Provision new enterprise asset
 */
router.post('/', verifyToken, async (req, res) => {
    try {
        // VULNERABLE: Mass Assignment
        const asset = new Product({
            ...req.body,
            department: req.user.department || 'General'
        });
        await asset.save();
        res.status(201).json({ status: 'PROVISION_OK', asset });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
