"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const redisService_1 = __importDefault(require("./redisService"));
const logger_1 = __importDefault(require("../utils/logger"));
class MessageService {
    constructor() {
        this.prisma = database_1.default.getClient();
    }
    async createMessage(senderId, { chatId, content, type = 'TEXT', replyToId, attachments }) {
        try {
            const message = await this.prisma.message.create({
                data: {
                    content,
                    type,
                    senderId,
                    chatId,
                    replyToId: replyToId || null,
                    attachments: attachments || null
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            photoUrl: true
                        }
                    },
                    replyTo: {
                        include: {
                            sender: {
                                select: { id: true, name: true }
                            }
                        }
                    }
                }
            });
            // Update chat activity
            await this.prisma.chat.update({
                where: { id: chatId },
                data: { lastActivity: new Date() }
            });
            // Cache message
            await redisService_1.default.addRecentMessage(chatId, message);
            return message;
        }
        catch (error) {
            logger_1.default.error('Error creating message:', error);
            throw error;
        }
    }
    async editMessage(messageId, userId, content) {
        try {
            const message = await this.prisma.message.findFirst({
                where: {
                    id: messageId,
                    senderId: userId
                }
            });
            if (!message) {
                throw new Error('Message not found or unauthorized');
            }
            return await this.prisma.message.update({
                where: { id: messageId },
                data: {
                    content,
                    edited: true,
                    editedAt: new Date()
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            photoUrl: true
                        }
                    }
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error editing message:', error);
            throw error;
        }
    }
    async markMessagesAsRead(userId, { chatId, messageIds }) {
        try {
            const readStatusData = messageIds.map(messageId => ({
                messageId,
                userId
            }));
            await this.prisma.messageReadStatus.createMany({
                data: readStatusData,
                skipDuplicates: true
            });
            return { chatId, messageIds, userId, readAt: new Date() };
        }
        catch (error) {
            logger_1.default.error('Error marking messages as read:', error);
            throw error;
        }
    }
}
exports.default = new MessageService();
