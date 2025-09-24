"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = __importDefault(require("../config/redis"));
const constants_js_1 = require("../utils/constants.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
class RedisService {
    constructor() {
        this.client = redis_1.default.getClient();
    }
    async setChatParticipants(chatId, participantIds, ttl = 3600) {
        try {
            await this.client.setEx(constants_js_1.Keys.REDIS_KEYS.CHAT_PARTICIPANTS(chatId), ttl, JSON.stringify(participantIds));
        }
        catch (error) {
            logger_js_1.default.error('Error setting chat participants:', error);
        }
    }
    async getChatParticipants(chatId) {
        try {
            const participants = await this.client.get(constants_js_1.Keys.REDIS_KEYS.CHAT_PARTICIPANTS(chatId));
            return participants ? JSON.parse(participants) : null;
        }
        catch (error) {
            logger_js_1.default.error('Error getting chat participants:', error);
            return null;
        }
    }
    async addRecentMessage(chatId, message, maxMessages = 100) {
        try {
            await this.client.lPush(constants_js_1.Keys.REDIS_KEYS.RECENT_MESSAGES(chatId), JSON.stringify(message));
            await this.client.lTrim(constants_js_1.Keys.REDIS_KEYS.RECENT_MESSAGES(chatId), 0, maxMessages - 1);
        }
        catch (error) {
            logger_js_1.default.error('Error adding recent message:', error);
        }
    }
    async getRecentMessages(chatId, count = 50) {
        try {
            const messages = await this.client.lRange(constants_js_1.Keys.REDIS_KEYS.RECENT_MESSAGES(chatId), 0, count - 1);
            return messages.map(msg => JSON.parse(msg));
        }
        catch (error) {
            logger_js_1.default.error('Error getting recent messages:', error);
            return [];
        }
    }
    async setUserOnline(userId, socketId) {
        try {
            await this.client.hSet(constants_js_1.Keys.REDIS_KEYS.ONLINE_USERS, userId, socketId);
        }
        catch (error) {
            logger_js_1.default.error('Error setting user online:', error);
        }
    }
    async setUserOffline(userId) {
        try {
            await this.client.hDel(constants_js_1.Keys.REDIS_KEYS.ONLINE_USERS, userId);
        }
        catch (error) {
            logger_js_1.default.error('Error setting user offline:', error);
        }
    }
    async getOnlineUsers() {
        try {
            return await this.client.hGetAll(constants_js_1.Keys.REDIS_KEYS.ONLINE_USERS);
        }
        catch (error) {
            logger_js_1.default.error('Error getting online users:', error);
            return {};
        }
    }
}
exports.default = new RedisService();
