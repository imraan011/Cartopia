import "dotenv/config";
import Redis from "ioredis";

// Test environment ke liye in-memory mock — original Redis database touch nahi hogi
class MockRedis {
    constructor() {
        this.store = new Map();
        this.status = "ready";
    }

    async set(key, value, mode, duration) {
        const expiresAt = mode === "EX" ? Date.now() + duration * 1000 : null;
        this.store.set(key, { value, expiresAt });
        return "OK";
    }

    async get(key) {
        const item = this.store.get(key);
        if (!item) return null;
        if (item.expiresAt && Date.now() > item.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    }

    async ttl(key) {
        const item = this.store.get(key);
        if (!item) return -2;
        if (!item.expiresAt) return -1;
        const remaining = Math.ceil((item.expiresAt - Date.now()) / 1000);
        return remaining > 0 ? remaining : -2;
    }

    async del(key) {
        return this.store.delete(key) ? 1 : 0;
    }

    on() {
        return this;
    }

    async quit() {
        this.store.clear();
        return "OK";
    }

    disconnect() {
        this.store.clear();
    }
}

export const redis =
    process.env.NODE_ENV === "test"
        ? new MockRedis()
        : new Redis({
              host: process.env.REDIS_HOST,
              port: Number(process.env.REDIS_PORT),
              password: process.env.REDIS_PASSWORD,
          });

if (process.env.NODE_ENV !== "test") {
    redis.on("connect", () => {
        console.log("Redis connected successfully");
    });

    redis.on("error", (err) => {
        console.error("Redis connection error:", err.message);
    });
}
