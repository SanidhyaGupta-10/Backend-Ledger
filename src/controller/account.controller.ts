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

export default createAccountController;