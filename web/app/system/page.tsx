/**
 * @fileoverview System Panel Page — premium administrative dashboard.
 * Accessible only to verified System Users. Lists all system accounts
 * and provides forms to credit/deposit funds programmatically.
 */
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useSystemAction } from "@/hooks/useSystemAction";
import GlassCard from "@/components/GlassCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function SystemPanelPage() {
  const { user, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const {
    accounts,
    loading: accountsLoading,
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
    reload,
  } = useSystemAction();

  const [searchTerm, setSearchTerm] = useState("");

  // Safeguard: Redirect if the user is not a system admin
  useEffect(() => {
    if (!authLoading && (!user || !user.systemUser)) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // Filter accounts by owner name, email or account ID
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const name = acc.user?.name?.toLowerCase() || "";
      const email = acc.user?.email?.toLowerCase() || "";
      const id = acc._id?.toLowerCase() || "";
      const term = searchTerm.toLowerCase();
      return name.includes(term) || email.includes(term) || id.includes(term);
    });
  }, [accounts, searchTerm]);

  if (authLoading || (!user || !user.systemUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              👑 System <span className="gradient-text-gold">Panel</span>
            </h1>
            <p className="text-text-secondary text-lg">
              Administrative banking controls and double-entry crediting
            </p>
          </div>
          <button
            onClick={() => {
              clearMessages();
              reload();
            }}
            className="btn-secondary !py-2.5 !px-5 self-start md:self-auto text-sm"
          >
            🔄 Refresh Ledger
          </button>
        </div>

        {/* ── Status Messages ── */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Column: System Credit Form ── */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6 sticky top-24 border border-gold/20">
              <h2 className="text-xl font-bold mb-4 gradient-text-gold flex items-center gap-2">
                💰 Mint & Credit Funds
              </h2>
              <p className="text-text-secondary text-xs mb-6">
                Directly credit funds to any account in the ledger. This operation is signed by your system key and bypasses standard balance constraints.
              </p>

              {creditError && (
                <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs">
                  {creditError}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-xs">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleCredit} className="space-y-4">
                {/* Target Account Field */}
                <div>
                  <label htmlFor="target-account" className="block text-xs font-semibold text-text-secondary mb-1">
                    Target Account ID
                  </label>
                  <input
                    id="target-account"
                    type="text"
                    value={targetAccount}
                    onChange={(e) => {
                      clearMessages();
                      setTargetAccount(e.target.value);
                    }}
                    placeholder="e.g. 64b8a2119934..."
                    required
                    className="glass-input w-full px-3.5 py-2.5 text-sm"
                  />
                  {targetAccount && (
                    <p className="text-text-tertiary text-[10px] font-mono mt-1">
                      Target: {targetAccount}
                    </p>
                  )}
                </div>

                {/* Amount Field */}
                <div>
                  <label htmlFor="amount" className="block text-xs font-semibold text-text-secondary mb-1">
                    Amount to Credit (₹)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      clearMessages();
                      setAmount(e.target.value);
                    }}
                    placeholder="0.00"
                    required
                    min="1"
                    step="0.01"
                    className="glass-input w-full px-3.5 py-2.5 text-lg font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={crediting}
                  className="btn-primary w-full !py-3 font-semibold text-sm shadow-lg shadow-gold/10"
                >
                  {crediting ? "Crediting Ledger..." : "⚡ Execute Direct Credit"}
                </button>
              </form>
            </GlassCard>
          </div>

          {/* ── Right Column: All Accounts List ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <GlassCard className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold">System Ledger Directory</h2>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search accounts or owners..."
                    className="glass-input !py-1.5 !px-3.5 text-xs w-full sm:w-64"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {accountsLoading ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-3xl">📭</span>
                  <p className="text-text-secondary mt-2 text-sm">
                    {searchTerm ? "No matching accounts found" : "No accounts currently registered"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-glass-border text-text-secondary text-xs uppercase tracking-wider">
                        <th className="py-3 px-2">Account ID</th>
                        <th className="py-3 px-2">Owner</th>
                        <th className="py-3 px-2">Balance</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border/40 text-sm">
                      {filteredAccounts.map((acc) => {
                        const isSelfAccount = acc.user?._id === user._id;
                        return (
                          <tr
                            key={acc._id}
                            className={`hover:bg-glass-card/10 transition-colors ${
                              targetAccount === acc._id ? "bg-gold/5" : ""
                            }`}
                          >
                            <td className="py-4 px-2 font-mono text-xs">
                              <span
                                className="cursor-pointer hover:underline text-text-primary"
                                onClick={() => {
                                  clearMessages();
                                  setTargetAccount(acc._id);
                                }}
                              >
                                {acc._id.slice(-8)}
                              </span>
                              <span className="text-text-tertiary block text-[10px] select-all">
                                {acc._id}
                              </span>
                            </td>
                            <td className="py-4 px-2">
                              <div className="font-semibold text-text-primary text-xs">
                                {acc.user?.name || "Unknown"} {isSelfAccount && <span className="text-[10px] bg-gold/15 text-gold px-1 rounded">You</span>}
                              </div>
                              <div className="text-text-tertiary text-[10px] select-all">
                                {acc.user?.email || "No Email"}
                              </div>
                            </td>
                            <td className="py-4 px-2 font-bold text-xs text-text-primary">
                              ₹{acc.balance.toLocaleString("en-IN")}
                            </td>
                            <td className="py-4 px-2">
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
                            </td>
                            <td className="py-4 px-2 text-right">
                              <button
                                onClick={() => {
                                  clearMessages();
                                  setTargetAccount(acc._id);
                                }}
                                disabled={isSelfAccount}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                                  isSelfAccount
                                    ? "border-text-tertiary/20 text-text-tertiary cursor-not-allowed opacity-50"
                                    : "border-gold/30 hover:border-gold text-gold hover:bg-gold/10"
                                }`}
                                title={isSelfAccount ? "Cannot credit your own account" : "Pre-fill target account"}
                              >
                                Credit
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
