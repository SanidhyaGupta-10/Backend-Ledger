import express from "express";
import { registerUser } from "../controller/auth.controller.js";

const router = express.Router();
/* 
    POST /api/auth/register
    Body: { name, email, password }
    Response: { message, user }
*/
router.post("/register", registerUser);



export default router;