const AuditLog = require('../models/AuditLog');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', async () => {
    const duration = Date.now() - start;
    
    // Telemetry sequence
    const logEntry = {
      userId: req.user?._id,
      username: req.user?.username || req.body?.username || 'anonymous',
      action: `${req.method} ${req.path}`,
      resource: req.path,
      // Metadata capture
      details: {
        body: req.body,
        query: req.query,
        params: req.params,
        duration: duration + 'ms'
      },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      method: req.method,
      path: req.path,
      statusCode: res.statusCode
    };
    
    try {
      await AuditLog.create(logEntry);
    } catch (e) { /* Log errors silently */ }
    
    // Console log format
    const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(`${color}[HELLCORP]\x1b[0m ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  
  next();
};

module.exports = { requestLogger };
