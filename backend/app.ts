import express from "express";
import helmet from "helmet";
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import  errorHandler  from "./middlewares/errorHandling";
import logger from "./utils/logger";
import authRouter from "./routes/authRoute";
import chatRouter from "./routes/chatRoute";
import userRouter from "./routes/userRoute";
import database from "./config/database";
import redis from "./config/redis";
class App {

  private app: express.Application;
  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeMiddleware() {
    // Security middleware
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin:'*', 
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later'
    });
    this.app.use('/api', limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  initializeRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // API routes
    this.app.use('/api/auth', authRouter);
    this.app.use('/api/chats', chatRouter);
    this.app.use('/api/users',userRouter );

    // 404 handler
    // this.app.use('*', (req, res) => {
    //   res.status(404).json({
    //     error: 'Route not found',
    //     path: req.originalUrl
    //   });
    // });
  }

  initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  async initialize() {
    try {
      await database.connect();
      // await redis.connect();
      logger.info('✅ Application initialized successfully');
    } catch (error) {
      logger.error('❌ Application initialization failed:', error);
      process.exit(1);
    }
  }

  getApp() {
    return this.app;
  }
}

export default App;
