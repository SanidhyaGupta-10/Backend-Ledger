import mongoose, { InferSchemaType, HydratedDocument } from "mongoose";
import ledgerModel from "./ledger.model.js";

const accountSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: [true, "Account must be associated with a user"], 
        index: true 
    },
    status: { 
        type: String, 
        enum: ["ACTIVE", "FROZEN", "CLOSED"], 
        default: "ACTIVE", 
        required: [true, "Status is required"] 
    },
    currency: { 
        type: String, 
        default: "INR", 
        required: [true, "Currency is required"] 
    }
}, { timestamps: true });

accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.getBalance = async function(this: HydratedDocument<any>) {
    const [res] = await ledgerModel.aggregate([
        { $match: { account: this._id } },
        { $group: { 
            _id: null, 
            totalDebit: { 
                $sum: {
                    $cond: [
                        { $eq: ["$type", "DEBIT"] },
                        "$amount",
                        0
                    ]
                }
            },
            totalCredit: {
                $sum: {
                    $cond: [
                        { $eq: ["$type", "CREDIT"] },
                        "$amount",
                        0
                    ]
                }
            }
        }},
        {
            $project: {
                _id: 0,
                balance: {
                    $subtract: ["$totalCredit", "$totalDebit"]
                }
            }
        }
    ]);
    
    if (res?.balance == null) {
        return 0;
    }

    return res.balance;
};

type IAccount = InferSchemaType<typeof accountSchema> & { getBalance(): Promise<number> };

export default mongoose.model<IAccount>("account", accountSchema);