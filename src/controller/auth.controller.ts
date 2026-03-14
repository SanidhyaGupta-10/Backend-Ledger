import type { Request, Response } from "express";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";


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

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}