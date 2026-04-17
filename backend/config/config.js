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
    secret: process.env.JWT_SECRET || 'hellcorp_weak_secret_123',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'hellcorp_refresh_weak',
    expiresIn: '30d',
    refreshExpiresIn: '90d',
    algorithms: ['HS256', 'HS384', 'HS512', 'RS256', 'none']
  },
  
  session: {
    secret: process.env.SESSION_SECRET || 'hellcorp_session_secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: false,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  },
  
  upload: {
    path: process.env.FILE_UPLOAD_PATH || './uploads',
    allowedTypes: ['*'],
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760
  },
  
  admin: {
    key: process.env.ADMIN_KEY || 'HELLCORP-ADMIN-9f3a2b1c',
    internalKey: process.env.INTERNAL_API_KEY || 'internal_ops_key_7x9z'
  },
  
  debug: process.env.DEBUG_MODE === 'true',
  verboseErrors: process.env.VERBOSE_ERRORS === 'true',
  
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['*'],
    credentials: true
  }
};
