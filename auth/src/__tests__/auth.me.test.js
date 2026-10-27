/**
 * TDD test suite for GET /api/auth/me
 *
 * Spec: Returns current user (id, roles, profile). Requires valid access token.
 */

import { describe, it, expect } from "@jest/globals";
import "dotenv/config";
import request from "supertest";
import { app } from "../../src/app.js";

const TEST_USER = {
    username: "john_doe",
    email: "john@example.com",
    password: "Secret@123",
    fullname: { firstname: "John", lastname: "Doe" },
};

// Helper to register user and obtain valid access token
const getValidAccessToken = async () => {
    const res = await request(app)
        .post("/api/auth/register")
        .send(TEST_USER);
    return res.body.data.accessToken;
};

// ── Test Cases ────────────────────────────────────────────────────────────────

describe("GET /api/auth/me", () => {
    // ── Happy Path ────────────────────────────────────────────────────────────

    it("should return 200 and user profile when valid accessToken is provided", async () => {
        const token = await getValidAccessToken();

        const res = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const { user } = res.body.data;
        expect(user).toBeDefined();
        expect(user.email).toBe(TEST_USER.email);
        expect(user.username).toBe(TEST_USER.username);
        expect(user.roles).toBe("USER");
        expect(user.fullname.firstname).toBe(TEST_USER.fullname.firstname);
        expect(user.fullname.lastname).toBe(TEST_USER.fullname.lastname);

        // Security check: password kabhi return nahi hona chahiye
        expect(user.password).toBeUndefined();
    });

    // ── Authentication Failures (401) ──────────────────────────────────────────

    it("should return 401 when Authorization header is missing", async () => {
        const res = await request(app).get("/api/auth/me");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toBeDefined();
    });

    it("should return 401 when token format is invalid (not Bearer)", async () => {
        const res = await request(app)
            .get("/api/auth/me")
            .set("Authorization", "Basic someRandomCredentials");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toBeDefined();
    });

    it("should return 401 when token is invalid or forged", async () => {
        const res = await request(app)
            .get("/api/auth/me")
            .set("Authorization", "Bearer invalid.jwt.token.signature");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toBeDefined();
    });
});
