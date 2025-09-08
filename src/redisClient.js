// redisClient.js
import Redis from 'ioredis';

class RedisClient {
  static instance;

  constructor() {
    if (RedisClient.instance) {
      return RedisClient.instance; // já existe, retorna ela
    }

    this.redis = new Redis({ path: "/var/run/redis/redis.sock" });
    RedisClient.instance = this;
  }

  getClient() {
    return this.redis;
  }
}

export default RedisClient;