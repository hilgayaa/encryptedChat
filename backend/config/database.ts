import { PrismaClient } from "@prisma/client";

class Database {
    public prisma: PrismaClient;
    constructor(){
        this.prisma = new PrismaClient();
    }

    async connect(){
        try {
            await this.prisma.$connect();
            console.log("Database connected");
            
        } catch (error) {
            console.error("Database connection error:", error);
            process.exit(1);
        }
    }

    async disconnect(){
        await this.prisma.$disconnect();
        console.log("Database disconnected");
    }

    getClient(): PrismaClient {
        return this.prisma;
    }
}
 export default new Database();
