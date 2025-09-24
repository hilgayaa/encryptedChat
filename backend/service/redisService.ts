import redis from "../config/redis";
import {Keys} from "../utils/constants.js";
import logger from "../utils/logger.js";

class RedisService {
  public client; 
  constructor() {
    this.client = redis.getClient();
  }

  async setChatParticipants(chatId:string, participantIds:string[], ttl = 3600) {
    try {
      await this.client.setEx(
        Keys.REDIS_KEYS.CHAT_PARTICIPANTS(chatId),
        ttl,
        JSON.stringify(participantIds)
      );
    } catch (error) {
      logger.error('Error setting chat participants:', error);
    }
  }

  async getChatParticipants(chatId:string) {
    try {
      const participants = await this.client.get(Keys.REDIS_KEYS.CHAT_PARTICIPANTS(chatId));
      return participants ? JSON.parse(participants) : null;
    } catch (error) {
      logger.error('Error getting chat participants:', error);
      return null;
    }
  }

  async addRecentMessage(chatId:string, message:any, maxMessages = 100) {
    try {
      await this.client.lPush(
        Keys.REDIS_KEYS.RECENT_MESSAGES(chatId),
        JSON.stringify(message)
      );
      await this.client.lTrim(Keys.REDIS_KEYS.RECENT_MESSAGES(chatId), 0, maxMessages - 1);
    } catch (error) {
      logger.error('Error adding recent message:', error);
    }
  }

  async getRecentMessages(chatId:string, count = 50) {
    try {
      const messages = await this.client.lRange(Keys.REDIS_KEYS.RECENT_MESSAGES(chatId), 0, count - 1);
      return messages.map(msg => JSON.parse(msg));
    } catch (error) {
      logger.error('Error getting recent messages:', error);
      return [];
    }
  }

  async setUserOnline(userId:string, socketId:string) {
    try {
      await this.client.hSet(Keys.REDIS_KEYS.ONLINE_USERS, userId, socketId);
    } catch (error) {
      logger.error('Error setting user online:', error);
    }
  }

  async setUserOffline(userId:string) {
    try {
      await this.client.hDel(Keys.REDIS_KEYS.ONLINE_USERS, userId);
    } catch (error) {
      logger.error('Error setting user offline:', error);
    }
  }

  async getOnlineUsers() {
    try {
      return await this.client.hGetAll(Keys.REDIS_KEYS.ONLINE_USERS);
    } catch (error) {
      logger.error('Error getting online users:', error);
      return {};
    }
  }
}

export default new RedisService();