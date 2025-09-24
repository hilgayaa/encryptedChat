import { createClient, RedisClientType } from "redis";

class RedisConfig {
  public client: RedisClientType;

  constructor() {
  this.client = createClient({
    url:"redis://:redispass@redis:6379"  
  }
);
}
  async connect() {

    try {
      await this.client.connect();
      console.log("Redis connected");
    } catch (error) {
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

  getClient(): RedisClientType {
    return this.client;
  }
}

export default new RedisConfig();
