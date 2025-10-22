import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5001', 10),
    host: process.env.HOST || '0.0.0.0',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  },
  
  database: {
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/bharatmesh',
    mongoUser: process.env.MONGO_USER,
    mongoPassword: process.env.MONGO_PASSWORD
  },
  
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    jwtExpiry: process.env.JWT_EXPIRY || '15m',
    jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  
  pouchdb: {
    port: parseInt(process.env.POUCHDB_PORT || '5984', 10),
    host: process.env.POUCHDB_HOST || 'localhost'
  },
  
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'dev-encryption-key-32-chars!!'
  },
  
  sync: {
    enabled: process.env.SYNC_ENABLED === 'true',
    port: parseInt(process.env.SYNC_PORT || '6000', 10),
    webrtcEnabled: process.env.WEBRTC_ENABLED === 'true'
  },
  
  discovery: {
    mdnsEnabled: process.env.MDNS_ENABLED === 'true',
    serviceName: process.env.SERVICE_NAME || 'bharatmesh'
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/bharatmesh.log'
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },
  
  upload: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
    uploadDir: process.env.UPLOAD_DIR || 'uploads/'
  },
  
  whatsapp: {
    apiKey: process.env.WHATSAPP_API_KEY,
    businessNumber: process.env.WHATSAPP_BUSINESS_NUMBER
  },
  
  sms: {
    parserEnabled: process.env.SMS_PARSER_ENABLED === 'true'
  }
};

export default config;

