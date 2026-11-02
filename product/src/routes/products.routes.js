import { Router } from "express";
import multer from "multer";
import { createAuthMiddleware } from "../middlewares/auth.middleware.js";
import { productController } from "../controllers/product.controller.js";
import { createProductValidator } from "../middlewares/product.validator.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// POST /api/products route
router.post(
    "/",
    createAuthMiddleware(["Seller", "Admin", "SELLER", "ADMIN"]),
    upload.array("images", 5),
    createProductValidator,
    productController,
);

export default router;
