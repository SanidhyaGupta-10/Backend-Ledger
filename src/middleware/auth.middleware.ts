import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import tokenBlacklist from "../models/blacklist.model.js";
import userModel from "../models/user.model.js";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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
        let decodedToken: any;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (verifyError: any) {
            console.warn(`[Auth] Token verification failed: ${verifyError.message}`);
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        // Fetch user from DB
        const user = await userModel.findById(decodedToken.userId);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        
        req.user = user;

        // Call next middleware
        next();
    } catch (error: any) {
        console.error("[Auth] Unexpected error in auth middleware:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};