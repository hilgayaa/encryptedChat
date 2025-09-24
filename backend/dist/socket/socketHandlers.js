"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const redisService_1 = __importDefault(require("../service/redisService"));
const logger_1 = __importDefault(require("../utils/logger"));
const constants_1 = require("../utils/constants");
const chatService_1 = __importDefault(require("../service/chatService"));
const messageService_1 = __importDefault(require("../service/messageService"));
class SocketHandlers {
    constructor(io) {
        this.io = io;
        this.connectedUsers = new Map();
        this.prisma = database_1.default.getClient();
    }
    async handleConnection(socket) {
        logger_1.default.info(`User connected: ${socket.userName} (${socket.userId})`);
        // Store connection
        this.connectedUsers.set(socket.userId, {
            socketId: socket.id,
            userId: socket.userId,
            userName: socket.userName,
        });
        // Update user status
        await this.updateUserStatus(socket.userId, true);
        await redisService_1.default.setUserOnline(socket.userId, socket.id);
        // Join user chat rooms
        await this.joinUserChats(socket);
        // Broadcast online status
        socket.broadcast.emit(constants_1.Keys.EVENTS.USER_STATUS_CHANGE, {
            userId: socket.userId,
            isActive: true,
            lastSeen: new Date()
        });
        this.setupSocketListeners(socket);
    }
    async setupSocketListeners(socket) {
        socket.on(constants_1.Keys.EVENTS.JOIN_CHAT, (chatId) => this.handleJoinChat(socket, chatId));
        socket.on(constants_1.Keys.EVENTS.SEND_MESSAGE, (data) => this.handleSendMessage(socket, data));
        socket.on(constants_1.Keys.EVENTS.TYPING_START, (chatId) => this.handleTypingStart(socket, chatId));
        socket.on(constants_1.Keys.EVENTS.TYPING_STOP, (chatId) => this.handleTypingStop(socket, chatId));
        socket.on(constants_1.Keys.EVENTS.MARK_MESSAGES_READ, (data) => this.handleMarkMessagesRead(socket, data));
        socket.on(constants_1.Keys.EVENTS.EDIT_MESSAGE, (data) => this.handleEditMessage(socket, data));
        socket.on(constants_1.Keys.EVENTS.DISCONNECT, () => this.handleDisconnect(socket));
    }
    async handleJoinChat(socket, chatId) {
        try {
            const hasAccess = await chatService_1.default.verifyUserAccess(chatId, socket.userId);
            if (hasAccess) {
                socket.join(`chat:${chatId}`);
                socket.emit(constants_1.Keys.EVENTS.JOINED_CHAT, chatId);
            }
        }
        catch (error) {
            socket.emit(constants_1.Keys.EVENTS.ERROR, { message: 'Failed to join chat' });
        }
    }
    async handleSendMessage(socket, data) {
        try {
            const hasAccess = await chatService_1.default.verifyUserAccess(data.chatId, socket.userId);
            if (!hasAccess) {
                socket.emit(constants_1.Keys.EVENTS.ERROR, { message: 'Chat not found' });
                return;
            }
            const message = await messageService_1.default.createMessage(socket.userId, data);
            // Broadcast to chat room
            this.io.to(`chat:${data.chatId}`).emit(constants_1.Keys.EVENTS.NEW_MESSAGE, message);
            // Handle offline notifications
            await this.handleOfflineNotifications(data.chatId, socket.userId, message);
        }
        catch (error) {
            logger_1.default.error('Error sending message:', error);
            socket.emit(constants_1.Keys.EVENTS.ERROR, { message: 'Failed to send message' });
        }
    }
    async handleTypingStart(socket, chatId) {
        socket.to(`chat:${chatId}`).emit(constants_1.Keys.EVENTS.USER_TYPING, {
            userId: socket.userId,
            userName: socket.userName,
            chatId
        });
    }
    async handleTypingStop(socket, chatId) {
        socket.to(`chat:${chatId}`).emit(constants_1.Keys.EVENTS.USER_STOP_TYPING, {
            userId: socket.userId,
            chatId
        });
    }
    async handleMarkMessagesRead(socket, data) {
        try {
            const readStatus = await messageService_1.default.markMessagesAsRead(socket.userId, data);
            socket.to(`chat:${data.chatId}`).emit(constants_1.Keys.EVENTS.MESSAGES_READ, readStatus);
        }
        catch (error) {
            socket.emit(constants_1.Keys.EVENTS.ERROR, { message: 'Failed to mark messages as read' });
        }
    }
    async handleEditMessage(socket, data) {
        try {
            const message = await messageService_1.default.editMessage(data.messageId, socket.userId, data.content);
            this.io.to(`chat:${message.chatId}`).emit(constants_1.Keys.EVENTS.MESSAGE_EDITED, message);
        }
        catch (error) {
            socket.emit(constants_1.Keys.EVENTS.ERROR, { message: 'Failed to edit message' });
        }
    }
    async handleDisconnect(socket) {
        logger_1.default.info(`User disconnected: ${socket.userName}`);
        this.connectedUsers.delete(socket.userId);
        await this.updateUserStatus(socket.userId, false);
        await redisService_1.default.setUserOffline(socket.userId);
        socket.broadcast.emit(constants_1.Keys.EVENTS.USER_STATUS_CHANGE, {
            userId: socket.userId,
            isActive: false,
            lastSeen: new Date()
        });
    }
    async joinUserChats(socket) {
        try {
            const userChats = await this.prisma.chat.findMany({
                where: {
                    participants: {
                        some: { id: socket.userId }
                    }
                },
                select: { id: true }
            });
            userChats.forEach(chat => {
                socket.join(`chat:${chat.id}`);
            });
        }
        catch (error) {
            logger_1.default.error('Error joining user chats:', error);
        }
    }
    async updateUserStatus(userId, isActive) {
        try {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    isActive,
                    lastSeen: new Date()
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error updating user status:', error);
        }
    }
    async handleOfflineNotifications(chatId, senderId, message) {
        try {
            const participants = await redisService_1.default.getChatParticipants(chatId);
            if (participants) {
                // @ts-ignore
                const offlineUsers = participants.filter(id => id !== senderId && !this.connectedUsers.has(id));
                if (offlineUsers.length > 0) {
                    // Integrate with push notification service
                    logger_1.default.info('Send push notifications to offline users:', offlineUsers);
                    // TODO: Implement push notification service integration
                }
            }
        }
        catch (error) {
            logger_1.default.error('Error handling offline notifications:', error);
        }
    }
    getConnectedUsers() {
        return Array.from(this.connectedUsers.keys());
    }
}
exports.default = SocketHandlers;
