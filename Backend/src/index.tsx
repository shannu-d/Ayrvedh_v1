import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import chatRoutes from './routes/chatRoutes';
import symptomRoutes from './routes/symptomRoutes';

const app = express();

// Middleware
app.use(cors({
  origin: [env.FRONTEND_URL, 'http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/symptoms', symptomRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
      console.log(`📝 Environment: ${env.NODE_ENV}`);
      console.log(`📦 Routes: /api/auth | /api/products | /api/orders | /api/admin | /api/chat | /api/symptoms`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
