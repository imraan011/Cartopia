/**
 * TDD test suite for POST /api/auth/register
 *
 * Uses mongodb-memory-server so production DB is never touched.
 * supertest hits the actual express app in-process (no network bind needed).
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
import { app } from "../../src/app.js";
// same mongoose instance share karta hai jo beforeAll me connect hoti hai
import { userModel } from "../../src/models/user.model.js";

// valid payload — saare required fields present
const VALID_PAYLOAD = {
    username: "john_doe",
    email: "john@example.com",
    password: "Secret@123",
    fullname: { firstname: "John", lastname: "Doe" },
};

let mongoServer;

// ── lifecycle ─────────────────────────────────────────────────────────────────

beforeAll(async () => {
    // In-memory MongoDB instance start karo — real DB se bilkul alag
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// har test ke baad collection saaf karo — izolation ke liye
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

// ── test cases ────────────────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
    // ── Happy path ────────────────────────────────────────────────────────────

    it("should register a new user and return 201 with accessToken", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send(VALID_PAYLOAD);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.accessToken).toBeDefined();
        expect(typeof res.body.data.accessToken).toBe("string");
    });

    it("should return the user object (without password) in the response", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send(VALID_PAYLOAD);

        const { user } = res.body.data;
        expect(user).toBeDefined();
        expect(user.username).toBe(VALID_PAYLOAD.username);
        expect(user.email).toBe(VALID_PAYLOAD.email);
        // password kabhi response me nahi aana chahiye
        expect(user.password).toBeUndefined();
    });

    it("should default role to USER when roles is not provided", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send(VALID_PAYLOAD);

        expect(res.body.data.user.roles).toBe("USER");
    });

    it("should allow registering as SELLER when roles=SELLER is provided", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ ...VALID_PAYLOAD, roles: "SELLER" });

        expect(res.status).toBe(201);
        expect(res.body.data.user.roles).toBe("SELLER");
    });

    it("should set a httpOnly refreshToken cookie on success", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send(VALID_PAYLOAD);

        const cookies = res.headers["set-cookie"];
        expect(cookies).toBeDefined();
        const refreshCookie = cookies.find((c) =>
            c.startsWith("refreshToken="),
        );
        expect(refreshCookie).toBeDefined();
        expect(refreshCookie).toMatch(/HttpOnly/i);
    });

    // ── Validation failures ───────────────────────────────────────────────────

    it("should return 400 when email is missing", async () => {
        const { email, ...payload } = VALID_PAYLOAD;
        const res = await request(app).post("/api/auth/register").send(payload);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toBeDefined();
    });

    it("should return 400 when password is missing", async () => {
        const { password, ...payload } = VALID_PAYLOAD;
        const res = await request(app).post("/api/auth/register").send(payload);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("should return 400 when username is missing", async () => {
        const { username, ...payload } = VALID_PAYLOAD;
        const res = await request(app).post("/api/auth/register").send(payload);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("should return 400 when fullname.firstname is missing", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ ...VALID_PAYLOAD, fullname: { lastname: "Doe" } });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("should return 400 when fullname.lastname is missing", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ ...VALID_PAYLOAD, fullname: { firstname: "John" } });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    // ── Uniqueness / conflict ─────────────────────────────────────────────────

    it("should return 409 when email is already registered", async () => {
        // pehle register karo
        await request(app).post("/api/auth/register").send(VALID_PAYLOAD);

        // same email, alag username se dobara try karo
        const res = await request(app)
            .post("/api/auth/register")
            .send({ ...VALID_PAYLOAD, username: "another_user" });

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toMatch(/email/i);
    });

    it("should return 409 when username is already taken", async () => {
        await request(app).post("/api/auth/register").send(VALID_PAYLOAD);

        // same username, alag email
        const res = await request(app)
            .post("/api/auth/register")
            .send({ ...VALID_PAYLOAD, email: "other@example.com" });

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toMatch(/username/i);
    });

    // ── Password security ─────────────────────────────────────────────────────

    it("should store a hashed password (not plaintext) in the database", async () => {
        await request(app).post("/api/auth/register").send(VALID_PAYLOAD);

        // mongoose.connection.db se raw query — module instance isolation se bachne ke liye
        const dbUser = await mongoose.connection.db
            .collection("users")
            .findOne({ email: VALID_PAYLOAD.email });

        expect(dbUser).not.toBeNull();
        // plaintext nahi hona chahiye
        expect(dbUser.password).not.toBe(VALID_PAYLOAD.password);
        // bcrypt hash hamesha $2 se shuru hota hai
        expect(dbUser.password).toMatch(/^\$2[ab]\$/);
    });
});
