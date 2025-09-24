"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errorHandling_1 = __importDefault(require("./middlewares/errorHandling"));
const logger_1 = __importDefault(require("./utils/logger"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const chatRoute_1 = __importDefault(require("./routes/chatRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const database_1 = __importDefault(require("./config/database"));
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddleware() {
        // Security middleware
        this.app.use((0, helmet_1.default)());
        // CORS
        this.app.use((0, cors_1.default)({
            origin: '*',
            credentials: true
        }));
        // Rate limiting
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later'
        });
        this.app.use('/api', limiter);
        // Body parsing
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // Request logging
        this.app.use((req, res, next) => {
            logger_1.default.info(`${req.method} ${req.url}`, {
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
        this.app.use('/api/auth', authRoute_1.default);
        this.app.use('/api/chats', chatRoute_1.default);
        this.app.use('/api/users', userRoute_1.default);
        // 404 handler
        // this.app.use('*', (req, res) => {
        //   res.status(404).json({
        //     error: 'Route not found',
        //     path: req.originalUrl
        //   });
        // });
    }
    initializeErrorHandling() {
        this.app.use(errorHandling_1.default);
    }
    async initialize() {
        try {
            await database_1.default.connect();
            // await redis.connect();
            logger_1.default.info('✅ Application initialized successfully');
        }
        catch (error) {
            logger_1.default.error('❌ Application initialization failed:', error);
            process.exit(1);
        }
    }
    getApp() {
        return this.app;
    }
}
exports.default = App;
