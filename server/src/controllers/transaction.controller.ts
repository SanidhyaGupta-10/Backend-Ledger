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

    if (
        fromUserAccount.status !== "ACTIVE" || 
        toUserAccount.status !== "ACTIVE"
    ) {
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
        })
    }

    /**
     * 4. Derive sender balance from ledger
     */

    const balance = await fromUserAccount.getBalance();

    if(balance < amount) {
        return res.status(400).json({
            message: "Insufficient balance"
        })
    }

    /**
     * 5. Create transaction (PENDING)
     */
    const session = await mongoose.startSession();
    session.startTransaction();

    const [transaction] = await transactionModel.create([
        {
            fromAccount: fromUserAccount._id,
            toAccount: toUserAccount._id,
            amount,
            idempotencyKey,
            status: "PENDING"
        }
    ], { session });


    const debitLedgerEntry = await ledgerModel.create([
        {
            account: fromUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT",
        }
    ], { session }); 

    await (() => {
        return new Promise((resolve, reject) => setTimeout(resolve, 1000 * 10))
    })()

    const creditLedgerEntry = await ledgerModel.create([
        {
            account: toUserAccount._id,
            type: "CREDIT",
            amount: amount,
            transaction: transaction._id,
        }
    ], { session });

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    /**
     *  10. Transaction email notification
     */

    

    return res.status(201).json({
        message: "Transaction created successfully",
        transaction: transaction
    })

};

/**
 * - Create initial funds transaction from system user
 * @description System user sends initial funds to a target account
 * @route POST /api/transactions/system/initial-funds
 * @access Private (System Users Only)
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

    const fromUserAccount = await accountModel.findOne({
        user: req.user?._id
    });

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        });
    }

    // Prevent self-transfer
    if (fromUserAccount._id.toString() === toUserAccount._id.toString()) {
        return res.status(400).json({
            message: "Cannot transfer funds to the same account"
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount: toUserAccount._id,
        amount,
        idempotencyKey,
        status: "PENDING"
    });

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    }], { session });

    const creditLedgerEntry = await ledgerModel.create([{
        account: toUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], { session });

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    });
}

export { createTransaction, createInitialFundsTransaction }