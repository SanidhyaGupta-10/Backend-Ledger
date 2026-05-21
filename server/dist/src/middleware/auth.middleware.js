import jwt from "jsonwebtoken";
import tokenBlacklist from "../models/blacklist.model.js";
import userModel from "../models/user.model.js";
/**
 * 🔒 Private Customer Authorization Middleware
 * @description Extracts and decodes customer JWT token. Resolves user from database.
 */
export const authMiddleware = async (req, res, next) => {
    try {
        /**
         * 📥 Step 1: Extract JWT token from HttpOnly cookies or Authorization header bearer prefix
         */
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        /**
         * 🚫 Step 2: Validate that token isn't registered in the logout blacklist collection
         */
        const isBlacklisted = await tokenBlacklist.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        /**
         * ⚙️ Step 3: Validate application environment setup
         */
        if (!process.env.JWT_SECRET) {
            console.error("[Auth] FATAL: JWT_SECRET is not defined in environment variables");
            return res.status(500).json({ error: "Server configuration error" });
        }
        /**
         * 🔑 Step 4: Verify signature and expiration of user's JWT
         */
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        }
        catch (verifyError) {
            console.warn(`[Auth] Token verification failed: ${verifyError.message}`);
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        /**
         * 🔍 Step 5: Verify user existence in database mapping
         */
        const user = await userModel.findById(decodedToken.userId);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        /**
         * 💾 Step 6: Set authenticated user reference on the Express Request object for down-chain use
         */
        req.user = user;
        /**
         * 🚀 Step 7: Pass control to the next down-chain controller handler
         */
        next();
    }
    catch (error) {
        console.error("[Auth] Unexpected error in auth middleware:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
/**
 * 👑 Admin/System Authorization Middleware
 * @description Extracts JWT token, checks role permissions, and verifies systemUser level.
 */
export const authSystemUserMiddleware = async (req, res, next) => {
    try {
        /**
         * 📥 Step 1: Extract JWT token from cookies or authorization header bearer prefix
         */
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access, token is missing"
            });
        }
        /**
         * 🚫 Step 2: Validate token is not blacklisted
         */
        const isBlacklisted = await tokenBlacklist.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({
                message: "Unauthorized access, token is invalid"
            });
        }
        /**
         * ⚙️ Step 3: Validate application environment setup
         */
        if (!process.env.JWT_SECRET) {
            console.error("[Auth] FATAL: JWT_SECRET is not defined in environment variables");
            return res.status(500).json({ error: "Server configuration error" });
        }
        /**
         * 🔑 Step 4: Verify signature and expiration of JWT
         */
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            /**
             * 🔍 Step 5: Resolve user from DB along with the select: false systemUser role boolean
             */
            const user = await userModel.findById(decoded.userId).select("+systemUser");
            if (!user) {
                return res.status(401).json({
                    message: "Unauthorized access, user not found"
                });
            }
            /**
             * 🛡️ Step 6: Guard check: Check if user belongs to systemUser administrative group
             */
            if (!user.systemUser) {
                return res.status(403).json({
                    message: "Forbidden access, not a system user"
                });
            }
            /**
             * 💾 Step 7: Map verified admin reference onto Request object
             */
            req.user = user;
            return next();
        }
        catch (err) {
            return res.status(401).json({
                message: "Unauthorized access, token is invalid"
            });
        }
    }
    catch (error) {
        console.error("[Auth] Unexpected error in auth system user middleware:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
