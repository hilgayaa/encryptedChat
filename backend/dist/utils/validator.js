"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.schemas = void 0;
const constants_1 = require("./constants");
const { z } = require("zod");
exports.schemas = {
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
        type: z.enum(Object.values(constants_1.Keys.MESSAGE_TYPES)).default("TEXT"),
        replyToId: z.string().optional(),
        attachments: z.any().optional(),
    }),
};
// ✅ Validation middleware
const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse(req.body);
        req.body = parsed; // overwrite with parsed + defaults applied
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: "Validation error",
                details: error.errors.map((err) => err.message),
            });
        }
        next(error);
    }
};
exports.validate = validate;
