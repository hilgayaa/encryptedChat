"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../utils/logger"));
const redisService_1 = __importDefault(require("./redisService"));
class ChatService {
    constructor() {
        this.prisma = database_1.default.getClient();
    }
    async getUserChats(userId) {
        try {
            console.log(userId);
            const chats = await this.prisma.chat.findMany({
                where: {
                    participants: {
                        some: { id: userId }
                    }
                },
                include: {
                    participants: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            photoUrl: true,
                            isActive: true,
                            lastSeen: true
                        }
                    },
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            sender: {
                                select: { id: true, name: true, username: true }
                            },
                            readStatus: {
                                where: { userId }
                            }
                        }
                    },
                    _count: {
                        select: {
                            messages: {
                                where: {
                                    readStatus: {
                                        none: { userId }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { lastActivity: 'desc' }
            });
            console.log(chats);
            return chats;
        }
        catch (error) {
            logger_1.default.error('Error getting user chats:', error);
            throw error;
        }
    }
    async createChat(creatorId, { participantIds, title, isGroup = false }) {
        try {
            const allParticipants = [...new Set([creatorId, ...participantIds])];
            // Check for existing direct chat
            if (!isGroup && allParticipants.length === 2) {
                const existingChat = await this.findExistingDirectChat(allParticipants);
                if (existingChat)
                    return existingChat;
            }
            const chat = await this.prisma.chat.create({
                data: {
                    title,
                    isGroup,
                    type: isGroup ? 'GROUP' : 'DIRECT',
                    ownerId: isGroup ? creatorId : null,
                    participants: {
                        connect: allParticipants.map(id => ({ id }))
                    }
                },
                include: {
                    participants: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            photoUrl: true,
                            isActive: true
                        }
                    }
                }
            });
            // Cache participants
            await redisService_1.default.setChatParticipants(chat.id, allParticipants);
            return chat;
        }
        catch (error) {
            logger_1.default.error('Error creating chat:', error);
            throw error;
        }
    }
    async findExistingDirectChat(participantIds) {
        return await this.prisma.chat.findFirst({
            where: {
                AND: [
                    { isGroup: false },
                    { participants: { some: { id: participantIds[0] } } },
                    { participants: { some: { id: participantIds[1] } } }
                ]
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        photoUrl: true,
                        isActive: true
                    }
                }
            }
        });
    }
    async getChatMessages(chatId, userId, page = 1, limit = 50) {
        try {
            // Verify user access
            const chat = await this.prisma.chat.findFirst({
                where: {
                    id: chatId,
                    participants: {
                        some: { id: userId }
                    }
                }
            });
            if (!chat) {
                throw new Error('Chat not found or access denied');
            }
            const offset = (page - 1) * limit;
            const messages = await this.prisma.message.findMany({
                where: { chatId },
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
                    },
                    readStatus: true
                },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit
            });
            return messages.reverse();
        }
        catch (error) {
            logger_1.default.error('Error getting chat messages:', error);
            throw error;
        }
    }
    async verifyUserAccess(chatId, userId) {
        const chat = await this.prisma.chat.findFirst({
            where: {
                id: chatId,
                participants: {
                    some: { id: userId }
                }
            }
        });
        return !!chat;
    }
}
exports.default = new ChatService();
