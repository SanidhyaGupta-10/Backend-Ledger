/**
 * @fileoverview Dashboard Page — main view after login.
 * Shows welcome banner, account cards with balances, quick actions,
 * and the option to create new accounts.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import GlassCard from "@/components/GlassCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { fetchAccounts, fetchBalance, createAccount } from "@/lib/api";
import type { Account } from "@/lib/api";

/** Returns a greeting based on the current hour */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Account card data — account + its fetched balance */
interface AccountWithBalance extends Account {
  balance: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  /** Fetch all accounts and their balances */
  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const accs = await fetchAccounts();

      // Fetch balance for each account in parallel
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

  /** Create a new account and refresh the list */
  const handleCreateAccount = async () => {
    setCreating(true);
    try {
      await createAccount();
      await loadAccounts();
    } catch {
      setError("Failed to create account");
    } finally {
      setCreating(false);
    }
  };

  /** Total balance across all accounts */
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">

      {/* ── Welcome Banner ── */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          {getGreeting()},{" "}
          <span className="gradient-text-gold">{user?.name?.split(" ")[0]}</span>
        </h1>
        <p className="text-text-secondary text-lg">
          Here&apos;s your financial overview
        </p>
      </div>

      {/* ── Total Balance Card ── */}
      <GlassCard className="p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-text-secondary text-sm mb-1">Total Balance</p>
            <p className="text-4xl sm:text-5xl font-bold gradient-text-gold">
              ₹{totalBalance.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/send" className="btn-primary !py-3 !px-6">
              Send Money
            </Link>
            <button
              onClick={handleCreateAccount}
              disabled={creating}
              className="btn-secondary !py-3 !px-6"
            >
              {creating ? "Creating..." : "+ New Account"}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* ── Error message ── */}
      {error && (
        <div className="mb-6 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm text-center">
          {error}
        </div>
      )}

      {/* ── Account Cards ── */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Your Accounts</h2>

        {loading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : accounts.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p className="text-4xl mb-4">🏦</p>
            <p className="text-text-secondary text-lg mb-4">
              No accounts yet. Create your first one!
            </p>
            <button onClick={handleCreateAccount} className="btn-primary">
              Create Account
            </button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((acc, index) => (
              <GlassCard key={acc._id} hover className="p-6">
                {/* Account header — number and status badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-text-tertiary text-sm font-mono">
                    Account #{index + 1}
                  </span>
                  <span
                    className={`badge ${
                      acc.status === "ACTIVE"
                        ? "badge-success"
                        : acc.status === "FROZEN"
                        ? "badge-warning"
                        : "badge-error"
                    }`}
                  >
                    {acc.status}
                  </span>
                </div>

                {/* Balance */}
                <p className="text-3xl font-bold text-text-primary mb-2">
                  ₹{acc.balance.toLocaleString("en-IN")}
                </p>

                {/* Currency and account ID */}
                <div className="flex items-center justify-between text-text-tertiary text-xs">
                  <span>{acc.currency}</span>
                  <span className="font-mono">{acc._id.slice(-8)}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Info ── */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-bold mb-3">Quick Tips</h2>
        <ul className="space-y-2 text-text-secondary text-sm">
          <li className="flex items-center gap-2">
            <span className="text-gold">→</span>
            Share your Account ID with others to receive money
          </li>
          <li className="flex items-center gap-2">
            <span className="text-gold">→</span>
            Each transaction uses an idempotency key to prevent duplicates
          </li>
          <li className="flex items-center gap-2">
            <span className="text-gold">→</span>
            Balances are calculated from the ledger — always accurate
          </li>
        </ul>
      </GlassCard>
    </div>
  );
}
