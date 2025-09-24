import { Request,Response,NextFunction } from 'express';
import chatService from '../service/chatService';
class ChatController {
  async getUserChats(req:Request, res:Response, next:NextFunction) {

      // @ts-ignore 
    console.log(req.user)
    try {
    //   @ts-ignore
      const chats = await chatService.getUserChats(req.user.id);
      res.status(200).json(chats);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async createChat(req:Request, res:Response, next:NextFunction) {
    try {
    //   @ts-ignore
      const chat = await chatService.createChat(req.user.id, req.body);
      res.status(201).json(chat);
    } catch (error) {
      next(error);
    }
  }

  async getChatMessages(req:Request, res:Response, next:NextFunction) {
    try {
      const { chatId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      
    //   @ts-ignore
      const messages = await chatService.getChatMessages(chatId, req.user.id, page, limit);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  }
}

 export default new ChatController();

