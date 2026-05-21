/**
 * @fileoverview useAccounts hook — manages the state of all bank accounts,
 * fetches their ledger-derived balances, calculates total balance, and handles creation of new accounts.
 */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAccounts, fetchBalance, createAccount } from "@/lib/api";
import type { AccountWithBalance } from "@/types";

/**
 * 🏦 Custom Hook: useAccounts
 * Handles reactive state for all linked bank accounts, balances, and creations.
 */
export function useAccounts() {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  /**
   * 🔄 Async Action: Load Accounts & Balances
   * Queries customer accounts and maps ledger balances in parallel using Promise.all.
   */
  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const accs = await fetchAccounts();

      /**
       * 🧮 Parallel Balance Mapping
       * Resolves the ledger-derived balance for each account simultaneously.
       */
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

  /**
   * 📅 Lifecycle Hook
   * Load account data automatically when the hook mounts.
   */
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  /**
   * 🆕 Interactive Action: Create Account
   * Registers a new INR account in the ledger database and triggers a refresh.
   */
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

  /**
   * 📊 Memoized Derived State: Total Balance
   * Dynamically aggregates INR balances across all user accounts.
   */
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }, [accounts]);

  /**
   * 🛡️ Memoized Derived State: Active Accounts
   * Filters out frozen or closed accounts to secure transfer flows.
   */
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
