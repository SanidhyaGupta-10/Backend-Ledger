/**
 * @fileoverview useTransfer hook — manages the complex multi-step state machine for transfers,
 * validates inputs (such as matching accounts or insufficient balance), handles submission with idempotency,
 * and handles form resets.
 * 💸 Powers customer-to-customer atomic ledger transfers.
 */
"use client";

import { useState, useMemo } from "react";
import { createTransaction } from "@/lib/api";
import type { AccountWithBalance } from "@/types";

/**
 * 💸 Custom Hook: useTransfer
 * Governs the multi-stage transaction state machine (`form` -> `confirm` -> `success` / `error`).
 * Implements high-integrity validations and auto-generates idempotency keys.
 */
export function useTransfer(accounts: AccountWithBalance[], onResetSuccess?: () => void) {
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"form" | "confirm" | "success" | "error">("form");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  /**
   * 🏦 Memoized State: Selected Sender Account
   * Fetches full account object matching selected ID to retrieve real-time balance.
   */
  const selectedAccount = useMemo(() => {
    return accounts.find((a) => a._id === fromAccount);
  }, [accounts, fromAccount]);

  /**
   * 🔍 Interactive Action: Review Transfer Parameters
   * Performs thorough front-end validations (e.g. self-transfers, funds bounds)
   * before advancing to confirmation screen.
   */
  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fromAccount || !toAccount || !amount) {
      setError("All fields are required 📋");
      return;
    }
    if (fromAccount === toAccount) {
      setError("Cannot send to the same account 🚫");
      return;
    }
    if (Number(amount) <= 0) {
      setError("Amount must be positive 💰");
      return;
    }
    if (selectedAccount && Number(amount) > selectedAccount.balance) {
      setError("Insufficient balance in source account ❌");
      return;
    }

    setStep("confirm");
  };

  /**
   * 🚀 Interactive Action: Execute Ledger Transfer
   * Dispatches transaction data to DB controller.
   * Generates a random UUID on the client side as a secure idempotency key.
   */
  const handleSend = async () => {
    setSending(true);
    setError("");

    try {
      await createTransaction({
        fromAccount,
        toAccount,
        amount: Number(amount),
        idempotencyKey: crypto.randomUUID(),
      });
      setStep("success");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Transaction failed. Please try again. 😢";
      setError(msg);
      setStep("error");
    } finally {
      setSending(false);
    }
  };

  /**
   * 🧹 Interactive Action: Reset State
   * Cleans form inputs, clears validation flags, and refreshes parent dashboards.
   */
  const handleReset = () => {
    setFromAccount("");
    setToAccount("");
    setAmount("");
    setError("");
    setStep("form");
    if (onResetSuccess) {
      onResetSuccess();
    }
  };

  return {
    fromAccount,
    setFromAccount,
    toAccount,
    setToAccount,
    amount,
    setAmount,
    step,
    setStep,
    error,
    setError,
    sending,
    selectedAccount,
    handleReview,
    handleSend,
    handleReset,
  };
}
