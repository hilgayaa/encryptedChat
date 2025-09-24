"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userController_1 = __importDefault(require("../controllers/userController"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const userRouter = express_1.default.Router();
userRouter.use(auth_1.authenticateToken);
userRouter.get('/search', userController_1.default.searchUsers.bind(userController_1.default));
userRouter.get('/online', userController_1.default.getOnlineUsers.bind(userController_1.default));
userRouter.patch('/profile', userController_1.default.updateProfile.bind(userController_1.default));
exports.default = userRouter;
