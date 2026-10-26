import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userModel } from "../models/user.model.js";

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
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hashedPassword,
        fullname,
    });

    // JWT token generate karo
    const token = jwt.sign(
        {
            id: user._id,
            username: user.username,
            email: user.email,
            roles: user.roles,
        },
        process.env.JWT_SECRET,
    );

    // set cookie with the token
    res.cookie("token", token, {
        httpOnly: true,
        secure: true, // set to true in production
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    return res.status(201).json({
        success: true,
        data: {
            accessToken: token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                roles: user.roles,
            },
        },
    });
}
