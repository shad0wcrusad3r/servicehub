import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';

// Routes
import authRoutes from './routes/auth';
import labourRoutes from './routes/labour';
import jobRoutes from './routes/jobs';
import jobApplicationRoutes from './routes/jobApplications';
import categoryRoutes from './routes/categories';
import paymentRoutes from './routes/payments';
import ratingRoutes from './routes/ratings';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/labour', labourRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/jobs', jobApplicationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ratings', ratingRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction): void | express.Response => {
  console.error('Global error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation error', details: err.message });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({ error: 'Duplicate value error' });
  }

  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  process.exit(0);
});

startServer();