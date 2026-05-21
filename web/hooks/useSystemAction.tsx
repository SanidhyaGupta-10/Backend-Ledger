/**
 * @fileoverview useSystemAction hook — manages administrative states,
 * lists all system accounts, handles target account selection, credits/deposits funds,
 * and maintains validation, error, and loading states for premium system views.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchAllAccountsSystem, sendInitialFundsSystem } from "@/lib/api";
import type { SystemAccount } from "@/types";

export function useSystemAction() {
  const [accounts, setAccounts] = useState<SystemAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [targetAccount, setTargetAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [crediting, setCrediting] = useState(false);
  const [creditError, setCreditError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /** Fetch all accounts registered on the system with user details populated */
  const loadAllAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetchAllAccountsSystem();
      setAccounts(res);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string; message?: string } } })
          ?.response?.data?.error ||
        (err as { response?: { data?: { error?: string; message?: string } } })
          ?.response?.data?.message ||
        "Failed to load system accounts";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllAccounts();
  }, [loadAllAccounts]);

  /** Form submit: Sends a ledger deposit request */
  const handleCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreditError("");
    setSuccessMessage("");

    if (!targetAccount) {
      setCreditError("Please select a target account");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setCreditError("Please enter a valid positive amount");
      return;
    }

    setCrediting(true);
    try {
      await sendInitialFundsSystem(targetAccount, Number(amount));
      setSuccessMessage(
        `Successfully credited ₹${Number(amount).toLocaleString("en-IN")} to account #${targetAccount.slice(-8)}`
      );
      setAmount("");
      // Refresh accounts list to reflect updated balances immediately
      await loadAllAccounts();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string; message?: string } } })
          ?.response?.data?.error ||
        (err as { response?: { data?: { error?: string; message?: string } } })
          ?.response?.data?.message ||
        "Failed to deposit funds. Please check your system authorization.";
      setCreditError(msg);
    } finally {
      setCrediting(false);
    }
  };

  const clearMessages = () => {
    setCreditError("");
    setSuccessMessage("");
  };

  return {
    accounts,
    loading,
    error,
    targetAccount,
    setTargetAccount,
    amount,
    setAmount,
    crediting,
    creditError,
    successMessage,
    handleCredit,
    clearMessages,
    reload: loadAllAccounts,
  };
}
