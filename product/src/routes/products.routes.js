import { Router } from "express";
import { createAuthMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// POST /api/products route
router.post("/", createAuthMiddleware(["Seller", "Admin"]), (req, res) => {
    // Controller implementation ke liye placeholder
});

export default router;
