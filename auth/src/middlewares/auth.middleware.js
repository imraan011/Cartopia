import { createRequire } from "module";

// jwt CJS module hai — ESM compatibility ke liye createRequire use kar rahe hain
const require = createRequire(import.meta.url);
const jwt = require("jsonwebtoken");

/**
 * Access token verification middleware.
 * Validates 'Authorization: Bearer <token>' header and attaches decoded payload to req.user.
 */
export async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    // header missing ya Bearer format me na ho toh 401
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            error: { message: "Authorization header missing or invalid" },
        });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            error: { message: "Token missing in Authorization header" },
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // authenticated user details request object me attach karo
        req.user = decoded;
        return next();
    } catch {
        // token expired ya tampered hone par 401
        return res.status(401).json({
            success: false,
            error: { message: "Invalid or expired token" },
        });
    }
}
