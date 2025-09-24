"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keys = void 0;
exports.Keys = {
    EVENTS: {
        CONNECTION: 'connection',
        DISCONNECT: 'disconnect',
        JOIN_CHAT: 'join_chat',
        SEND_MESSAGE: 'send_message',
        TYPING_START: 'typing_start',
        TYPING_STOP: 'typing_stop',
        MARK_MESSAGES_READ: 'mark_messages_read',
        EDIT_MESSAGE: 'edit_message',
        NEW_MESSAGE: 'new_message',
        USER_TYPING: 'user_typing',
        USER_STOP_TYPING: 'user_stop_typing',
        USER_STATUS_CHANGE: 'user_status_change',
        MESSAGES_READ: 'messages_read',
        MESSAGE_EDITED: 'message_edited',
        JOINED_CHAT: 'joined_chat',
        ERROR: 'error'
    },
    REDIS_KEYS: {
        CHAT_PARTICIPANTS: (chatId) => `chat:${chatId}:participants`,
        RECENT_MESSAGES: (chatId) => `chat:${chatId}:recent_messages`,
        USER_SESSION: (userId) => `user:${userId}:session`,
        ONLINE_USERS: 'online_users'
    },
    MESSAGE_TYPES: {
        TEXT: 'TEXT',
        IMAGE: 'IMAGE',
        VIDEO: 'VIDEO',
        AUDIO: 'AUDIO',
        FILE: 'FILE',
        SYSTEM: 'SYSTEM',
        LOCATION: 'LOCATION',
        CONTACT: 'CONTACT'
    },
    CHAT_TYPES: {
        DIRECT: 'DIRECT',
        GROUP: 'GROUP'
    }
};
