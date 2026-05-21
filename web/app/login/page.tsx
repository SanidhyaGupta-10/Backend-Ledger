/**
 * @fileoverview Login Page — glassmorphism card with email/password form.
 * On success, redirects to dashboard via AuthContext.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import GlassCard from "@/components/GlassCard";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /** Handle form submit — calls login from AuthContext */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // Redirect happens inside AuthContext.login()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 animate-fade-in-up">
      <GlassCard className="w-full max-w-md p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text-gold mb-2">Welcome Back</h1>
          <p className="text-text-secondary">Sign in to your NexBank account</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm text-center">
            {error}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="glass-input w-full px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="glass-input w-full px-4 py-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3 text-base mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Link to register */}
        <p className="mt-8 text-center text-text-secondary text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-gold hover:text-gold-light transition-colors font-medium">
            Create one free
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
