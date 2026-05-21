import accountModel from "../models/account.model.js";
/**
 * 🏦 Create New Ledger Account
 * @route POST /api/accounts
 * @access Private
 */
async function createAccountController(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        /**
         * 🆕 Create a new account document associated with the logged-in user
         */
        const account = await accountModel.create({
            user: user._id,
        });
        return res.status(201).json({
            account,
        });
    }
    catch (error) {
        console.error("❌ [Account Controller] Error creating account:", error);
        return res.status(500).json({ error: "Failed to create account" });
    }
}
/**
 * 📂 Get All Accounts for Current User
 * @route GET /api/accounts
 * @access Private
 */
async function getUserAccounts(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        /**
         * 🔍 Retrieve all accounts mapped to the authenticated user's ID
         */
        const accounts = await accountModel.find({ user: user._id });
        return res.status(200).json({
            accounts,
        });
    }
    catch (error) {
        console.error("❌ [Account Controller] Error fetching user accounts:", error);
        return res.status(500).json({ error: "Failed to fetch accounts" });
    }
}
/**
 * 📊 Get Specific Account Balance (Ledger-derived)
 * @route GET /api/accounts/balance/:accountId
 * @access Private
 */
async function getAccountBalance(req, res) {
    try {
        const { accountId } = req.params;
        /**
         * 🔍 Fetch the user account and verify ownership
         */
        const account = await accountModel.findOne({
            _id: accountId,
            user: req.user?._id
        });
        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }
        /**
         * 🧮 Compute the actual balance from double-entry ledger database transactions (credits - debits)
         */
        const balance = await account.getBalance();
        return res.status(200).json({
            balance: balance,
        });
    }
    catch (error) {
        console.error("❌ [Account Controller] Error getting account balance:", error);
        return res.status(500).json({ error: "Failed to fetch account balance" });
    }
}
/**
 * 👑 Admin Control: Get All Registered System Accounts with Balances
 * @route GET /api/accounts/system/all
 * @access Private (System Admin Only)
 */
async function getAllAccountsSystem(req, res) {
    try {
        /**
         * 🔍 Retrieve all system accounts with owner credentials populated
         */
        const accounts = await accountModel.find().populate("user", "name email");
        /**
         * 🧮 Compute balances for all accounts concurrently in parallel
         */
        const accountsWithBalances = await Promise.all(accounts.map(async (acc) => {
            const balance = await acc.getBalance();
            return {
                _id: acc._id,
                user: acc.user,
                status: acc.status,
                currency: acc.currency,
                createdAt: acc.createdAt,
                updatedAt: acc.updatedAt,
                balance: balance
            };
        }));
        return res.status(200).json({
            accounts: accountsWithBalances
        });
    }
    catch (error) {
        console.error("❌ [System Accounts] Error fetching all accounts:", error);
        return res.status(500).json({ error: "Failed to fetch all system accounts" });
    }
}
export default {
    createAccountController,
    getUserAccounts,
    getAccountBalance,
    getAllAccountsSystem
};
