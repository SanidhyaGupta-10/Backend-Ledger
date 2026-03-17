import type { Request, Response } from "express";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendRegistrationEmail } from "../service/email.service.js";
import tokenBlacklist from "../models/blacklist.model.js";


const JWT_SECRET = process.env.JWT_SECRET!;
/**
 * @description Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export async function registerUser(req: Request, res: Response) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const isExists = await userModel.findOne({ email });
        if (isExists) {
            return res.status(422).json({ 
                message: "User already exists", 
                status: "failed"
            });
        }

        // Create User
        const user = await userModel.create({ name, email, password });
        
        // Generate Token
        const token = jwt.sign(
            { userId: user._id }, 
            JWT_SECRET, 
            { expiresIn: "1h" }
        );
        
        // Set Cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7
        });

        // Send response
        res.status(201).json({ 
            message: "User registered successfully", 
            status: "success",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });

        await sendRegistrationEmail(email, name);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

/**
 * @description Login user
 * @route POST /api/auth/login
 * @access Public
 */
export async function loginUser(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user exists
        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({ 
                message: "User not found",
                status: "failed"
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: "Invalid password",
                status: "failed"
            });
        }

        // Generate Token
        const token = jwt.sign(
            { userId: user._id }, 
            JWT_SECRET, 
            { expiresIn: "1h" }
        );
        
        // Set Cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7
        });

        // Send response
        res.status(200).json({ 
            message: "User logged in successfully", 
            status: "success",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

/**
 * @description Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
export async function logoutUser(req: Request, res: Response) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).json({ 
                message: "No token provided" 
            });
        }

        // Verify the token
        const isBlacklisted = await tokenBlacklist.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ 
                message: "Token is blacklisted" 
            });
        }

        // Blacklist the token
        await tokenBlacklist.create({ token });

        // Clear the cookie
        res.clearCookie("token");

        res.status(200).json({ 
            message: "Logged out successfully", 
            status: "success" 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            message: "Internal server error" 
        });
    }
}