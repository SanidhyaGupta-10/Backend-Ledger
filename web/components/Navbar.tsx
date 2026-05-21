/**
 * @fileoverview Navbar — glassmorphism navigation bar with NexBank branding.
 * Shows different links based on auth state. Includes mobile hamburger menu.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/hooks/useAuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthContext();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  /** Check if a link is the current active route */
  const isActive = (path: string) => pathname === path;

  /** Shared link styles — gold underline on active route */
  const linkClass = (path: string) =>
    `relative px-4 py-2 text-sm font-medium transition-colors duration-300 ${
      isActive(path)
        ? "text-gold"
        : "text-text-secondary hover:text-text-primary"
    }`;

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
              <span className="text-bg-primary font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold gradient-text-gold">NexBank</span>
          </Link>

          {/* ── Desktop Links ── */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className={linkClass("/")}>Home</Link>

            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
                <Link href="/send" className={linkClass("/send")}>Send Money</Link>
                {user?.systemUser && (
                  <Link href="/system" className="relative px-4 py-1.5 text-sm font-semibold transition-all duration-300 text-gold hover:text-white border border-gold/30 hover:border-gold/80 rounded-full ml-2 hover:bg-gold/10 flex items-center gap-1.5">
                    👑 System Panel
                  </Link>
                )}
                <div className="ml-4 flex items-center gap-3">
                  <span className="text-text-secondary text-sm">
                    {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="btn-secondary !py-2 !px-4 text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className={linkClass("/login")}>Login</Link>
                <Link href="/register" className="btn-primary !py-2 !px-6 text-sm ml-2">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            className="md:hidden text-text-primary p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile Menu (slides down when open) ── */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-glass-border animate-fade-in-up">
          <div className="px-4 py-4 flex flex-col gap-2">
            <Link href="/" className={linkClass("/")} onClick={() => setMobileOpen(false)}>Home</Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className={linkClass("/dashboard")} onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link href="/send" className={linkClass("/send")} onClick={() => setMobileOpen(false)}>Send Money</Link>
                {user?.systemUser && (
                  <Link href="/system" className="relative text-gold font-semibold px-4 py-2 text-sm border border-gold/30 rounded-xl my-1 hover:bg-gold/10 text-center block" onClick={() => setMobileOpen(false)}>
                    👑 System Panel
                  </Link>
                )}
                <button onClick={() => { logout(); setMobileOpen(false); }} className="btn-secondary text-sm mt-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={linkClass("/login")} onClick={() => setMobileOpen(false)}>Login</Link>
                <Link href="/register" className="btn-primary text-sm mt-2 text-center" onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
