import accountModel from "../models/account.model.js";
import type { Request, Response } from "express";

async function createAccountController(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const account = await accountModel.create({
    user: user._id,
  });

  res.status(201).json({
    account,
  });
}

async function getUserAccounts(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const accounts = await accountModel.find({ user: user._id });
  res.status(200).json({
    accounts,
  });
}

async function getAccountBalance(req: Request, res: Response){
  const { accountId } = req.params;

  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user?._id
  })

  if(!account){
    return res.status(404).json({ error: "Account not found" });
  }

  const balance = await account.getBalance();

  res.status(200).json({
    balance: balance,
  });
}

async function getAllAccountsSystem(req: Request, res: Response) {
  try {
    const accounts = await accountModel.find().populate("user", "name email");
    
    const accountsWithBalances = await Promise.all(
      accounts.map(async (acc) => {
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
      })
    );

    res.status(200).json({
      accounts: accountsWithBalances
    });
  } catch (error: any) {
    console.error("[System Accounts] Error fetching all accounts:", error);
    res.status(500).json({ error: "Failed to fetch all system accounts" });
  }
}

export default { 
  createAccountController, 
  getUserAccounts,
  getAccountBalance,
  getAllAccountsSystem
};