/**
 * @fileoverview ProtectedRoute — wraps pages that require authentication.
 * Redirects to /login if user is not logged in, shows spinner while checking.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  /** Redirect to login if auth check completes and user is not authenticated */
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  /* Show spinner while checking auth status */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  /* Don't render children if not authenticated (redirect is in progress) */
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
