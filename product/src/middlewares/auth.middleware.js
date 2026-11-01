import jwt from "jsonwebtoken";

export function createAuthMiddleware(roles = ["USER"]) {
    return function authMiddleware(req, res, next) {
        const token =
            req.cookies.token || req.headers.authorisation?.split(" ")[1];
        if (!token) {
            return res
                .status(401)
                .json({ message: "Unauthorized! token not found" });
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!roles.includes(decoded.role)) {
                return res.status(403).json({
                    message:
                        "Forbidden! You don't have permission to access this resource",
                });
            }

            req.user = decoded;
            next();
        } catch (error) {
            return res
                .status(401)
                .json({ message: "Unauthorized! Invalid token" });
        }
    };
}
