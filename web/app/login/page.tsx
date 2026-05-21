/**
 * @fileoverview Login Page — customer session sign-in interface.
 * 🔐 Displays a premium dark glassmorphism card containing validated forms for authentication.
 * Relies on the custom useLogin hook to process authentication cycles asynchronously.
 */
"use client";

import Link from "next/link";
import { useLogin } from "@/hooks/useAuth";
import GlassCard from "@/components/GlassCard";

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  } = useLogin();

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 animate-fade-in-up">
      <GlassCard className="w-full max-w-md p-8 sm:p-10">
        
        {/* ── 🏦 Header Title & Subtitle ── */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text-gold mb-2">Welcome Back 🔐</h1>
          <p className="text-text-secondary">Sign in to your premium NexBank account</p>
        </div>

        {/* ── ⚠️ Form Error Alert Banner ── */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm text-center animate-shake">
            {error}
          </div>
        )}

        {/* ── 📤 Authentication Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email input field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
              Email Address 📧
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="glass-input w-full px-4 py-3 focus:border-gold/50 transition-all duration-300"
            />
          </div>

          {/* Password input field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
              Password 🔑
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="glass-input w-full px-4 py-3 focus:border-gold/50 transition-all duration-300"
            />
          </div>

          {/* Submit transaction trigger */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3 text-base mt-2 hover:scale-[1.02] transition-transform duration-300"
          >
            {loading ? "Signing in... ⌛" : "Sign In 🚀"}
          </button>
        </form>

        {/* ── 🆕 Customer Registration Navigation ── */}
        <p className="mt-8 text-center text-text-secondary text-sm">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="text-gold hover:text-gold-light transition-colors font-medium">
            Create one free ✨
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
