"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js")); // ✅ make sure path is correct
const database_js_1 = __importDefault(require("./config/database.js"));
const redis_js_1 = __importDefault(require("./config/redis.js"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const socketHandlers_js_1 = __importDefault(require("./socket/socketHandlers.js"));
const logger_js_1 = __importDefault(require("./utils/logger.js"));
const socketAuth_js_1 = require("./routes/socketAuth.js");
class Server {
    constructor() {
        this.app = new app_js_1.default();
        this.server = http_1.default.createServer(this.app.getApp());
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: '*', //process.env.CLIENT_URL || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true,
            },
        });
        this.setupSocket();
    }
    setupSocket() {
        // ✅ Socket authentication middleware
        this.io.use(socketAuth_js_1.socketAuth);
        // ✅ Initialize socket handlers
        this.socketHandlers = new socketHandlers_js_1.default(this.io);
        // ✅ Handle socket connections
        this.io.on("connection", (socket) => {
            this.socketHandlers.handleConnection(socket);
        });
    }
    async start() {
        try {
            await this.app.initialize();
            const PORT = process.env.PORT || 8000;
            this.server.listen(PORT, () => {
                logger_js_1.default.info(`🚀 Server running on port ${PORT}`);
                logger_js_1.default.info(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
                logger_js_1.default.info(`🌍 CORS enabled for: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
            });
            this.setupGracefulShutdown();
        }
        catch (error) {
            logger_js_1.default.error("❌ Server startup failed:", error);
            process.exit(1);
        }
    }
    setupGracefulShutdown() {
        const gracefulShutdown = async (signal) => {
            logger_js_1.default.info(`📴 Received ${signal}. Starting graceful shutdown...`);
            this.server.close(async () => {
                logger_js_1.default.info("🔌 HTTP server closed");
                try {
                    await this.io.close(); // ✅ close socket.io
                    await database_js_1.default.disconnect();
                    await redis_js_1.default.disconnect();
                    logger_js_1.default.info("✅ Graceful shutdown completed");
                    process.exit(0);
                }
                catch (error) {
                    logger_js_1.default.error("❌ Error during shutdown:", error);
                    process.exit(1);
                }
            });
        };
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    }
}
// ✅ Start the server
const server = new Server();
server.start();
