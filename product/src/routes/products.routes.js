import { Router } from "express";
import { createAuthMiddleware } from "../middlewares/auth.middleware.js";
import { productController } from "../controllers/product.controller.js";
import { createProductValidator } from "../middlewares/product.validator.js";

const router = Router();

// POST /api/products route
router.post(
    "/",
    createAuthMiddleware(["Seller", "Admin"]),
    upload.array("images", 5),
    createProductValidator,
    productController,
);

export default router;
