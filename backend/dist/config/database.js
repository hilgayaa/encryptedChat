"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
class Database {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async connect() {
        try {
            await this.prisma.$connect();
            console.log("Database connected");
        }
        catch (error) {
            console.error("Database connection error:", error);
            process.exit(1);
        }
    }
    async disconnect() {
        await this.prisma.$disconnect();
        console.log("Database disconnected");
    }
    getClient() {
        return this.prisma;
    }
}
exports.default = new Database();
