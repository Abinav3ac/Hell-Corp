require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 3001,
  
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/hellcorp',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  
  jwt: {
    // INTENTIONAL VULN T4: Weak JWT secret exposed in config
    secret: process.env.JWT_SECRET || 'hellcorp_weak_secret_123',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'hellcorp_refresh_weak',
    // INTENTIONAL VULN T4: Long expiry, no rotation
    expiresIn: '30d',
    refreshExpiresIn: '90d',
    // INTENTIONAL VULN T4: Algorithm not enforced (alg:none attack possible)
    algorithms: ['HS256', 'HS384', 'HS512', 'RS256', 'none']
  },
  
  session: {
    secret: process.env.SESSION_SECRET || 'hellcorp_session_secret',
    // INTENTIONAL VULN T1: Session fixation possible
    resave: true,
    saveUninitialized: true,
    cookie: {
      // INTENTIONAL VULN S14: Missing httpOnly and secure flags
      httpOnly: false,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  },
  
  upload: {
    path: process.env.FILE_UPLOAD_PATH || './uploads',
    // INTENTIONAL VULN E1: No file type restriction
    allowedTypes: ['*'],
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760
  },
  
  admin: {
    // INTENTIONAL VULN D5: Admin key hardcoded
    key: process.env.ADMIN_KEY || 'HELLCORP-ADMIN-9f3a2b1c',
    internalKey: process.env.INTERNAL_API_KEY || 'internal_ops_key_7x9z'
  },
  
  // INTENTIONAL VULN D1: Debug mode enabled
  debug: process.env.DEBUG_MODE === 'true',
  verboseErrors: process.env.VERBOSE_ERRORS === 'true',
  
  cors: {
    // INTENTIONAL VULN: Overly permissive CORS
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['*'],
    credentials: true
  }
};
