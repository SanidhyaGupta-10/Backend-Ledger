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

export default { 
  createAccountController, 
  getUserAccounts 
};