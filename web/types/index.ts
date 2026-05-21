/**
 * @fileoverview Centralized type definitions for NexBank.
 * Includes User, Account, AccountWithBalance, Transaction, and Auth/Transfer request/response structures.
 */

/** User object returned by auth endpoints */
export interface User {
  _id: string;
  name: string;
  email: string;
}

/** Bank account — balance is derived from ledger, not stored here */
export interface Account {
  _id: string;
  user: string;
  status: "ACTIVE" | "FROZEN" | "CLOSED";
  currency: string;
  createdAt: string;
  updatedAt: string;
}

/** Account card data — account + its fetched balance */
export interface AccountWithBalance extends Account {
  balance: number;
}

/** Transaction between two accounts with idempotency protection */
export interface Transaction {
  _id: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

/** Auth response shape from login/register endpoints */
export interface AuthResponse {
  message: string;
  status: string;
  user: User;
  token: string;
}

/** Data needed to create a transaction */
export interface CreateTransactionData {
  fromAccount: string;
  toAccount: string;
  amount: number;
  idempotencyKey: string;
}
