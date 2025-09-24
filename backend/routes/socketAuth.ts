import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import database from '../config/database';
import { Socket } from 'socket.io';

// Extend Socket interface to include user data
declare module 'socket.io' {
  interface Socket {
    userId?: string;
    username?: string;
    userName?: string;
  }
}

export const socketAuth = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    // Extract token from socket handshake (different from HTTP headers)
    const token = socket.handshake.auth.token;
    
    if (!token) {
      throw new Error('Authentication token required');
    }
    
    // Same JWT verification as your HTTP middleware
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    
    // Same database lookup as your HTTP middleware
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
      throw new Error('User not found');
    }
    
    // Attach user data to socket (similar to req.user)
    socket.userId = user.id;
    socket.username = user.username;
    
    // Allow connection to proceed
    next();
  } catch (error) {
    logger.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
};
