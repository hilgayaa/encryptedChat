import jwt from 'jsonwebtoken';
import logger from '../utils/logger'
import database from '../config/database.js'
import { Request, Response, NextFunction } from 'express';
export const authenticateToken = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    
    const user = await database.getClient().user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        name: true,
        photoUrl: true,
        isActive: true
      }
    });
    
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }
    
    // @ts-ignore
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};
