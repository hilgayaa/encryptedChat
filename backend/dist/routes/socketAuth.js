"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../utils/logger"));
const database_1 = __importDefault(require("../config/database"));
const socketAuth = async (socket, next) => {
    try {
        // Extract token from socket handshake (different from HTTP headers)
        const token = socket.handshake.auth.token;
        if (!token) {
            throw new Error('Authentication token required');
        }
        // Same JWT verification as your HTTP middleware
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Same database lookup as your HTTP middleware
        const user = await database_1.default.getClient().user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                username: true,
                name: true,
                photoUrl: true,
                isActive: true
            }
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Attach user data to socket (similar to req.user)
        socket.userId = user.id;
        socket.username = user.username;
        // Allow connection to proceed
        next();
    }
    catch (error) {
        logger_1.default.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
    }
};
exports.socketAuth = socketAuth;
