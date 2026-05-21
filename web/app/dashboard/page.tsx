/**
 * @fileoverview Dashboard Page — customer's primary command panel.
 * 📊 Displays reactive account cards, greeting state, real-time aggregate ledger balances,
 * and quick-action shortcuts for transfers and account creation.
 */
"use client";

import Link from "next/link";
import { useAuthContext } from "@/hooks/useAuthContext";
import GlassCard from "@/components/GlassCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAccounts } from "@/hooks/useAccounts";

/**
 * ⏰ Resolves Greeting Prefix
 * Returns appropriate day-phase greeting based on local clock time.
 */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning 🌅";
  if (hour < 17) return "Good afternoon ☀️";
  return "Good evening 🌃";
}

export default function DashboardPage() {
  const { user } = useAuthContext();
  const {
    accounts,
    loading,
    creating,
    error,
    totalBalance,
    handleCreateAccount,
  } = useAccounts();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">

      {/* ── 👋 Welcome Banner ── */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          {getGreeting()},{" "}
          <span className="gradient-text-gold">{user?.name?.split(" ")[0]}</span>
        </h1>
        <p className="text-text-secondary text-lg">
          Here&apos;s your financial ledger overview 🏦
        </p>
      </div>

      {/* ── 💳 Net Ledger Balance Card ── */}
      <GlassCard className="p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-text-secondary text-sm mb-1">Net Ledger Balance 💰</p>
            <p className="text-4xl sm:text-5xl font-bold gradient-text-gold">
              ₹{totalBalance.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/send" className="btn-primary !py-3 !px-6 hover:scale-105 transition-transform duration-300">
              Send Money 💸
            </Link>
            <button
              onClick={handleCreateAccount}
              disabled={creating}
              className="btn-secondary !py-3 !px-6 hover:scale-105 transition-transform duration-300"
            >
              {creating ? "Creating... ⌛" : "+ New Account"}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* ── ⚠️ Validation & Error Alert Banner ── */}
      {error && (
        <div className="mb-6 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm text-center animate-shake">
          {error}
        </div>
      )}

      {/* ── 🏦 Customer Account Grid ── */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Your Accounts 💳</h2>

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : accounts.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p className="text-4xl mb-4">🏦</p>
            <p className="text-text-secondary text-lg mb-4">
              No accounts linked to your ledger profile yet. Provision your first one!
            </p>
            <button onClick={handleCreateAccount} className="btn-primary">
              Create Account ➕
            </button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((acc, index) => (
              <GlassCard key={acc._id} hover className="p-6">
                {/* Account card header */}
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
                    {acc.status === "ACTIVE" ? "ACTIVE 🟢" : acc.status === "FROZEN" ? "FROZEN 🟡" : "CLOSED 🔴"}
                  </span>
                </div>

                {/* Ledger-computed Balance */}
                <p className="text-3xl font-bold text-text-primary mb-2">
                  ₹{acc.balance.toLocaleString("en-IN")}
                </p>

                {/* Currency details and hex metadata */}
                <div className="flex items-center justify-between text-text-tertiary text-xs">
                  <span>🇮🇳 {acc.currency}</span>
                  <span className="font-mono text-gold-light">ID: {acc._id.slice(-8)}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* ── 📚 Educational Guide / Tips ── */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-bold mb-3">Ledger Intelligence ⚡</h2>
        <ul className="space-y-2 text-text-secondary text-sm">
          <li className="flex items-center gap-2">
            <span className="text-gold">✔</span>
            Share your 24-character Account ID hex with senders to securely route deposits.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-gold">✔</span>
            Each transaction generates atomic double-entry entries in the ledger to secure integrity.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-gold">✔</span>
            Balances are dynamically aggregated from journal rows in real-time — 100% mathematically correct.
          </li>
        </ul>
      </GlassCard>
    </div>
  );
}
