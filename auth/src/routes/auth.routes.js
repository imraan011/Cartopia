import { Router } from "express";
import { registerUserValidations } from "../middlewares/validator.middleware.js";
import { register } from "../controllers/auth.controller.js";

const router = Router();

// POST /auth/register
router.post("/register", registerUserValidations, register);

export default router;
