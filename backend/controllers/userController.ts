import database from "../config/database";
import { Request,Response,NextFunction } from "express";
import ts from "typescript";
class UserController {
  public prisma;
  constructor() {
    this.prisma = database.getClient();
  }

  async searchUsers(req:Request, res:Response, next:NextFunction) {
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
    } catch (error) {
      next(error);
    }
  }

  async getOnlineUsers(req: Request, res: Response, next: NextFunction) {
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
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
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
    } catch (error) {
      next(error);
    }
  }
}
export default new UserController();