import { hash } from "bcryptjs";
import { createRequire } from "module";
import { userModel } from "../models/user.model.js";

// jwt CJS hai — ESM default import me .sign undefined aata hai, isliye createRequire
const require = createRequire(import.meta.url);
const jwt = require("jsonwebtoken");

// register karta hai naya user
export async function registerUser(req, res) {
    const { username, email, password, fullname, roles } = req.body;

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
    const hashedPassword = await hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hashedPassword,
        fullname,
        roles: roles ?? "USER",
    });

    // Access token — short lived (15m)
    const accessToken = jwt.sign(
        {
            id: user._id,
            username: user.username,
            email: user.email,
            roles: user.roles,
        },
        process.env.JWT_SECRET ?? "dev-secret",
        { expiresIn: "15m" },
    );

    // Refresh token — longer lived (7d), httpOnly cookie me store karo
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
