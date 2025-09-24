"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class UserController {
    constructor() {
        this.prisma = database_1.default.getClient();
    }
    async searchUsers(req, res, next) {
        try {
            const { query } = req.query;
            //   @ts-ignore
            if (!query || query.length < 2) {
                return res.json([]);
            }
            const users = await this.prisma.user.findMany({
                where: {
                    AND: [
                        // @ts-ignore
                        { id: { not: req.user.id } },
                        {
                            OR: [
                                // @ts-ignore
                                { name: { contains: query, mode: 'insensitive' } },
                                // @ts-ignore
                                { username: { contains: query, mode: 'insensitive' } }
                            ]
                        }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    photoUrl: true,
                    isActive: true,
                    lastSeen: true
                },
                take: 10
            });
            res.json(users);
        }
        catch (error) {
            next(error);
        }
    }
    async getOnlineUsers(req, res, next) {
        try {
            // @ts-ignore
            const onlineUsers = await redisService.getOnlineUsers();
            // @ts-ignore
            const onlineUserIds = Object.keys(onlineUsers).filter(id => id !== req.user.id);
            if (onlineUserIds.length === 0) {
                return res.json([]);
            }
            const users = await this.prisma.user.findMany({
                where: {
                    id: { in: onlineUserIds }
                },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    photoUrl: true,
                    isActive: true
                }
            });
            res.json(users);
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const { name, bio, photoUrl } = req.body;
            const updatedUser = await this.prisma.user.update({
                // @ts-ignore
                where: { id: req.user.id },
                data: {
                    ...(name && { name }),
                    ...(bio && { bio }),
                    ...(photoUrl && { photoUrl })
                },
                select: {
                    id: true,
                    username: true,
                    name: true,
                    bio: true,
                    photoUrl: true
                }
            });
            res.json(updatedUser);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new UserController();
