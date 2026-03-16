import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Transaction must be associated with sender account"],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Transaction must be associated with receiver account"],
        index: true
    },
    status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
        required: [true, "Transaction status is required"],
        default: "PENDING"
    },
    amount: {
        type: Number,
        required: [true, "Transaction amount is required"],
        min: [ 0, "Transaction amount cannot be negative"]
    },
    idempotencyKey: {
        type: String,
        required: [true, "Idempotency key is required"],
        unique: true,
        index: true
    },
}, {
    timestamps: true
});

const transactionModel = mongoose.model("transaction", transactionSchema);

export default transactionModel;
