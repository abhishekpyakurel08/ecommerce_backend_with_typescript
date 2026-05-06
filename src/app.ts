import express from 'express';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config';
import { connectDB } from './services/db.service';
import { setupSecurityMiddleware } from './middleware/security.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { setupGracefulShutdown, setServer } from './utils/lifecycle';
import { logger } from './utils/logger';

// Import routes
import userRoute from './routes/user.route';
import productRoute from './routes/product.route';
import orderRoute from './routes/order.route';
import paymentRoute from './routes/coupon.route';
import dashboardRoute from './routes/stats.route';
import { handleStripeWebhook } from './controllers/webhook.controller';

const app = express();

// Security middleware (helmet, cors, rate limiting)
setupSecurityMiddleware(app);

// Body parsing middleware
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Auth: ${req.headers.authorization ? 'Present' : 'Missing'}`);
  next();
});
app.use(express.json());

// Static files - serve uploads folder with absolute path
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/products/uploads', express.static(path.join(__dirname, '../uploads')));

// Stripe webhook route - needs raw body for signature verification
app.post('/api/v1/webhook/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

// API Routes
app.use('/api/v1/user', userRoute);
app.use('/api/v1/product', productRoute);
app.use('/api/v1/order', orderRoute);
app.use('/api/v1/payments', paymentRoute);
app.use('/api/v1/coupon', paymentRoute);
app.use('/api/v1/dashboard', dashboardRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorMiddleware);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    // Setup graceful shutdown
    setupGracefulShutdown();

    // Start listening
    const server = app.listen(config.PORT, () => {
      logger.info(`Server started on port ${config.PORT} in ${config.NODE_ENV} mode`);
    });

    setServer(server);
  } catch (error) {
    logger.error('Failed to start server:', { error: (error as Error).message });
    process.exit(1);
  }
};

startServer();

export default app;