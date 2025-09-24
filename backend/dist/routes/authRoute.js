"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../controllers/authController"));
const validator_1 = require("../utils/validator");
const authRouter = express_1.default.Router();
authRouter.post('/register', (0, validator_1.validate)(validator_1.schemas.register), authController_1.default.register.bind(authController_1.default));
authRouter.post('/login', (0, validator_1.validate)(validator_1.schemas.login), authController_1.default.login.bind(authController_1.default));
exports.default = authRouter;
