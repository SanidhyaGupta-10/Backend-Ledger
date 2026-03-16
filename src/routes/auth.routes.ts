import express from "express";
import { loginUser, registerUser } from "../controllers/auth.controller.js";

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


export default router;