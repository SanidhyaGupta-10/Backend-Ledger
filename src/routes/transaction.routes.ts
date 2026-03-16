import express from "express";
import { authMiddleware, authSystemUserMiddleware } from "../middleware/auth.middleware.js";

import { createTransaction, createInitialFundsTransaction } from "../controllers/transaction.controller.js";

const transactionRoutes = express.Router();

/** 
 * POST /api/transactions/
 * @description Create a new transaction
 * @access Private
 */
transactionRoutes.post("/", authMiddleware, createTransaction);

/** 
 * POST /api/transactions/system/initial-funds
 * @description Create initial funds transaction from system user
 * @access Private (System Users Only)
 */
transactionRoutes.post("/system/initial-funds", authSystemUserMiddleware, createInitialFundsTransaction);

export default transactionRoutes;