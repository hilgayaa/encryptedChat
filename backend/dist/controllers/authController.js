"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthController {
    constructor() {
        this.prisma = database_1.default.getClient();
    }
    async register(req, res, next) {
        try {
            const { username, password, name } = req.body;
            const existingUser = await this.prisma.user.findUnique({
                where: { username }
            });
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const user = await this.prisma.user.create({
                data: {
                    username,
                    name,
                    password: hashedPassword
                    // Add password field to your schema
                },
                select: {
                    id: true,
                    username: true,
                    name: true,
                    photoUrl: true
                }
            });
            const token = this.generateToken(user);
            res.status(201).json({ token, user });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const user = await this.prisma.user.findUnique({
                where: { username },
                select: {
                    id: true,
                    username: true,
                    name: true,
                    photoUrl: true,
                    password: true
                    // Include password field when you add it
                }
            });
            const checkpassword = bcrypt_1.default.compareSync(password, user?.password || '');
            if (checkpassword == false) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }
            if (!user) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }
            // Uncomment when you add password field
            // const isValidPassword = await bcrypt.compare(password, user.password);
            // if (!isValidPassword) {
            //   return res.status(400).json({ error: 'Invalid credentials' });
            // }
            // Update user status
            await this.prisma.user.update({
                where: { id: user.id },
                data: { isActive: true, lastSeen: new Date() }
            });
            const token = this.generateToken({ ...user, password: undefined });
            //     res.cokkie("token", token, {
            //   httpOnly: true,
            //   secure: process.env.NODE_ENV === "production",
            //   sameSite: "strict",
            //   maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
            // });
            const userDetail = { ...user, password: undefined };
            return res.status(200).json({
                userDetail,
                token
            });
        }
        catch (error) {
            next(error);
        }
    }
    generateToken(user) {
        return jsonwebtoken_1.default.sign({ userId: user.id, email: user.username }, process.env.JWT_SECRET || '', { expiresIn: '7d' });
    }
}
exports.default = new AuthController();
