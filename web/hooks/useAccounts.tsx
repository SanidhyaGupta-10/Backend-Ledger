/**
 * @fileoverview useAccounts hook — manages the state of all bank accounts,
 * fetches their ledger-derived balances, calculates total balance, and handles creation of new accounts.
 */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAccounts, fetchBalance, createAccount } from "@/lib/api";
import type { AccountWithBalance } from "@/types";

export function useAccounts() {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  /** Fetch all accounts and map their ledger balances in parallel */
  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const accs = await fetchAccounts();

      const withBalances = await Promise.all(
        accs.map(async (acc) => {
          try {
            const balance = await fetchBalance(acc._id);
            return { ...acc, balance };
          } catch {
            return { ...acc, balance: 0 };
          }
        })
      );
      setAccounts(withBalances);
    } catch {
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  /** Creates a new INR account and refreshes the accounts list */
  const handleCreateAccount = async () => {
    setCreating(true);
    setError("");
    try {
      await createAccount();
      await loadAccounts();
    } catch {
      setError("Failed to create account");
    } finally {
      setCreating(false);
    }
  };

  /** Calculate total balance across all accounts */
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }, [accounts]);

  /** Get only active accounts (used in sending funds) */
  const activeAccounts = useMemo(() => {
    return accounts.filter((acc) => acc.status === "ACTIVE");
  }, [accounts]);

  return {
    accounts,
    activeAccounts,
    loading,
    creating,
    error,
    setError,
    totalBalance,
    handleCreateAccount,
    reload: loadAccounts,
  };
}
