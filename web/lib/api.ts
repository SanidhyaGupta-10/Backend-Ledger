/**
 * @fileoverview API service layer — typed functions for all backend endpoints.
 * Centralizes API calls so components don't deal with URLs or axios directly.
 */

import { api } from "./axios";

/* ── Type Definitions ── */

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

/* ── Auth APIs ── */

/** Register a new user → returns user + JWT token */
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

/** Login with email & password → returns user + JWT token */
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

/** Logout — blacklists the current JWT token on the backend */
export async function logoutUser(): Promise<void> {
  await api.post("/auth/logout");
}

/* ── Account APIs ── */

/** Fetch all accounts belonging to the logged-in user */
export async function fetchAccounts(): Promise<Account[]> {
  const response = await api.get<Account[]>("/accounts");
  return response.data;
}

/** Get balance for an account (calculated from ledger: credits - debits) */
export async function fetchBalance(accountId: string): Promise<number> {
  const response = await api.get<{ balance: number }>(
    `/accounts/balance/${accountId}`
  );
  return response.data.balance;
}

/** Create a new INR account for the authenticated user */
export async function createAccount(): Promise<Account> {
  const response = await api.post<Account>("/accounts");
  return response.data;
}

/* ── Transaction APIs ── */

/**
 * Create a money transfer. Uses idempotencyKey (UUID) to prevent
 * duplicate processing if the request is retried.
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
