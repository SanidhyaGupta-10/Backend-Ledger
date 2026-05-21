/**
 * @fileoverview API service layer — typed functions for all backend endpoints.
 * Centralizes API calls so components don't deal with URLs or axios directly.
 * 🔌 Bridges Next.js state layers to Express ledger endpoints.
 */

import { api } from "./axios";
import type {
  User,
  Account,
  Transaction,
  AuthResponse,
  CreateTransactionData,
  SystemAccount,
} from "@/types";

/* ── Auth APIs ── */

/**
 * 📝 Register User
 * Registers a new user on the system and auto-authenticates via JWT.
 */
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", {
    name,
    email,
    password,
  });
  return response.data;
}

/**
 * 🔑 Login User
 * Authenticates user credentials and resolves session payload.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  return response.data;
}

/**
 * 🚪 Logout User
 * Revokes current session tokens and clears HTTP authorization keys.
 */
export async function logoutUser(): Promise<void> {
  await api.post("/auth/logout");
}

/* ── Account APIs ── */

/**
 * 🏢 Fetch Personal Accounts
 * Retrieves all ledger-tracked accounts owned by the authenticated customer.
 */
export async function fetchAccounts(): Promise<Account[]> {
  const response = await api.get<{ accounts: Account[] }>("/accounts");
  return response.data.accounts;
}

/**
 * 🧮 Fetch Account Balance
 * Returns the net balance (sum of credits minus sum of debits) for a specific account.
 */
export async function fetchBalance(accountId: string): Promise<number> {
  const response = await api.get<{ balance: number }>(
    `/accounts/balance/${accountId}`
  );
  return response.data.balance;
}

/**
 * ➕ Create Account
 * Provisions a new active INR currency account for the customer.
 */
export async function createAccount(): Promise<Account> {
  const response = await api.post<{ account: Account }>("/accounts");
  return response.data.account;
}

/* ── Transaction APIs ── */

/**
 * 💸 Create Customer Transaction
 * Dispatches a customer transfer request using a client-generated UUID
 * as an idempotency key to protect against packet retries.
 */
export async function createTransaction(
  data: CreateTransactionData
): Promise<Transaction> {
  const response = await api.post<{ transaction: Transaction }>(
    "/transactions",
    data
  );
  return response.data.transaction;
}

/* ── System Admin APIs ── */

/**
 * 👑 Fetch All System Accounts (Admin Mode)
 * Retrieves global ledger records including owner details, restricted to system administrator accounts.
 */
export async function fetchAllAccountsSystem(): Promise<SystemAccount[]> {
  const response = await api.get<{ accounts: SystemAccount[] }>(
    "/accounts/system/all"
  );
  return response.data.accounts;
}

/**
 * 🚀 Inject Direct Credit (Admin Mode)
 * Bypasses ordinary user validation to seed initial or reserve ledger balances.
 * Generates an automatic idempotency key.
 */
export async function sendInitialFundsSystem(
  toAccount: string,
  amount: number
): Promise<Transaction> {
  const response = await api.post<{ transaction: Transaction }>(
    "/transactions/system/initial-funds",
    {
      toAccount,
      amount,
      idempotencyKey: crypto.randomUUID(),
    }
  );
  return response.data.transaction;
}
