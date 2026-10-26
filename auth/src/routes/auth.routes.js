import { Router } from "express";
import { registerUserValidations } from "../middlewares/validator.middleware.js";
import { registerUser } from "../controllers/auth.controller.js";

const router = Router();

// POST /auth/register
router.post("/register", registerUserValidations, registerUser);

export default router;
