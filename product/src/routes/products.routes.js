import { Router } from "express";

const router = Router();

// POST /api/products route
router.post("/", (req, res) => {
    // Controller implementation ke liye placeholder
    res.status(501).json({ message: "Not implemented" });
});

export default router;
