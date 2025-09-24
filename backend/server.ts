import App from "./app.js"; // ✅ make sure path is correct
import database from "./config/database.js";
import redis from "./config/redis.js";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import SocketHandlers from "./socket/socketHandlers.js";
import logger from "./utils/logger.js";
import { socketAuth } from "./routes/socketAuth.js";

class Server {
  private app: App;
  private server: http.Server;
  private io: SocketIOServer;
  private socketHandlers!: SocketHandlers; // ✅ definite assignment

  constructor() {
    this.app = new App();
    this.server = http.createServer(this.app.getApp());

    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',//process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setupSocket();
  }

  private setupSocket() {
    // ✅ Socket authentication middleware
    this.io.use(socketAuth);

    // ✅ Initialize socket handlers
    this.socketHandlers = new SocketHandlers(this.io);

    // ✅ Handle socket connections
    this.io.on("connection", (socket: Socket) => {
      this.socketHandlers.handleConnection(socket);
    });
  }

  async start() {
    try {
      await this.app.initialize();

      const PORT = process.env.PORT || 8000;

      this.server.listen(PORT, () => {
        logger.info(`🚀 Server running on port ${PORT}`);
        logger.info(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
        logger.info(
          `🌍 CORS enabled for: ${
            process.env.CLIENT_URL || "http://localhost:3000"
          }`
        );
      });

      this.setupGracefulShutdown();
    } catch (error) {
      logger.error("❌ Server startup failed:", error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown() {
    const gracefulShutdown = async (signal: string) => {
      logger.info(`📴 Received ${signal}. Starting graceful shutdown...`);

      this.server.close(async () => {
        logger.info("🔌 HTTP server closed");

        try {
          await this.io.close(); // ✅ close socket.io
          await database.disconnect();
          await redis.disconnect();
          logger.info("✅ Graceful shutdown completed");
          process.exit(0);
        } catch (error) {
          logger.error("❌ Error during shutdown:", error);
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
