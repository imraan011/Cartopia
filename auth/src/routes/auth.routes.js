import { Router } from "express";
import {
    loginUserValidations,
    registerUserValidations,
} from "../middlewares/validator.middleware.js";
import {
    getMe,
    getUserAddresses,
    loginUser,
    logoutUser,
    registerUser,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// auth routes
router.post("/register", registerUserValidations, registerUser);
router.post("/login", loginUserValidations, loginUser);
router.post("/logout", logoutUser);
router.get("/me", authMiddleware, getMe);
router.get("/users/me/addresses", authMiddleware, getUserAddresses);

export default router;
