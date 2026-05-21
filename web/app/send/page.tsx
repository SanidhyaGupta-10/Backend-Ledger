/**
 * @fileoverview Send Money Page — form to transfer funds between accounts.
 * 💸 Implements a high-performance, multi-step transaction pipeline.
 * Governed by ProtectedRoute to ensure session authenticity. Maps user inputs to the
 * client-side useTransfer transaction engine.
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
        
        {/* ── 💸 Header Title & Summary ── */}
        <h1 className="text-3xl font-bold mb-2">
          Send <span className="gradient-text-gold">Money</span> 💸
        </h1>
        <p className="text-text-secondary mb-8">Transfer funds securely between accounts in real-time</p>

        {loading ? (
          <div className="py-12 flex justify-center"><LoadingSpinner /></div>
        ) : step === "success" ? (
          
          /* ── 🎉 SUCCESS STATE VIEW ── */
          <GlassCard className="p-10 text-center animate-scale-up">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-success mb-2">Transaction Successful! 🥳</h2>
            <p className="text-text-secondary mb-6">
              ₹{Number(amount).toLocaleString("en-IN")} has been successfully debited and routed.
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={handleReset} className="btn-primary hover:scale-105 transition-transform duration-300">
                Send Another 💸
              </button>
              <Link href="/dashboard" className="btn-secondary hover:scale-105 transition-transform duration-300">
                Back to Dashboard 📊
              </Link>
            </div>
          </GlassCard>
        ) : step === "error" ? (
          
          /* ── ❌ ERROR ROLLBACK STATE VIEW ── */
          <GlassCard className="p-10 text-center animate-shake">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-error mb-2">Transaction Failed</h2>
            <p className="text-text-secondary mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setStep("form")} className="btn-primary hover:scale-105 transition-transform duration-300">
                Try Again 🔄
              </button>
              <Link href="/dashboard" className="btn-secondary hover:scale-105 transition-transform duration-300">
                Back to Dashboard 📊
              </Link>
            </div>
          </GlassCard>
        ) : step === "confirm" ? (
          
          /* ── 🛡️ CONFIRMATION STATE VIEW ── */
          <GlassCard className="p-8">
            <h2 className="text-xl font-bold mb-6">Confirm Transaction ⚡</h2>
            <div className="space-y-4 mb-8">
              {/* Sender Details */}
              <div className="flex justify-between py-3 border-b border-glass-border">
                <span className="text-text-secondary">Source Account 📤</span>
                <span className="font-mono text-sm text-gold-light">{fromAccount.slice(-8)}</span>
              </div>
              {/* Recipient Details */}
              <div className="flex justify-between py-3 border-b border-glass-border">
                <span className="text-text-secondary">Target Account 📥</span>
                <span className="font-mono text-sm text-gold-light">{toAccount.slice(-8)}</span>
              </div>
              {/* Ledger amount to dispatch */}
              <div className="flex justify-between py-3 border-b border-glass-border">
                <span className="text-text-secondary">Transfer Amount 💰</span>
                <span className="text-2xl font-bold gradient-text-gold">
                  ₹{Number(amount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            {/* CTA action buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSend}
                disabled={sending}
                className="btn-primary flex-1 !py-3 hover:scale-[1.02] transition-transform duration-300"
              >
                {sending ? "Processing Ledger Transfer... ⌛" : "Confirm & Send 🚀"}
              </button>
              <button
                onClick={() => setStep("form")}
                className="btn-secondary flex-1 !py-3 hover:scale-[1.02] transition-transform duration-300"
              >
                Go Back 🔙
              </button>
            </div>
          </GlassCard>
        ) : (
          
          /* ── 📝 CORE INPUT FORM VIEW ── */
          <GlassCard className="p-8">
            {/* Form Validation Errors */}
            {error && (
              <div className="mb-6 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm text-center animate-shake">
                {error}
              </div>
            )}

            {accounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary mb-4">You need an active ledger account to initiate transfers. 🏦</p>
                <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
              </div>
            ) : (
              <form onSubmit={handleReview} className="flex flex-col gap-6">
                {/* From Account selection */}
                <div>
                  <label htmlFor="from-account" className="block text-sm font-medium text-text-secondary mb-2">
                    Source Account 📤
                  </label>
                  <select
                    id="from-account"
                    value={fromAccount}
                    onChange={(e) => setFromAccount(e.target.value)}
                    required
                    className="glass-input w-full px-4 py-3 appearance-none cursor-pointer focus:border-gold/50"
                  >
                    <option value="" className="bg-bg-primary">Select sender account</option>
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

                {/* Recipient Account ID Input */}
                <div>
                  <label htmlFor="to-account" className="block text-sm font-medium text-text-secondary mb-2">
                    Recipient Account ID 📥
                  </label>
                  <input
                    id="to-account"
                    type="text"
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                    placeholder="Enter recipient's 24-character account ID"
                    required
                    className="glass-input w-full px-4 py-3 focus:border-gold/50"
                  />
                </div>

                {/* Amount input */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-text-secondary mb-2">
                    Amount (₹) 💰
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
                    className="glass-input w-full px-4 py-3 text-2xl font-bold focus:border-gold/50"
                  />
                </div>

                <button type="submit" className="btn-primary w-full !py-3 text-base hover:scale-[1.02] transition-transform duration-300">
                  Review Transaction ✨
                </button>
              </form>
            )}
          </GlassCard>
        )}
      </div>
    </ProtectedRoute>
  );
}
