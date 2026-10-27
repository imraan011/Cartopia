/**
 * TDD test suite for POST /api/auth/logout
 *
 * Spec:
 * 1. Blacklists current refreshToken in Redis for 7 days.
 * 2. Clears refreshToken httpOnly cookie.
 * 3. Returns 400 if refreshToken is missing.
 */

import { describe, it, expect, afterAll } from "@jest/globals";
import "dotenv/config";
import request from "supertest";
import { app } from "../app.js";
import { redis } from "../db/redis.js";

describe("POST /api/auth/logout", () => {
    const TEST_TOKEN = "sample_refresh_token_for_logout_test";

    // test complete hone ke baad Redis se test key clean karo
    afterAll(async () => {
        await redis.del(`blacklist:${TEST_TOKEN}`);
    });

    // ── Happy Path ────────────────────────────────────────────────────────────

    it("should blacklist refreshToken in Redis, clear cookie, and return 200", async () => {
        const res = await request(app)
            .post("/api/auth/logout")
            .set("Cookie", [`refreshToken=${TEST_TOKEN}`]);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        // Redis me key blacklist hui ya nahi verify karo
        const isBlacklisted = await redis.get(`blacklist:${TEST_TOKEN}`);
        expect(isBlacklisted).toBe("true");

        // TTL verify karo — 7 days (604800 seconds) ke aas-paas hona chahiye
        const ttl = await redis.ttl(`blacklist:${TEST_TOKEN}`);
        expect(ttl).toBeGreaterThan(0);
        expect(ttl).toBeLessThanOrEqual(7 * 24 * 60 * 60);

        // Cookie clear hone ka header verify karo
        const cookies = res.headers["set-cookie"];
        expect(cookies).toBeDefined();

        const refreshCookie = cookies.find((c) =>
            c.startsWith("refreshToken="),
        );
        expect(refreshCookie).toBeDefined();
        expect(refreshCookie).toMatch(/(Expires=Thu, 01 Jan 1970|Max-Age=0)/i);
    });

    // ── Failure Cases (400) ───────────────────────────────────────────────────

    it("should return 400 when refreshToken cookie is missing", async () => {
        const res = await request(app).post("/api/auth/logout");

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toBe("No refresh token provided");
    });
});
