import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import accountController from "../controllers/account.controller.js";

const router = express.Router();

/**
 * - POST /api/accounts
 * - Create a new account
 * - Protected Router
 */

router.post("/", authMiddleware, accountController.createAccountController);
router.get("/", authMiddleware, accountController.getUserAccounts);

export default router;