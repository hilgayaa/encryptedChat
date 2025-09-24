"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
class RedisConfig {
    constructor() {
        this.client = (0, redis_1.createClient)({
            url: "redis://:redispass@redis:6379"
        });
    }
    async connect() {
        try {
            await this.client.connect();
            console.log("Redis connected");
        }
        catch (error) {
            console.error("Redis connection error:", error);
            process.exit(1);
        }
    }
    async disconnect() {
        if (this.client) {
            await this.client.disconnect();
            console.log("Redis disconnected");
        }
    }
    getClient() {
        return this.client;
    }
}
exports.default = new RedisConfig();
