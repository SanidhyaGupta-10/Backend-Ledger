import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendRegistrationEmail } from "../service/email.service.js";
import tokenBlacklist from "../models/blacklist.model.js";
const JWT_SECRET = process.env.JWT_SECRET;
/**
 * 📝 User Registration Controller
 * @description Register a new user, issue HttpOnly JWT cookie, and send welcome email
 * @route POST /api/auth/register
 * @access Public
 */
export async function registerUser(req, res) {
    try {
        const { name, email, password } = req.body;
        /**
         * 📥 Step 1: Validate payload parameters
         */
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        /**
         * 🔍 Step 2: Check if email already exists in Database
         */
        const isExists = await userModel.findOne({ email });
        if (isExists) {
            return res.status(422).json({
                message: "User already exists",
                status: "failed"
            });
        }
        /**
         * 🆕 Step 3: Create User document in MongoDB (pre-save hook hashes password via bcrypt)
         */
        const user = await userModel.create({ name, email, password });
        /**
         * 🔑 Step 4: Sign JWT Token containing the user's MongoDB ID
         */
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
        /**
         * 🍪 Step 5: Issue HttpOnly cookie containing the signed token
         * httpOnly protects against XSS, secure guarantees HTTPS-only, sameSite protects against CSRF.
         */
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7
        });
        /**
         * 📤 Step 6: Return success response with user metrics
         */
        res.status(201).json({
            message: "User registered successfully",
            status: "success",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                systemUser: user.systemUser
            },
            token
        });
        /**
         * 📧 Step 7: Asynchronously send the greeting signup email
         */
        await sendRegistrationEmail(email, name);
    }
    catch (error) {
        console.error("❌ [Auth Controller] Registration Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
/**
 * 🔑 User Login Controller
 * @description Login user, verify password hash, and issue HttpOnly JWT cookie
 * @route POST /api/auth/login
 * @access Public
 */
export async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        /**
         * 📥 Step 1: Validate payload parameters
         */
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        /**
         * 🔍 Step 2: Fetch user document including select: false password field
         */
        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: "failed"
            });
        }
        /**
         * 🛡️ Step 3: Verify user password hash using bcrypt
         */
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid password",
                status: "failed"
            });
        }
        /**
         * 🔑 Step 4: Issue new JWT token
         */
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
        /**
         * 🍪 Step 5: Save token inside an HttpOnly cookie
         */
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7
        });
        /**
         * 📤 Step 6: Return successful response
         */
        res.status(200).json({
            message: "User logged in successfully",
            status: "success",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                systemUser: user.systemUser
            },
            token
        });
    }
    catch (error) {
        console.error("❌ [Auth Controller] Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
/**
 * 🚪 User Logout Controller
 * @description Invalidate user session by blacklisting the JWT and clearing the HTTP cookie
 * @route POST /api/auth/logout
 * @access Private
 */
export async function logoutUser(req, res) {
    try {
        /**
         * 📥 Step 1: Extract JWT token from cookie or authorization headers
         */
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(400).json({
                message: "No token provided"
            });
        }
        /**
         * 🛡️ Step 2: Check if token has already been blacklisted
         */
        const isBlacklisted = await tokenBlacklist.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({
                message: "Token is already blacklisted"
            });
        }
        /**
         * 🚫 Step 3: Register token in database blacklist collection
         */
        await tokenBlacklist.create({ token });
        /**
         * 🍪 Step 4: Clear the client HTTP cookie
         */
        res.clearCookie("token");
        res.status(200).json({
            message: "Logged out successfully",
            status: "success"
        });
    }
    catch (error) {
        console.error("❌ [Auth Controller] Logout Error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}
