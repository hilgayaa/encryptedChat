import database from "../config/database";
import redisService from "./redisService";
import logger from "../utils/logger";

class MessageService {
  public prisma;
  constructor() {
    this.prisma = database.getClient();
  }

  async createMessage(senderId:string, { chatId, content, type = 'TEXT', replyToId, attachments }:{ chatId:string, content:string, type?:any, replyToId?:string, attachments?:any }) {
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
      await redisService.addRecentMessage(chatId, message);

      return message;
    } catch (error) {
      logger.error('Error creating message:', error);
      throw error;
    }
  }

  async editMessage(messageId:string, userId:string, content:string) {
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
    } catch (error) {
      logger.error('Error editing message:', error);
      throw error;
    }
  }

  async markMessagesAsRead(userId:string, { chatId, messageIds }: { chatId: string; messageIds: string[] }) {
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
    } catch (error) {
      logger.error('Error marking messages as read:', error);
      throw error;
    }
  }
}

 export default new MessageService();
