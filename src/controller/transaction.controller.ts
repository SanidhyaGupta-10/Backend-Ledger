import { Request, Response } from "express"
import transactionModel from "../models/transaction.model.js"
import ledgerModel from "../models/ledger.model.js"
import accountModel from "../models/account.model.js"
import mongoose from "mongoose"
import { sendRegistrationEmail } from "../service/email.service.js"

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
     * 1. Validate request
     * 2. Validate idempotency key
     * 3. Check account status
     * 4. Derive sender balance from ledger
     * 5. Create transaction (PENDING)
     * 6. Create DEBIT ledger entry
     * 7. Create CREDIT ledger entry
     * 8. Mark transaction COMPLETED
     * 9. Commit MongoDB session
     * 10. Send email notification
 */

async function createTransaction(req: Request, res: Response) {
    /**
     * 1. Validate request
     */
    const {
        fromAccount,
        toAccount,
        amount,
        idempotencyKey
    } = req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const fromUserAccount = await accountModel.findOne({ 
        _id: fromAccount 
    });
    const toUserAccount = await accountModel.findOne({ 
        _id: toAccount 
    });

    if(!fromUserAccount || !toUserAccount) {
        return res.status(404).json({ message: "Account not found" });
    }

     /**
     * 2. Idempotency check
     */
    const existingTransaction = await transactionModel.findOne({
        idempotencyKey
    });

    if (existingTransaction) {
        if (existingTransaction.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: existingTransaction
            })

        }

        if (existingTransaction.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is still processing",
            })
        }

        if (existingTransaction.status === "FAILED") {
            return res.status(500).json({
                message: "Transaction processing failed, please retry"
            })
        }

        if (existingTransaction.status === "REVERSED") {
            return res.status(500).json({
                message: "Transaction was reversed, please retry"
            })
        }
    }

    /**
     * 3. Check account status
     */

}