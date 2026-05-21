/**
 * @fileoverview Register Page — customer registration form.
 * ✨ Provisions new customer records in the ledger database within 30 seconds.
 * Incorporates real-time, interactive client-side password strength validation indicators.
 */
"use client";

import Link from "next/link";
import { useRegister } from "@/hooks/useAuth";
import GlassCard from "@/components/GlassCard";

export default function RegisterPage() {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    loading,
    strength,
    strengthConfig,
    handleSubmit,
  } = useRegister();

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 animate-fade-in-up">
      <GlassCard className="w-full max-w-md p-8 sm:p-10">
        
        {/* ── 💳 Header Title & Subtitle ── */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text-gold mb-2">Create Account ✨</h1>
          <p className="text-text-secondary">Join NexBank in under 30 seconds</p>
        </div>

        {/* ── ⚠️ Form Error Alert Banner ── */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm text-center animate-shake">
            {error}
          </div>
        )}

        {/* ── 📝 Registration Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Full Name field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
              Full Name 👤
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="glass-input w-full px-4 py-3 focus:border-gold/50 transition-all duration-300"
            />
          </div>

          {/* Email field */}
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-text-secondary mb-2">
              Email Address 📧
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="glass-input w-full px-4 py-3 focus:border-gold/50 transition-all duration-300"
            />
          </div>

          {/* Password field with dynamic strength meter */}
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-text-secondary mb-2">
              Password 🔑
            </label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
              minLength={6}
              className="glass-input w-full px-4 py-3 focus:border-gold/50 transition-all duration-300"
            />
            {/* 📊 Dynamic Password Strength Meter (4 distinct visual bars) */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        i < strength ? strengthConfig[strength].color : "bg-glass-border"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-text-tertiary mt-1">{strengthConfig[strength].label}</p>
              </div>
            )}
          </div>

          {/* Password confirmation field */}
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-text-secondary mb-2">
              Confirm Password 🔒
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="glass-input w-full px-4 py-3 focus:border-gold/50 transition-all duration-300"
            />
          </div>

          {/* Submit registration trigger */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3 text-base mt-2 hover:scale-[1.02] transition-transform duration-300"
          >
            {loading ? "Creating account... ⌛" : "Create Account 🚀"}
          </button>
        </form>

        {/* ── 🚪 Link to existing session login ── */}
        <p className="mt-8 text-center text-text-secondary text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-gold hover:text-gold-light transition-colors font-medium">
            Sign in 🔐
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
