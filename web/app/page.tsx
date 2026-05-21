/**
 * @fileoverview Landing Page — the primary landing hero interface.
 * 🌌 Implements a premium dark glassmorphic landing layout featuring animated numerical
 * count-ups, core ledger features, call-to-actions, and interactive transitions.
 */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GlassCard from "@/components/GlassCard";

/**
 * 🧮 CountUp Component
 * Smoothly animates values from 0 up to the target number over a fixed duration (2 seconds).
 * Provides a dynamic, high-fidelity experience during initial viewport paint.
 */

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000; // ⏱️ Total animation time (2000ms)
    const steps = 60;      // 🎬 Frame steps
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{count.toLocaleString("en-IN")}{suffix}</span>;
}

/**
 * 💡 Marketing features listing core ledger capabilities
 */
const features = [
  {
    icon: "⚡",
    title: "Instant Transfers",
    desc: "Send money to any NexBank account in seconds with atomic ledger-backed transactions.",
  },
  {
    icon: "🛡️",
    title: "Secure Ledger",
    desc: "Double-entry bookkeeping ensures every rupee is accounted for. No balance can ever go wrong.",
  },
  {
    icon: "📊",
    title: "Smart Insights",
    desc: "Track your spending, view transaction history, and manage multiple accounts effortlessly.",
  },
];

export default function LandingPage() {
  return (
    <div className="animate-fade-in-up">

      {/* ── 🚀 Hero Section ── */}
      <section className="min-h-[90vh] flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 text-sm font-medium text-gold border border-gold/30 rounded-full bg-gold/5 animate-pulse">
              ✨ Next-Gen Banking Platform
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Banking{" "}
            <span className="gradient-text-gold">Reimagined</span>
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience premium digital banking with glassmorphism aesthetics,
            instant transfers, and rock-solid double-entry ledger technology. 🏦
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-lg !px-10 !py-4 hover:scale-105 transition-transform duration-300">
              Open Free Account 💳
            </Link>
            <Link href="/login" className="btn-secondary text-lg !px-10 !py-4 hover:scale-105 transition-transform duration-300">
              Sign In 🔐
            </Link>
          </div>
        </div>
      </section>

      {/* ── 💎 Features Section ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose <span className="gradient-text-gold">NexBank</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              Built on a production-grade double-entry ledger system with enterprise-level security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <GlassCard key={f.title} hover className="p-8">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-text-primary mb-3">{f.title}</h3>
                <p className="text-text-secondary leading-relaxed">{f.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── 📈 Stats Section ── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold gradient-text-gold mb-2">
                  <CountUp target={10000} suffix="+" />
                </div>
                <p className="text-text-secondary">👥 Active Users</p>
              </div>
              <div>
                <div className="text-4xl font-bold gradient-text-gold mb-2">
                  ₹<CountUp target={50} suffix="Cr+" />
                </div>
                <p className="text-text-secondary">💸 Volume Processed</p>
              </div>
              <div>
                <div className="text-4xl font-bold gradient-text-gold mb-2">
                  <CountUp target={99} suffix=".9%" />
                </div>
                <p className="text-text-secondary">⚡ Engine Uptime</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── 📣 CTA Section ── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Experience the Future?
          </h2>
          <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto">
            Open your NexBank account in under 30 seconds. No paperwork, no waiting. ⌛
          </p>
          <Link href="/register" className="btn-primary text-lg !px-12 !py-4 hover:scale-105 transition-transform duration-300">
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* ── 🔖 Footer ── */}
      <footer className="py-12 px-4 border-t border-glass-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
              <span className="text-bg-primary font-bold text-xs">N</span>
            </div>
            <span className="font-bold gradient-text-gold">NexBank</span>
          </div>
          <p className="text-text-tertiary text-sm">
            © {new Date().getFullYear()} NexBank. Built with Ledger Technology. 💻
          </p>
          <div className="flex gap-6 text-text-secondary text-sm">
            <Link href="/" className="hover:text-gold transition-colors">Privacy</Link>
            <Link href="/" className="hover:text-gold transition-colors">Terms</Link>
            <Link href="/" className="hover:text-gold transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
