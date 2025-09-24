"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatController_1 = __importDefault(require("../controllers/chatController"));
const auth_1 = require("../middlewares/auth");
const validator_1 = require("../utils/validator");
const chatRouter = express_1.default.Router();
chatRouter.use(auth_1.authenticateToken);
chatRouter.get('/', chatController_1.default.getUserChats.bind(chatController_1.default));
chatRouter.post('/', (0, validator_1.validate)(validator_1.schemas.createChat), chatController_1.default.createChat.bind(chatController_1.default));
chatRouter.get('/:chatId/messages', chatController_1.default.getChatMessages.bind(chatController_1.default));
exports.default = chatRouter;
