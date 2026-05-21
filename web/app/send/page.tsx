/**
 * @fileoverview Send Money Page — form to transfer funds between accounts.
 * Includes account selection, confirmation step, and success/error feedback.
 */
"use client";

import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransfer } from "@/hooks/useTransfer";

export default function SendMoneyPage() {
  const { activeAccounts: accounts, loading, reload } = useAccounts();
  const {
    fromAccount,
    setFromAccount,
    toAccount,
    setToAccount,
    amount,
    setAmount,
    step,
    setStep,
    error,
    sending,
    selectedAccount,
    handleReview,
    handleSend,
    handleReset,
  } = useTransfer(accounts, reload);

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-2">
          Send <span className="gradient-text-gold">Money</span>
        </h1>
        <p className="text-text-secondary mb-8">Transfer funds securely between accounts</p>

        {loading ? (
          <div className="py-12"><LoadingSpinner /></div>
        ) : step === "success" ? (
          /* ── Success State ── */
          <GlassCard className="p-10 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-success mb-2">Transaction Successful!</h2>
            <p className="text-text-secondary mb-6">
              ₹{Number(amount).toLocaleString("en-IN")} has been sent successfully.
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={handleReset} className="btn-primary">Send Another</button>
              <Link href="/dashboard" className="btn-secondary">Back to Dashboard</Link>
            </div>
          </GlassCard>
        ) : step === "error" ? (
          /* ── Error State ── */
          <GlassCard className="p-10 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-error mb-2">Transaction Failed</h2>
            <p className="text-text-secondary mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setStep("form")} className="btn-primary">Try Again</button>
              <Link href="/dashboard" className="btn-secondary">Back to Dashboard</Link>
            </div>
          </GlassCard>
        ) : step === "confirm" ? (
          /* ── Confirmation Step ── */
          <GlassCard className="p-8">
            <h2 className="text-xl font-bold mb-6">Confirm Transaction</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-3 border-b border-glass-border">
                <span className="text-text-secondary">From Account</span>
                <span className="font-mono text-sm">{fromAccount.slice(-8)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-glass-border">
                <span className="text-text-secondary">To Account</span>
                <span className="font-mono text-sm">{toAccount.slice(-8)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-glass-border">
                <span className="text-text-secondary">Amount</span>
                <span className="text-2xl font-bold gradient-text-gold">
                  ₹{Number(amount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSend}
                disabled={sending}
                className="btn-primary flex-1 !py-3"
              >
                {sending ? "Processing..." : "Confirm & Send"}
              </button>
              <button
                onClick={() => setStep("form")}
                className="btn-secondary flex-1 !py-3"
              >
                Go Back
              </button>
            </div>
          </GlassCard>
        ) : (
          /* ── Form Step ── */
          <GlassCard className="p-8">
            {error && (
              <div className="mb-6 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm text-center">
                {error}
              </div>
            )}

            {accounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary mb-4">You need an account to send money.</p>
                <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
              </div>
            ) : (
              <form onSubmit={handleReview} className="flex flex-col gap-6">
                {/* From Account dropdown */}
                <div>
                  <label htmlFor="from-account" className="block text-sm font-medium text-text-secondary mb-2">
                    From Account
                  </label>
                  <select
                    id="from-account"
                    value={fromAccount}
                    onChange={(e) => setFromAccount(e.target.value)}
                    required
                    className="glass-input w-full px-4 py-3 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-bg-primary">Select an account</option>
                    {accounts.map((acc, i) => (
                      <option key={acc._id} value={acc._id} className="bg-bg-primary">
                        Account #{i + 1} — ₹{acc.balance.toLocaleString("en-IN")} ({acc._id.slice(-8)})
                      </option>
                    ))}
                  </select>
                  {selectedAccount && (
                    <p className="text-text-tertiary text-xs mt-1">
                      Available: ₹{selectedAccount.balance.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>

                {/* To Account ID input */}
                <div>
                  <label htmlFor="to-account" className="block text-sm font-medium text-text-secondary mb-2">
                    To Account ID
                  </label>
                  <input
                    id="to-account"
                    type="text"
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                    placeholder="Enter recipient's account ID"
                    required
                    className="glass-input w-full px-4 py-3"
                  />
                </div>

                {/* Amount input */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-text-secondary mb-2">
                    Amount (₹)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    min="1"
                    step="0.01"
                    className="glass-input w-full px-4 py-3 text-2xl font-bold"
                  />
                </div>

                <button type="submit" className="btn-primary w-full !py-3 text-base">
                  Review Transaction
                </button>
              </form>
            )}
          </GlassCard>
        )}
      </div>
    </ProtectedRoute>
  );
}
