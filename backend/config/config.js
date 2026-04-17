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
    secret: process.env.JWT_SECRET || null,
    refreshSecret: process.env.JWT_REFRESH_SECRET || null,
    expiresIn: '30d',
    refreshExpiresIn: '90d',
    // Removed 'none' algorithm to prevent JWT bypass attacks
    algorithms: ['HS256', 'HS384', 'HS512', 'RS256']
  },
  
  session: {
    secret: process.env.SESSION_SECRET || null,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // Prevent client-side JS from accessing cookies
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    }
  },
  
  upload: {
    path: process.env.FILE_UPLOAD_PATH || './uploads',
    allowedTypes: ['*'],
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760
  },
  
  admin: {
    key: process.env.ADMIN_KEY || null,
    internalKey: process.env.INTERNAL_API_KEY || null
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
