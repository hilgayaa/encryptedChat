import userController from "../controllers/userController"; 
import express from 'express';
import { authenticateToken } from "../middlewares/auth";
const userRouter = express.Router();

userRouter.use(authenticateToken);

userRouter.get('/search', userController.searchUsers.bind(userController));
userRouter.get('/online', userController.getOnlineUsers.bind(userController));
userRouter.patch('/profile', userController.updateProfile.bind(userController));


export default userRouter ;