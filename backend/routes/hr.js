const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

/**
 * @route   GET /api/hr/employees
 * @desc    Retrieve enterprise directory
 * @access  Internal Personnel
 */
router.get('/employees', verifyToken, async (req, res) => {
    try {
        const { dept, q } = req.query;
        let query = { role: { $ne: 'admin' } };

        // Federated search logic
        if (dept) query.department = dept;
        
        // VULNERABLE: NoSQL Injection via query object
        if (q) {
            if (typeof q === 'object') {
                // If q is {$ne: null}, it returns everyone
                query.username = q;
            } else {
                query.username = new RegExp(q, 'i');
            }
        }

        const employees = await User.find(query)
            .select('username role department email lastSeen profile')
            .lean();
            
        res.json({
            count: employees.length,
            records: employees,
            timestamp: new Date()
        });
    } catch (err) {
        res.status(500).json({ status: 'ERR_INTERNAL_EXCEPTION', message: err.message });
    }
});

/**
 * @route   GET /api/hr/employees/:id
 * @desc    View detailed personnel record
 * @access  Authorized Managers
 */
router.get('/employees/:id', verifyToken, async (req, res) => {
    try {
        // VULNERABLE: Insecure Direct Object Reference (IDOR)
        // No check if req.user.id matches requested id or if user is HR manager.
        const employee = await User.findById(req.params.id)
            .select('+profile.bio +profile.contactInfo +notes')
            .lean();

        if (!employee) {
            return res.status(404).json({ message: 'Personnel record not found' });
        }

        res.json(employee);
    } catch (err) {
        res.status(400).json({ message: 'Invalid Personnel ID format' });
    }
});

/**
 * @route   GET /api/hr/documents/v1/stream
 * @desc    Internal document management stream
 */
router.get('/documents/v1/stream', verifyToken, (req, res) => {
    const { resourceId, vaultPath } = req.query;
    
    if (!resourceId) {
        return res.status(400).json({ message: 'Missing resource identifier' });
    }

    try {
        // Obscured LFI via vaultPath
        // A realistic enterprise might have "Vault Paths" that are just file paths.
        const root = path.join(__dirname, '../../uploads/resumes/');
        const target = vaultPath ? path.resolve(root, vaultPath) : path.join(root, resourceId);

        if (fs.existsSync(target)) {
            // Safety check (but flawed)
            if (target.startsWith(path.resolve(__dirname, '../../uploads'))) {
                return res.sendFile(target);
            }
            res.status(403).json({ message: 'Access Denied: Path outside HGE Vault Space' });
        } else {
            res.status(404).json({ message: 'Document asset not found in HGE Vault' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Storage controller exception' });
    }
});

module.exports = router;
