import mongoose from 'mongoose';
import { config } from '../config';
import logger from '../utils/logger';

export async function connectDatabase(): Promise<void> {
  try {
    console.log('🔍 Database connection debug:');
    console.log('🔍 MONGO_URI:', process.env.MONGO_URI ? 'set' : 'not set');
    console.log('🔍 MONGO_USER:', process.env.MONGO_USER ? 'set' : 'not set');
    console.log('🔍 MONGO_PASSWORD:', process.env.MONGO_PASSWORD ? 'set' : 'not set');
    console.log('🔍 config.database.mongoUri:', config.database.mongoUri ? 'set' : 'not set');
    
    const options: mongoose.ConnectOptions = {
      autoIndex: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    if (config.database.mongoUser && config.database.mongoPassword) {
      options.auth = {
        username: config.database.mongoUser,
        password: config.database.mongoPassword
      };
    }

    console.log('🔍 About to connect to MongoDB with URI:', config.database.mongoUri);
    await mongoose.connect(config.database.mongoUri, options);
    
    logger.info('✅ MongoDB connected successfully', {
      host: mongoose.connection.host,
      db: mongoose.connection.name
    });
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

// Handle connection events
mongoose.connection.on('connected', () => {
  logger.debug('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed due to app termination');
  process.exit(0);
});

export default mongoose;

