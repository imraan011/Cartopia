import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userModel } from "../models/user.model.js";

// register karta hai naya user
export async function registerUser(req, res) {
    const { username, email, password, fullname } = req.body;

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
