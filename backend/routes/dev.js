const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const libxmljs = require('libxmljs'); // Simulated use for XXE illustration
const ejs = require('ejs');

/**
 * @route   POST /api/dev/deployment/report
 * @desc    Process XML-based R&D deployment reports
 * @access  Internal Developers
 */
router.post('/deployment/report', async (req, res) => {
    try {
        // VULNERABLE: XML External Entity (XXE)
        // Configuration allows external entities and network access during parsing.
        
        const xmlData = req.body;
        if (!xmlData || typeof xmlData !== 'string') {
            return res.status(400).json({ message: 'Invalid payload format. Expected XML string.' });
        }

        const xmlDoc = libxmljs.parseXml(xmlData, { 
            noent: true, 
            dtdload: true, 
            net: true 
        });

        res.json({
            status: 'REPORT_PROCESSED',
            root_node: xmlDoc.root().name(),
            summary: xmlDoc.toString().substring(0, 500)
        });
    } catch (err) {
        res.status(500).json({ status: 'XML_PARSE_ERR', message: 'Failed to process HGE-XML schema' });
    }
});

/**
 * @route   GET /api/dev/diagnostics/system
 * @desc    Retrieve infrastructure environment baseline
 */
router.get('/diagnostics/system', verifyToken, (req, res) => {
    // VULNERABLE: Information Exposure
    // Exposing environment variables and system config via a poorly protected debug route
    
    const { mode, force } = req.query;

    if (req.user.role === 'admin' || (mode === 'debug' && force === 'true')) {
        // Capture sensitive internal metrics (and the CTF flag)
        const sysEnv = { ...process.env };
        delete sysEnv.DB_PASSWORD; // Professional distraction

        res.json({
            status: 'DIAG_DUMP_OK',
            timestamp: new Date(),
            environment: sysEnv
        });
    } else {
        res.status(403).json({ 
            status: 'ACCESS_DENIED', 
            message: 'Insufficient node-level permissions for diagnostics' 
        });
    }
});

/**
 * @route   POST /api/dev/render/preview
 * @desc    On-the-fly rendering for project status summaries
 */
router.post('/render/preview', verifyToken, async (req, res) => {
    const { template, context } = req.body;

    try {
        // VULNERABLE: Server-Side Template Injection (SSTI)
        // Allowing user-supplied templates to be rendered with internal context.
        
        const output = ejs.render(template || 'No template provided', context || {});
        
        res.json({
            status: 'RENDER_OK',
            rendered_output: output
        });
    } catch (err) {
        res.status(500).json({ status: 'RENDER_ERR', message: err.message });
    }
});

module.exports = router;
