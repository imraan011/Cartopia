import { Router } from "express";
import {
    addAddressValidations,
    loginUserValidations,
    registerUserValidations,
} from "../middlewares/validator.middleware.js";
import {
    addUserAddress,
    deleteUserAddress,
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

// address routes
router.get("/users/me/addresses", authMiddleware, getUserAddresses);
router.post("/users/me/addresses",authMiddleware,addAddressValidations,addUserAddress,);
router.delete( "/users/me/addresses/:addressId", authMiddleware, deleteUserAddress,);

export default router;
