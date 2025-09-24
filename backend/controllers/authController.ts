import database from '../config/database';
import bcrypt from 'bcrypt';
import { NextFunction, Request,Response } from 'express';
import jwt from 'jsonwebtoken';

class AuthController {
  public prisma;
  constructor() {
    this.prisma = database.getClient();
  }

  async register(req:Request, res:Response, next:NextFunction) {
    try {
      const { username, password, name } = req.body;
      
      const existingUser = await this.prisma.user.findUnique({
        where: { username }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
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
    } catch (error) {
      next(error);
    }
  }

  async login(req:Request, res:Response, next:NextFunction) {
    try {
      const { username, password } = req.body;
    

      const user = await this.prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          name: true,
          photoUrl: true,
          password:true
          // Include password field when you add it
        }
      });
    const checkpassword = bcrypt.compareSync(password, user?.password || '');      
    if(checkpassword == false){

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
      
      const token = this.generateToken({...user,password:undefined});
      
//     res.cokkie("token", token, {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   sameSite: "strict",
//   maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
// });
    const userDetail = {...user,password:undefined}
    return res.status(200).json({
      userDetail,
      token
    });
    } catch (error) {

      next(error);
    }
  }

  generateToken(user:any) {
    return jwt.sign(
      { userId: user.id, email: user.username },
    
      process.env.JWT_SECRET || '',
      { expiresIn: '7d' }
    );
  }
}

export default new AuthController();
