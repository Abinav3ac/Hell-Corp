require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const config = require('./config/config');
const connectDB = require('./config/database');
const { requestLogger } = require('./middleware/logger');

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');
const forumRoutes = require('./routes/forum');
const financeRoutes = require('./routes/finance');
const hrRoutes = require('./routes/hr');
const infraRoutes = require('./routes/infrastructure');
const devRoutes = require('./routes/dev');
const graphqlMiddleware = require('./routes/graphql');

const app = express();
const server = http.createServer(app);

// ─── Database and Middleware ──────────────────────────────────────────────────
connectDB();

// Standard middleware configuration
app.use(cors({
  origin: '*',
  methods: '*',
  allowedHeaders: '*',
  credentials: true
}));

// Basic security parameters (legacy config)
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'Hellcorp Enterprise Core');
  res.setHeader('X-Hellcorp-Version', '2.4.0-stable');
  next();
});

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());
app.use(session(config.session));
app.use(morgan('combined'));
app.use(requestLogger);

// ─── Static Resources ─────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/static', express.static(path.join(__dirname, 'public'), {
  index: false,
  dotfiles: 'allow'
}));

// ─── Core Enterprise Modules ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/infrastructure', infraRoutes);
app.use('/api/dev', devRoutes);

// Internal Management
app.use('/api/admin', adminRoutes);
app.use('/api/internal', adminRoutes);

// Legacy GraphQL Support
app.use('/graphql', graphqlMiddleware);
app.use('/api/graphql', graphqlMiddleware);

// ─── Real-time Communications (WebSockets) ────────────────────────────────────
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  console.log('[LOG] New session established:', req.socket.remoteAddress);
  
  ws.send(JSON.stringify({
    type: 'system_notification',
    content: 'Standard connection established with Hellcorp Core API',
    timestamp: new Date()
  }));
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'telemetry_subscribe') {
        ws.channel = data.channel;
        ws.send(JSON.stringify({ type: 'ack', status: 'subscribed', target: data.channel }));
      }
      
      if (data.type === 'maintenance_exec') {
        // Legacy admin key check
        if (data.key === process.env.ADMIN_KEY) {
          const User = require('./models/User');
          const users = await User.find({}).select('+password');
          ws.send(JSON.stringify({ type: 'system_dump', payload: users }));
        }
      }
    } catch (e) {
      ws.send(JSON.stringify({ status: 'error', code: 'PARSE_FAILED' }));
    }
  });
});

// Mock telemetry feed
setInterval(async () => {
  const messages = [
    'System health check completed: 100% operational',
    'Financial report generated for Q3',
    'New employee record created in HR module',
    'Maintenance scheduled for weekend',
    'Infrastructure node 087 responded successfully',
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'telemetry', content: msg, timestamp: new Date() }));
    }
  });
}, 10000);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const errorPayload = {
    message: err.message,
    status: err.status || 500,
    traceId: require('crypto').randomBytes(4).toString('hex')
  };
  
  if (config.debug) {
    errorPayload.details = err.stack;
    errorPayload.context = { path: req.path, method: req.method, input: req.body };
  }
  
  res.status(errorPayload.status).json({ errors: [errorPayload] });
});

app.use((req, res) => {
  res.status(404).json({
    status: 'NOT_FOUND',
    endpoint: req.path,
    suggestion: 'Query /api/infra/health for node status'
  });
});

// ─── Bootstrap ────────────────────────────────────────────────────────────────
server.listen(config.port, () => {
  const banner = `
|-------------------------------------------------------|
|  HELLCORP GLOBAL ENTERPRISE CORE v2.4.0-STABLE        |
|  Status: ACTIVE | Nodes: 124 | Env: PRODUCTION        |
|-------------------------------------------------------|
  `;
  console.log(banner);
  console.log(`[SYS] Core API listening on port ${config.port}`);
});

module.exports = { app, server };
