/**
 * @fileoverview Dashboard Layout — wraps all /dashboard/* pages.
 * Protects routes with ProtectedRoute (redirects unauthenticated users).
 */
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>
    {children}
  </ProtectedRoute>;
}
