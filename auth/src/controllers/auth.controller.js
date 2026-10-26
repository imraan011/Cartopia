import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userModel } from "../models/user.model.js";

// register karta hai naya user
export async function register(req, res) {
    const { username, email, password, fullname } = req.body;

    // basic validation — required fields check
    if (
        !username ||
        !email ||
        !password ||
        !fullname?.firstname ||
        !fullname?.lastname
    ) {
        return res.status(400).json({
            success: false,
            error: {
                message:
                    "username, email, password, fullname.firstname and fullname.lastname are required",
            },
        });
    }

    // email/username duplicate check
    const existing = await userModel.findOne({
        $or: [{ email }, { username }],
    });
    if (existing) {
        const field = existing.email === email ? "email" : "username";
        return res.status(409).json({
            success: false,
            error: { message: `${field} is already taken` },
        });
    }

    // password hash karo — cost factor 10
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hashedPassword,
        fullname,
        roles: roles ?? "USER",
    });

    // Access token — short lived (15m)
    const accessToken = jwt.sign(
        { id: user._id, roles: user.roles },
        process.env.JWT_SECRET ?? "dev-secret",
        { expiresIn: "15m" },
    );

    // Refresh token — longer lived (7d), stored in httpOnly cookie
    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret",
        { expiresIn: "7d" },
    );

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
        success: true,
        data: {
            accessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                roles: user.roles,
            },
        },
    });
}
