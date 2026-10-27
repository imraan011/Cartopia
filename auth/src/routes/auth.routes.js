import { Router } from "express";
import {
    loginUserValidations,
    registerUserValidations,
} from "../middlewares/validator.middleware.js";
import { loginUser, registerUser } from "../controllers/auth.controller.js";

const router = Router();

// POST /auth/register
router.post("/register", registerUserValidations, registerUser);
router.post("/login", loginUserValidations, loginUser);

export default router;
