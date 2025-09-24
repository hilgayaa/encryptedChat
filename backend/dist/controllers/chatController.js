"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chatService_1 = __importDefault(require("../service/chatService"));
class ChatController {
    async getUserChats(req, res, next) {
        // @ts-ignore 
        console.log(req.user);
        try {
            //   @ts-ignore
            const chats = await chatService_1.default.getUserChats(req.user.id);
            res.status(200).json(chats);
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async createChat(req, res, next) {
        try {
            //   @ts-ignore
            const chat = await chatService_1.default.createChat(req.user.id, req.body);
            res.status(201).json(chat);
        }
        catch (error) {
            next(error);
        }
    }
    async getChatMessages(req, res, next) {
        try {
            const { chatId } = req.params;
            const { page = 1, limit = 50 } = req.query;
            //   @ts-ignore
            const messages = await chatService_1.default.getChatMessages(chatId, req.user.id, page, limit);
            res.json(messages);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new ChatController();
