/**
 * TDD test suite for POST /api/auth/login
 *
 * Uses mongodb-memory-server to avoid touching real DB.
 * Follows exact Cartopia response format and security standards.
 */

import {
    describe,
    it,
    expect,
    beforeAll,
    afterAll,
    afterEach,
} from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import "dotenv/config";
import request from "supertest";
import { hash } from "bcryptjs";
import { app } from "../../src/app.js";

const RAW_PASSWORD = "Password@123";

const TEST_USER = {
    username: "john_doe",
    email: "john@example.com",
    fullname: { firstname: "John", lastname: "Doe" },
    roles: "USER",
};

let mongoServer;

// ── Lifecycle ─────────────────────────────────────────────────────────────────

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// har test ke baad database clean karo
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

// ── Test Helpers ──────────────────────────────────────────────────────────────

// Test user insert karne ke liye helper function
const seedTestUser = async (overrides = {}) => {
    const hashedPassword = await hash(overrides.password || RAW_PASSWORD, 10);
    const usersCollection = mongoose.connection.db.collection("users");

    const userDoc = {
        username: overrides.username || TEST_USER.username,
        email: overrides.email || TEST_USER.email,
        password: hashedPassword,
        fullname: overrides.fullname || TEST_USER.fullname,
        roles: overrides.roles || TEST_USER.roles,
        addresses: [],
    };

    const result = await usersCollection.insertOne(userDoc);
    return { ...userDoc, _id: result.insertedId };
};

// ── Test Cases ────────────────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
    // ── Happy Path ────────────────────────────────────────────────────────────

    it("should login successfully with valid credentials and return 200 with accessToken", async () => {
        await seedTestUser();

        const res = await request(app).post("/api/auth/login").send({
            email: TEST_USER.email,
            password: RAW_PASSWORD,
        });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.accessToken).toBeDefined();
        expect(typeof res.body.data.accessToken).toBe("string");
    });

    it("should return the user object (without password) in response body", async () => {
        await seedTestUser();

        const res = await request(app).post("/api/auth/login").send({
            email: TEST_USER.email,
            password: RAW_PASSWORD,
        });

        expect(res.status).toBe(200);
        const { user } = res.body.data;
        expect(user).toBeDefined();
        expect(user.email).toBe(TEST_USER.email);
        expect(user.username).toBe(TEST_USER.username);
        // password leak nahi hona chahiye
        expect(user.password).toBeUndefined();
    });

    it("should set a httpOnly refreshToken cookie on successful login", async () => {
        await seedTestUser();

        const res = await request(app).post("/api/auth/login").send({
            email: TEST_USER.email,
            password: RAW_PASSWORD,
        });

        expect(res.status).toBe(200);
        const cookies = res.headers["set-cookie"];
        expect(cookies).toBeDefined();

        const refreshCookie = cookies.find((c) =>
            c.startsWith("refreshToken="),
        );
        expect(refreshCookie).toBeDefined();
        expect(refreshCookie).toMatch(/HttpOnly/i);
    });

    // ── Validation Failures (400) ──────────────────────────────────────────────

    it("should return 400 when email is missing", async () => {
        const res = await request(app).post("/api/auth/login").send({
            password: RAW_PASSWORD,
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toBeDefined();
    });

    it("should return 400 when email is invalid format", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "not-an-email",
            password: RAW_PASSWORD,
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toBeDefined();
    });

    it("should return 400 when password is missing", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: TEST_USER.email,
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toBeDefined();
    });

    // ── Authentication Failures (401) ──────────────────────────────────────────

    it("should return 401 when user does not exist", async () => {
        await seedTestUser();

        const res = await request(app).post("/api/auth/login").send({
            email: "nonexistent@example.com",
            password: RAW_PASSWORD,
        });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toBeDefined();
    });

    it("should return 401 when password does not match", async () => {
        await seedTestUser();

        const res = await request(app).post("/api/auth/login").send({
            email: TEST_USER.email,
            password: "WrongPassword@999",
        });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toBeDefined();
    });
});
