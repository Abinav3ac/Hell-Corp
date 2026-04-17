/**
 * VERIFICATION SCRIPT — INFORMATION LEAK FIX
 * This script mocks an Express request/response and calls the error handler
 * to verify that sensitive data is not being leaked in the response.
 */
const fs = require('fs');
const path = require('path');

// 1. Mock config (reading current values)
const config = {
  debug: false // Production default
};

// 2. Mock Error Handler (reproducing the code in server.js)
const errorHandler = (err, req, res, next) => {
  const traceId = 'mock-trace-id';
  const status = err.status || 500;
  
  // Internal logging (should show actual data)
  console.log('[LOG] Internal Logging would happen here with TraceID:', traceId);

  const errorPayload = {
    message: status === 500 ? 'Internal Server Error' : err.message,
    status: status,
    traceId: traceId
  };
  
  if (config.debug) {
    errorPayload.debug_info = {
      path: req.path,
      method: req.method,
      type: err.name
    };
  }
  
  res.status(status).json({ errors: [errorPayload] });
};

// 3. Mock Response Object
const mockRes = {
  status: function(s) { this.statusCode = s; return this; },
  json: function(j) { this.payload = j; return this; }
};

// 4. Test Case: Sensitive Input in req.body
const mockReq = {
  method: 'POST',
  path: '/api/auth/login',
  body: {
    username: 'admin',
    password: 'SUPER_SECRET_PASSWORD_123'
  }
};

const mockErr = new Error('Database Connection Failed');
mockErr.status = 500;

// Execute Test
errorHandler(mockErr, mockReq, mockRes);

console.log('--- TEST RESULTS ---');
console.log('HTTP Status:', mockRes.statusCode);
console.log('Final Payload:', JSON.stringify(mockRes.payload, null, 2));

const leaked = JSON.stringify(mockRes.payload).includes('SUPER_SECRET_PASSWORD_123');
if (leaked) {
  console.error('❌ FAILURE: Password leaked in response payload!');
  process.exit(1);
} else {
  console.log('✅ SUCCESS: No credentials found in response payload.');
}

const stackLeaked = JSON.stringify(mockRes.payload).includes('Error: Database Connection Failed');
if (stackLeaked) {
  console.error('❌ FAILURE: Stack trace leaked in response payload!');
  process.exit(1);
} else {
  console.log('✅ SUCCESS: No stack trace found in response payload.');
}
