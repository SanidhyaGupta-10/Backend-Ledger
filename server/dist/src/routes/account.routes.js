import express from "express";
import { authMiddleware, authSystemUserMiddleware } from "../middleware/auth.middleware.js";
import accountController from "../controllers/account.controller.js";
const router = express.Router();
/**
 * - POST /api/accounts
 * - Create a new account
 * - Protected Router
 */
router.post("/", authMiddleware, accountController.createAccountController);
/***
 * - GET /api/accounts
 * - Get all accounts
 * - Protected Router
 */
router.get("/", authMiddleware, accountController.getUserAccounts);
/**
 * - GET /api/accounts/balance/:accountId
 * - Get account balance
 * - Protected Router
 */
router.get("/balance/:accountId", authMiddleware, accountController.getAccountBalance);
/**
 * - GET /api/accounts/system/all
 * - Get all accounts (System Admin Only)
 * - Protected Router
 */
router.get("/system/all", authSystemUserMiddleware, accountController.getAllAccountsSystem);
export default router;
