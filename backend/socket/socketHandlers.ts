import database from "../config/database";
import redisService from "../service/redisService";
import logger from "../utils/logger";
import { Keys } from "../utils/constants";
import chatService from "../service/chatService";
import messageService from "../service/messageService";

class SocketHandlers {
  private io;
  private connectedUsers;
  public prisma;
  constructor(io:any) {
    this.io = io;
    this.connectedUsers = new Map();
    this.prisma = database.getClient();
  }

  async handleConnection(socket:any) {
    logger.info(`User connected: ${socket.userName} (${socket.userId})`);
    
    // Store connection
    this.connectedUsers.set(socket.userId, {
      socketId: socket.id,
      userId: socket.userId,
      userName: socket.userName,
    });

    // Update user status
    await this.updateUserStatus(socket.userId, true);
    await redisService.setUserOnline(socket.userId, socket.id);

    // Join user chat rooms
    await this.joinUserChats(socket);

    // Broadcast online status
    socket.broadcast.emit(Keys.EVENTS.USER_STATUS_CHANGE, {
      userId: socket.userId,
      isActive: true,
      lastSeen: new Date()
    });

    this.setupSocketListeners(socket);
  }

  async setupSocketListeners(socket:any) {

    socket.on(Keys.EVENTS.JOIN_CHAT, (chatId:string) => this.handleJoinChat(socket, chatId));
    socket.on(Keys.EVENTS.SEND_MESSAGE, (data:string) => this.handleSendMessage(socket, data));
    socket.on(Keys.EVENTS.TYPING_START, (chatId:string) => this.handleTypingStart(socket, chatId));
    socket.on(Keys.EVENTS.TYPING_STOP, (chatId:string) => this.handleTypingStop(socket, chatId));
    socket.on(Keys.EVENTS.MARK_MESSAGES_READ, (data:string) => this.handleMarkMessagesRead(socket, data));
    socket.on(Keys.EVENTS.EDIT_MESSAGE, (data:string) => this.handleEditMessage(socket, data));
    socket.on(Keys.EVENTS.DISCONNECT, () => this.handleDisconnect(socket));

  }

  async handleJoinChat(socket:any, chatId:string) {
    try {
      const hasAccess = await chatService.verifyUserAccess(chatId, socket.userId);
      if (hasAccess) {
        socket.join(`chat:${chatId}`);
        socket.emit(Keys.EVENTS.JOINED_CHAT, chatId);
      }
    } catch (error) {
      socket.emit(Keys.EVENTS.ERROR, { message: 'Failed to join chat' });
    }
  }

  async handleSendMessage(socket:any, data:any) {
    try {
      const hasAccess = await chatService.verifyUserAccess(data.chatId, socket.userId);
      if (!hasAccess) {
        socket.emit(Keys.EVENTS.ERROR, { message: 'Chat not found' });
        return;
      }

      const message = await messageService.createMessage(socket.userId, data);
      
      // Broadcast to chat room
      this.io.to(`chat:${data.chatId}`).emit(Keys.EVENTS.NEW_MESSAGE, message);

      // Handle offline notifications
      await this.handleOfflineNotifications(data.chatId, socket.userId, message);

    } catch (error) {
      logger.error('Error sending message:', error);
      socket.emit(Keys.EVENTS.ERROR, { message: 'Failed to send message' });
    }
  }

  async handleTypingStart(socket:any, chatId:string) {
    socket.to(`chat:${chatId}`).emit(Keys.EVENTS.USER_TYPING, {
      userId: socket.userId,
      userName: socket.userName,
      chatId
    });
  }

  async handleTypingStop(socket:any, chatId:string) {
    socket.to(`chat:${chatId}`).emit(Keys.EVENTS.USER_STOP_TYPING, {
      userId: socket.userId,
      chatId
    });
  }

  async handleMarkMessagesRead(socket:any, data:any) {
    try {
      const readStatus = await messageService.markMessagesAsRead(socket.userId, data);
      
      socket.to(`chat:${data.chatId}`).emit(Keys.EVENTS.MESSAGES_READ, readStatus);
    } catch (error) {
      socket.emit(Keys.EVENTS.ERROR, { message: 'Failed to mark messages as read' });
    }
  }

  async handleEditMessage(socket:any, data:any) {
    try {
      const message = await messageService.editMessage(data.messageId, socket.userId, data.content);
      
      this.io.to(`chat:${message.chatId}`).emit(Keys.EVENTS.MESSAGE_EDITED, message);
    } catch (error) {
      socket.emit(Keys.EVENTS.ERROR, { message: 'Failed to edit message' });
    }
  }

  async handleDisconnect(socket:any) {
    logger.info(`User disconnected: ${socket.userName}`);
    
    this.connectedUsers.delete(socket.userId);
    await this.updateUserStatus(socket.userId, false);
    await redisService.setUserOffline(socket.userId);

    socket.broadcast.emit(Keys.EVENTS.USER_STATUS_CHANGE, {
      userId: socket.userId,
      isActive: false,
      lastSeen: new Date()
    });
  }

  async joinUserChats(socket:any) {
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
    } catch (error) {
      logger.error('Error joining user chats:', error);
    }
  }

  async updateUserStatus(userId:string, isActive:boolean) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { 
          isActive, 
          lastSeen: new Date() 
        }
      });
    } catch (error) {
      logger.error('Error updating user status:', error);
    }
  }

  async handleOfflineNotifications(chatId:string, senderId:string, message:any) {
    try {
      const participants = await redisService.getChatParticipants(chatId);
      if (participants) {
        // @ts-ignore
        const offlineUsers = participants.filter(id => id !== senderId && !this.connectedUsers.has(id)
        );
        
        if (offlineUsers.length > 0) {
          // Integrate with push notification service
          logger.info('Send push notifications to offline users:', offlineUsers);
          // TODO: Implement push notification service integration
        }
      }
    } catch (error) {
      logger.error('Error handling offline notifications:', error);
    }
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }
}

export default SocketHandlers;