import { Request, Response } from "express"
import transactionModel from "../models/transaction.model.js"
import ledgerModel from "../models/ledger.model.js"
import accountModel from "../models/account.model.js"
import mongoose from "mongoose"
import { sendTransactionEmail, sendFailureEmail } from "../service/email.service.js"

/**
 * 💸 Core Transaction Controller
 * THE 10-STEP DOUBLE-ENTRY TRANSFER FLOW:
 * 1. Validate request parameters
 * 2. Check for duplicate requests via idempotency key
 * 3. Verify that both source and target accounts are ACTIVE
 * 4. Verify sender has sufficient ledger-derived balance
 * 5. Initialize a database transaction session
 * 6. Create PENDING transaction record
 * 7. Write DEBIT ledger entry for sender
 * 8. Write CREDIT ledger entry for receiver
 * 9. Set transaction to COMPLETED
 * 10. Commit database writes atomically
 * 11. Trigger success email notification
 */

async function createTransaction(req: Request, res: Response) {
    /**
     * 📥 Step 1: Validate request input fields
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
     * 🛡️ Step 2: Idempotency safety check
     * Prevents double-spending or duplicate transfers if requests are retried.
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
     * 🚫 Step 3: Account Status Verification
     * Both sender and receiver accounts must be ACTIVE.
     */

    if (
        fromUserAccount.status !== "ACTIVE" || 
        toUserAccount.status !== "ACTIVE"
    ) {
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
        })
    }

    /**
     * 💰 Step 4: Derive sender balance from historical ledger entries
     * Ensures we don't let the account overdraft.
     */

    const balance = await fromUserAccount.getBalance();

    if(balance < amount) {
        return res.status(400).json({
            message: "Insufficient balance"
        })
    }

    /**
     * 🏦 Step 5: Start a MongoDB session for atomic transactional writes
     * Ensures that either all ledger modifications succeed together or none do.
     */
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        /**
         * 📝 Step 6: Create the Transaction document in PENDING state
         */
        const [transaction] = await transactionModel.create([
            {
                fromAccount: fromUserAccount._id,
                toAccount: toUserAccount._id,
                amount,
                idempotencyKey,
                status: "PENDING"
            }
        ], { session });

        /**
         * ➖ Step 7: Create the DEBIT entry on the sender's account
         */
        await ledgerModel.create([
            {
                account: fromUserAccount._id,
                amount: amount,
                transaction: transaction._id,
                type: "DEBIT",
            }
        ], { session }); 

        /**
         * ➕ Step 8: Create the CREDIT entry on the receiver's account
         * (Artificial 10-second delay removed for high-speed performance ⚡)
         */
        await ledgerModel.create([
            {
                account: toUserAccount._id,
                type: "CREDIT",
                amount: amount,
                transaction: transaction._id,
            }
        ], { session });

        /**
         * ✅ Step 9: Update the Transaction status to COMPLETED
         */
        transaction.status = "COMPLETED";
        await transaction.save({ session });

        /**
         * 🎉 Step 10: Commit all database updates atomically!
         */
        await session.commitTransaction();

        /**
         * ✉️ Step 11: Send Transactional Email Notification
         * Dispatched asynchronously to prevent slowing down the HTTP response.
         */
        if (req.user) {
            sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)
                .catch(err => console.error("📧 [Email Error] Failed to send transfer receipt:", err));
        }

        return res.status(201).json({
            message: "Transaction created successfully",
            transaction: transaction
        });

    } catch (error: any) {
        /**
         * 🔄 Rollback Phase: If anything fails, abort transaction and rollback all writes.
         */
        console.error("❌ [Transaction Error] Rollback initiated:", error.message || error);
        await session.abortTransaction();

        /**
         * ⚠️ Alert: Send failure email notification to the customer.
         */
        if (req.user) {
            sendFailureEmail(req.user.email, req.user.name, amount, toAccount)
                .catch(err => console.error("📧 [Email Error] Failed to send failure alert:", err));
        }

        return res.status(500).json({
            message: "Transaction processing failed, changes rolled back",
            error: error.message
        });

    } finally {
        /**
         * 🔒 Session Cleanup: Always close the session to prevent memory leaks.
         */
        session.endSession();
    }
}

/**
 * 👑 System Direct Credit Controller
 * @description Allows system users to credit/deposit funds bypass-checks
 * @route POST /api/transactions/system/initial-funds
 * @access Private (System Admin Only)
 */
async function createInitialFundsTransaction(req: Request, res: Response) {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        });
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    });

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        });
    }

    let fromUserAccount = await accountModel.findOne({
        user: req.user?._id
    });

    if (!fromUserAccount) {
        // Auto-create system user account if it doesn't exist
        fromUserAccount = await accountModel.create({
            user: req.user?._id
        });
    }

    // Prevent self-transfer
    if (fromUserAccount._id.toString() === toUserAccount._id.toString()) {
        return res.status(400).json({
            message: "Cannot transfer funds to the same account"
        });
    }

    /**
     * 🏦 Start DB session transaction for direct minting/credit operation
     */
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const transaction = new transactionModel({
            fromAccount: fromUserAccount._id,
            toAccount: toUserAccount._id,
            amount,
            idempotencyKey,
            status: "PENDING"
        });

        await ledgerModel.create([{
            account: fromUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session });

        await ledgerModel.create([{
            account: toUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session });

        transaction.status = "COMPLETED";
        await transaction.save({ session });

        /**
         * 🎉 Commit direct ledger injection
         */
        await session.commitTransaction();

        return res.status(201).json({
            message: "Initial funds transaction completed successfully",
            transaction: transaction
        });

    } catch (error: any) {
        console.error("❌ [System Credit Error] Rollback direct credit:", error.message || error);
        await session.abortTransaction();
        return res.status(500).json({
            message: "Failed to process system initial funds transaction",
            error: error.message
        });

    } finally {
        /**
         * 🔒 End the session safely
         */
        session.endSession();
    }
}

export { createTransaction, createInitialFundsTransaction }