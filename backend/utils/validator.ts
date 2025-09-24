import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod/v3";
import { Keys } from "./constants";
const { z } = require("zod");

export const schemas = {
  register: z.object({
    username: z.string().min(2).max(100),
    password: z.string().min(6),
    name: z.string().min(2).max(50),
  }),

  login: z.object({
    username: z.string().min(2).max(100),
    password: z.string(),
  }),

  createChat: z.object({
    participantIds: z.array(z.string()).min(1),
    title: z.string().max(100).optional(),
    isGroup: z.boolean().default(false),
  }),

  sendMessage: z.object({
    chatId: z.string(),
    content: z.string().max(4000),
    type: z.enum(Object.values(Keys.MESSAGE_TYPES)).default("TEXT"),
    replyToId: z.string().optional(),
    attachments: z.any().optional(),
  }),
};

// ✅ Validation middleware
export const validate =
  <T extends ZodSchema>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed; // overwrite with parsed + defaults applied
      next();
    } catch (error:any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors.map((err:any) => err.message),
        });
      }
      next(error);
    }
  };

