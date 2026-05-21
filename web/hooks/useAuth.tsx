/**
 * @fileoverview useAuth hook — convenience wrapper around AuthContext.
 * Use this in any client component to access auth state and methods.
 */
"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import type { AuthContextType } from "@/context/AuthContext";

/**
 * Returns the current auth state and methods (login, register, logout).
 * Must be used inside an AuthProvider — throws if used outside.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
