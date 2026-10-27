/**
 * TDD test suite for User Addresses APIs:
 * 1. POST   /api/auth/users/me/addresses – Add address (validates pincode & phone)
 * 2. GET    /api/auth/users/me/addresses – List saved addresses
 * 3. DELETE /api/auth/users/me/addresses/:addressId – Remove address
 */

import { describe, it, expect } from "@jest/globals";
import "dotenv/config";
import request from "supertest";
import { app } from "../app.js";

const TEST_USER = {
    username: "address_user",
    email: "address_user@example.com",
    password: "Password@123",
    fullname: { firstname: "Jane", lastname: "Doe" },
};

const SAMPLE_ADDRESS = {
    street: "123 MG Road, Sector 4",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    country: "India",
    phone: "9876543210",
    isDefault: true,
};

// Helper: fresh user register karke accessToken return karta hai
const getAuthToken = async () => {
    const res = await request(app).post("/api/auth/register").send(TEST_USER);
    return res.body.data.accessToken;
};

describe("User Addresses APIs (/api/auth/users/me/addresses)", () => {
    // ═══════════════════════════════════════════════════════════════════════════
    // 1. POST /api/auth/users/me/addresses (Add Address)
    // ═══════════════════════════════════════════════════════════════════════════
    describe("POST /api/auth/users/me/addresses", () => {
        it("should return 201 and add new address successfully", async () => {
            const token = await getAuthToken();

            const res = await request(app)
                .post("/api/auth/users/me/addresses")
                .set("Authorization", `Bearer ${token}`)
                .send(SAMPLE_ADDRESS);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);

            const { address } = res.body.data;
            expect(address).toBeDefined();
            expect(address._id).toBeDefined();
            expect(address.street).toBe(SAMPLE_ADDRESS.street);
            expect(address.city).toBe(SAMPLE_ADDRESS.city);
            expect(address.state).toBe(SAMPLE_ADDRESS.state);
            expect(address.pincode).toBe(SAMPLE_ADDRESS.pincode);
            expect(address.country).toBe(SAMPLE_ADDRESS.country);
        });

        // ── Validation Failures (400) ─────────────────────────────────────────

        it("should return 400 when street is missing", async () => {
            const token = await getAuthToken();
            const { street, ...invalidAddress } = SAMPLE_ADDRESS;

            const res = await request(app)
                .post("/api/auth/users/me/addresses")
                .set("Authorization", `Bearer ${token}`)
                .send(invalidAddress);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error.message).toBeDefined();
        });

        it("should return 400 when pincode is invalid format (not 6 digits)", async () => {
            const token = await getAuthToken();

            const res = await request(app)
                .post("/api/auth/users/me/addresses")
                .set("Authorization", `Bearer ${token}`)
                .send({ ...SAMPLE_ADDRESS, pincode: "1234" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error.message).toBeDefined();
        });

        it("should return 400 when phone number is invalid (not 10 digits)", async () => {
            const token = await getAuthToken();

            const res = await request(app)
                .post("/api/auth/users/me/addresses")
                .set("Authorization", `Bearer ${token}`)
                .send({ ...SAMPLE_ADDRESS, phone: "invalid-phone" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error.message).toBeDefined();
        });

        // ── Auth Failure (401) ────────────────────────────────────────────────

        it("should return 401 when token is missing", async () => {
            const res = await request(app)
                .post("/api/auth/users/me/addresses")
                .send(SAMPLE_ADDRESS);

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. GET /api/auth/users/me/addresses (List Addresses)
    // ═══════════════════════════════════════════════════════════════════════════
    describe("GET /api/auth/users/me/addresses", () => {
        it("should return 200 and empty array when user has no saved addresses", async () => {
            const token = await getAuthToken();

            const res = await request(app)
                .get("/api/auth/users/me/addresses")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data.addresses)).toBe(true);
            expect(res.body.data.addresses).toHaveLength(0);
        });

        it("should return 200 and list all saved addresses for the user", async () => {
            const token = await getAuthToken();

            // Pehle ek address add karo
            await request(app)
                .post("/api/auth/users/me/addresses")
                .set("Authorization", `Bearer ${token}`)
                .send(SAMPLE_ADDRESS);

            const res = await request(app)
                .get("/api/auth/users/me/addresses")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.addresses).toHaveLength(1);
            expect(res.body.data.addresses[0].city).toBe(SAMPLE_ADDRESS.city);
        });

        it("should return 401 when token is missing", async () => {
            const res = await request(app).get("/api/auth/users/me/addresses");

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. DELETE /api/auth/users/me/addresses/:addressId (Remove Address)
    // ═══════════════════════════════════════════════════════════════════════════
    describe("DELETE /api/auth/users/me/addresses/:addressId", () => {
        it("should return 200 and delete existing address by id", async () => {
            const token = await getAuthToken();

            // Address add karo
            const createRes = await request(app)
                .post("/api/auth/users/me/addresses")
                .set("Authorization", `Bearer ${token}`)
                .send(SAMPLE_ADDRESS);

            const addressId = createRes.body.data.address._id;

            // Address delete karo
            const deleteRes = await request(app)
                .delete(`/api/auth/users/me/addresses/${addressId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(deleteRes.status).toBe(200);
            expect(deleteRes.body.success).toBe(true);

            // Verify karo ki address sach me delete ho gaya
            const listRes = await request(app)
                .get("/api/auth/users/me/addresses")
                .set("Authorization", `Bearer ${token}`);

            expect(listRes.body.data.addresses).toHaveLength(0);
        });

        it("should return 404 when addressId does not exist", async () => {
            const token = await getAuthToken();
            const fakeMongoId = "507f1f77bcf86cd799439011";

            const res = await request(app)
                .delete(`/api/auth/users/me/addresses/${fakeMongoId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.error.message).toBeDefined();
        });

        it("should return 401 when token is missing", async () => {
            const fakeMongoId = "507f1f77bcf86cd799439011";
            const res = await request(app).delete(
                `/api/auth/users/me/addresses/${fakeMongoId}`,
            );

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });
});

