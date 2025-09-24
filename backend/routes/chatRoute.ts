import express from 'express';
import chatController from '../controllers/chatController';
import { authenticateToken } from '../middlewares/auth';
import { validate, schemas } from '../utils/validator';
const chatRouter = express.Router();

chatRouter.use(authenticateToken);

chatRouter.get('/', chatController.getUserChats.bind(chatController));
chatRouter.post('/', validate(schemas.createChat), chatController.createChat.bind(chatController));
chatRouter.get('/:chatId/messages', chatController.getChatMessages.bind(chatController));

export default chatRouter;