import jwt from "jsonwebtoken";
import tokenBlacklist from "../models/blacklist.model.js";
export const authMiddleware = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Check if token is blacklisted
        const isBlacklisted = await tokenBlacklist.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!process.env.JWT_SECRET) {
            console.error("[Auth] FATAL: JWT_SECRET is not defined in environment variables");
            return res.status(500).json({ error: "Server configuration error" });
        }
        // Verify token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        }
        catch (verifyError) {
            console.warn(`[Auth] Token verification failed: ${verifyError.message}`);
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        // Attach user to request
        if (typeof decodedToken !== "object" || !decodedToken) {
            return res.status(401).json({ error: "Invalid token payload" });
        }
        req.user = decodedToken;
        // Call next middleware
        next();
    }
    catch (error) {
        console.error("[Auth] Unexpected error in auth middleware:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
