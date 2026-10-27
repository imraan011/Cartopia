/**
 * Global Jest test setup for auth tests.
 * Runs before each test suite via setupFilesAfterEnv in jest.config.cjs.
 */

import "dotenv/config";
import { beforeAll, afterAll, afterEach, jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { redis } from "../db/redis.js";

// Windows pe MongoDB startup thoda time leta hai
jest.setTimeout(60000);

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
        binary: { version: "6.0.14" },
    });
    await mongoose.connect(mongoServer.getUri());
}, 60000);

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    await redis.quit();
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});
