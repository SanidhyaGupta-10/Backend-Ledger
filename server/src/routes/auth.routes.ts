import express from "express";
import { loginUser, registerUser, logoutUser } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();
/* 
    POST /api/auth/register
    Body: { name, email, password }
    Response: { message, user }
*/
router.post("/register", registerUser);

/* 
    POST /api/auth/login
    Body: { email, password }
    Response: { message, user }
*/
router.post("/login", loginUser);

/* 
    POST /api/auth/logout
    Headers: Authorization Bearer token
    Response: { message, status }
*/
router.post("/logout", authMiddleware, logoutUser);


export default router;