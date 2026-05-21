/**
 * @fileoverview useTransfer hook — manages the complex multi-step state machine for transfers,
 * validates inputs (such as matching accounts or insufficient balance), handles submission with idempotency,
 * and handles form resets.
 */
"use client";

import { useState, useMemo } from "react";
import { createTransaction } from "@/lib/api";
import type { AccountWithBalance } from "@/types";

export function useTransfer(accounts: AccountWithBalance[], onResetSuccess?: () => void) {
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"form" | "confirm" | "success" | "error">("form");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  /** Find currently selected sender account to access its balance */
  const selectedAccount = useMemo(() => {
    return accounts.find((a) => a._id === fromAccount);
  }, [accounts, fromAccount]);

  /** Form review step: Validates input parameters before moving to confirmation */
  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fromAccount || !toAccount || !amount) {
      setError("All fields are required");
      return;
    }
    if (fromAccount === toAccount) {
      setError("Cannot send to the same account");
      return;
    }
    if (Number(amount) <= 0) {
      setError("Amount must be positive");
      return;
    }
    if (selectedAccount && Number(amount) > selectedAccount.balance) {
      setError("Insufficient balance");
      return;
    }

    setStep("confirm");
  };

  /** Form submit step: Sends transactional POST request using UUID as idempotencyKey */
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
          ?.message || "Transaction failed. Please try again.";
      setError(msg);
      setStep("error");
    } finally {
      setSending(false);
    }
  };

  /** Resets state variables to default and reloads accounts */
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
