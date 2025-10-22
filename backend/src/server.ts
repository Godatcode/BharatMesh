import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import logger from './utils/logger';
import { connectDatabase } from './database';

// Routes
import authRoutes from './routes/auth';
import billingRoutes from './routes/billing';
import inventoryRoutes from './routes/inventory';
import devicesRoutes from './routes/devices';
import ordersRoutes from './routes/orders';
import attendanceRoutes from './routes/attendance';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// CORS configuration - allow multiple localhost ports in development
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow any localhost origin
    if (config.server.env === 'development' && origin.startsWith('http://localhost')) {
      return callback(null, true);
    }
    
    // In production, check against configured origin
    if (origin === config.server.corsOrigin) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: config.server.env === 'production'
}));

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  }
});

if (config.server.env === 'production') {
  app.use('/api/', limiter);
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime(),
      env: config.server.env
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/attendance', attendanceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Server error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: config.server.env === 'production' 
        ? 'Internal server error' 
        : err.message
    }
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info('Client connected', { socketId: socket.id });
  
  // Device registration
  socket.on('device:register', (data) => {
    const { deviceId, userId } = data;
    socket.join(`user:${userId}`);
    socket.join(`device:${deviceId}`);
    logger.debug('Device registered to rooms', { deviceId, userId });
  });
  
  // Sync operations
  socket.on('sync:operation', (data) => {
    // Broadcast to all devices in the same user's mesh
    socket.to(`user:${data.userId}`).emit('sync:operation', data);
    logger.debug('Sync operation broadcasted', { 
      operationId: data.id,
      collection: data.collection 
    });
  });
  
  // Conflict detection
  socket.on('sync:conflict', (data) => {
    socket.to(`user:${data.userId}`).emit('sync:conflict', data);
    logger.warn('Sync conflict detected', { 
      documentId: data.documentId,
      collection: data.collection 
    });
  });
  
  // Peer discovery
  socket.on('peer:discover', (data) => {
    const { userId, deviceId, capabilities } = data;
    socket.to(`user:${userId}`).emit('peer:discovered', {
      deviceId,
      capabilities,
      socketId: socket.id
    });
    logger.debug('Peer discovery request', { deviceId });
  });
  
  // WebRTC signaling
  socket.on('rtc:offer', (data) => {
    socket.to(data.targetSocketId).emit('rtc:offer', {
      from: socket.id,
      offer: data.offer
    });
  });
  
  socket.on('rtc:answer', (data) => {
    socket.to(data.targetSocketId).emit('rtc:answer', {
      from: socket.id,
      answer: data.answer
    });
  });
  
  socket.on('rtc:ice-candidate', (data) => {
    socket.to(data.targetSocketId).emit('rtc:ice-candidate', {
      from: socket.id,
      candidate: data.candidate
    });
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
});

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });
  
  io.close(() => {
    logger.info('Socket.io server closed');
  });
  
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Start HTTP server
    httpServer.listen(config.server.port, config.server.host, () => {
      logger.info(`🚀 BharatMesh Server running`, {
        env: config.server.env,
        port: config.server.port,
        host: config.server.host,
        socketIo: 'enabled'
      });
      logger.info(`📡 API: http://${config.server.host}:${config.server.port}/api`);
      logger.info(`🔌 Socket.io: ws://${config.server.host}:${config.server.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

export { app, io, httpServer };

