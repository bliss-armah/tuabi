import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Use REDIS_URL if available, otherwise construct from separate variables
const redisUrl =
  process.env.REDIS_URL ||
  `redis://${
    process.env.REDIS_PASSWORD ? `:${process.env.REDIS_PASSWORD}@` : ""
  }${process.env.REDIS_HOST || "localhost"}:${
    process.env.REDIS_PORT || "6379"
  }`;

const redis = new Redis(redisUrl);

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

export default redis;
