/**
 * @fileoverview Register Page — glassmorphism card with name/email/password form.
 * Includes password confirmation and strength indicator.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import GlassCard from "@/components/GlassCard";

/** Returns password strength (0-4) based on length, uppercase, numbers, symbols */
function getPasswordStrength(pw: string): number {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

/** Strength bar colors and labels */
const strengthConfig = [
  { color: "bg-error", label: "Too weak" },
  { color: "bg-error", label: "Weak" },
  { color: "bg-warning", label: "Fair" },
  { color: "bg-success", label: "Strong" },
  { color: "bg-success", label: "Very strong" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  /** Handle form submit — validates passwords match, then calls register */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 animate-fade-in-up">
      <GlassCard className="w-full max-w-md p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text-gold mb-2">Create Account</h1>
          <p className="text-text-secondary">Join NexBank in under 30 seconds</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm text-center">
            {error}
          </div>
        )}

        {/* Register form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="glass-input w-full px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-text-secondary mb-2">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="glass-input w-full px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-text-secondary mb-2">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
              minLength={6}
              className="glass-input w-full px-4 py-3"
            />
            {/* Password strength bar — 4 segments that fill based on score */}
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

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-text-secondary mb-2">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Link to login */}
        <p className="mt-8 text-center text-text-secondary text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-gold hover:text-gold-light transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
