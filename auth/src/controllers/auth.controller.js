import { hash } from "bcryptjs";
import { createRequire } from "module";
import { randomBytes } from "crypto";
import { userModel } from "../models/user.model.js";

// jwt CJS hai — ESM default import me .sign undefined aata hai, isliye createRequire
const require = createRequire(import.meta.url);
const jwt = require("jsonwebtoken");

// Production me env se aayega. Dev/test me har restart pe naya random secret —
// hardcode se kahin better, source code se guess nahi ho sakta.
const JWT_SECRET = process.env.JWT_SECRET ?? randomBytes(32).toString("hex");
const JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET ?? randomBytes(32).toString("hex");

// register karta hai naya user
export async function registerUser(req, res) {
    try {
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
            JWT_SECRET,
            { expiresIn: "15m" },
        );

        // Refresh token — longer lived (7d), httpOnly cookie me store karo
        const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, {
            expiresIn: "7d",
        });

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
    } catch (error) {
        console.error("Error in registerUser:", error);
        return res.status(500).json({
            success: false,
            error: { message: "Internal server error" },
        });
    }
}

// login karta hai existing user
export async function loginUser(req, res) {
    try {
        const { username, email, password } = req.body;
        

    } catch (error) {}
}
