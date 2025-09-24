import database from "../config/database";
import logger from "../utils/logger";
import redisService from "./redisService";
class ChatService {
 public prisma; 
  constructor() {
    this.prisma = database.getClient();
  }

  async getUserChats(userId:string) {
    try {
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
      return chats
    } catch (error) {
      logger.error('Error getting user chats:', error);
      throw error;
    }
  }

  async createChat(creatorId:string, { participantIds, title, isGroup = false }:{
    participantIds: string[];
    title?: string;
    isGroup?: boolean;
  }) {
    try {
      const allParticipants = [...new Set([creatorId, ...participantIds])];
      
      // Check for existing direct chat
      if (!isGroup && allParticipants.length === 2) {
        const existingChat = await this.findExistingDirectChat(allParticipants);
        if (existingChat) return existingChat;
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
      await redisService.setChatParticipants(chat.id, allParticipants);
      
      return chat;
    } catch (error) {
      logger.error('Error creating chat:', error);
      throw error;
    }
  }

  async findExistingDirectChat(participantIds:string[]) {
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

  async getChatMessages(chatId:string, userId:string, page = 1, limit = 50) {
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
    } catch (error) {
      logger.error('Error getting chat messages:', error);
      throw error;
    }
  }

  async verifyUserAccess(chatId:string, userId:string) {
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

 export default new ChatService();
