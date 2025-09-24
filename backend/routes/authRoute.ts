import express from 'express';
import authController from '../controllers/authController';
import { validate, schemas } from '../utils/validator';

const authRouter = express.Router();

authRouter.post('/register', validate(schemas.register), authController.register.bind(authController));
authRouter.post('/login', validate(schemas.login), authController.login.bind(authController));

export default authRouter ;