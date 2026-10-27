/**
 * TDD test suite for POST /api/auth/logout
 *
 * Spec: Revokes current refresh session, clears cookies. Idempotent.
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

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

// ── Test Cases ────────────────────────────────────────────────────────────────

describe("POST /api/auth/logout", () => {
    it("should clear the refreshToken cookie and return 200 on logout", async () => {
        const res = await request(app)
            .post("/api/auth/logout")
            .set("Cookie", ["refreshToken=mockRefreshTokenValue"]);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const cookies = res.headers["set-cookie"];
        expect(cookies).toBeDefined();

        // Express res.clearCookie set karta hai expired date ya Max-Age=0
        const refreshCookie = cookies.find((c) =>
            c.startsWith("refreshToken="),
        );
        expect(refreshCookie).toBeDefined();
        expect(refreshCookie).toMatch(/(Expires=Thu, 01 Jan 1970|Max-Age=0)/i);
    });

    it("should be idempotent (return 200 even if no refreshToken cookie was sent)", async () => {
        const res = await request(app).post("/api/auth/logout");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
