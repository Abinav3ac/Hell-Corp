const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { exec } = require('child_process');
const { verifyToken } = require('../middleware/auth');

/**
 * @route   GET /api/infrastructure/health
 * @desc    Global Node Health Monitor
 * @access  Internal Personnel
 */
router.get('/health', verifyToken, async (req, res) => {
    const { node, service = 'status' } = req.query;
    
    if (!node) {
        return res.status(400).json({ status: 'ERR_PARAM', message: 'Target node identifier required' });
    }

    try {
        // VULNERABLE: Server-Side Request Forgery (SSRF)
        // Direct interpolation into URL allows accessing internal metadata or services.
        // e.g. node=169.254.169.254&service=latest/meta-data/
        
        const internalUrl = `http://${node}/${service}`;
        const response = await fetch(internalUrl, { timeout: 3000 });
        
        // Return filtered data for "security" (flawed)
        const data = await response.text();
        res.json({
            node,
            endpoint: service,
            response_preview: data.substring(0, 500),
            latency_ms: 12,
            timestamp: new Date()
        });
    } catch (err) {
        res.status(503).json({ 
            node, 
            status: 'unresponsive', 
            details: 'HGE-CORE could not establish a persistent tunnel to the requested node.'
        });
    }
});

/**
 * @route   POST /api/infrastructure/diagnostic
 * @desc    On-demand network connectivity diagnostic
 */
router.post('/diagnostic', verifyToken, (req, res) => {
    const { target, type = 'ping' } = req.body;

    if (!target) {
        return res.status(400).json({ message: 'Diagnostic target required' });
    }

    // Supported tools: ping, traceroute
    const tool = type === 'traceroute' ? 'tracert' : 'ping -n 1';

    // VULNERABLE: OS Command Injection
    // The target is appended directly to the command string.
    // e.g. target = "127.0.0.1 & dir"
    
    const command = `${tool} ${target}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({
                status: 'DIAG_FAIL',
                message: 'Internal diagnostic tool exception',
                raw_error: stderr || error.message
            });
        }
        
        res.json({
            status: 'DIAG_SUCCESS',
            tool_executed: tool,
            output: stdout
        });
    });
});

module.exports = router;
