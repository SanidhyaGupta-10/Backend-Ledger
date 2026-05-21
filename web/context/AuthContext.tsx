/**
 * @fileoverview Auth Context — manages login state across the entire app.
 * Provides user data, token, and auth methods (login/register/logout) to all components.
 */
"use client";

import { createContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { loginUser, registerUser, logoutUser } from "@/lib/api";
import type { User } from "@/types";
import { useRouter } from "next/navigation";

/**
 * 📦 Shape of the Auth Context Value
 * Made available to all consuming pages and components in the web app.
 */
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * 🔗 React Context Initialization
 * Starts as null, gets populated when AuthProvider mounts.
 */
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * 🏛️ AuthProvider Component
 * Wraps the application layout and supplies authentication state to all child components.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * 🔄 Mount Hook: Restore User Session
   * Syncs active credentials from localStorage so sessions persist across page refreshes.
   */
  useEffect(() => {
    const savedToken = localStorage.getItem("nexbank_token");
    const savedUser = localStorage.getItem("nexbank_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        /**
         * ⚠️ Corrupted localStorage details — clear state variables
         */
        localStorage.removeItem("nexbank_token");
        localStorage.removeItem("nexbank_user");
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * 🔑 Login Action
   * Dispatches login REST request, preserves JWT, and redirects to customer dashboard.
   */
  const login = useCallback(async (email: string, password: string) => {
    const data = await loginUser(email, password);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("nexbank_token", data.token);
    localStorage.setItem("nexbank_user", JSON.stringify(data.user));
    router.push("/dashboard");
  }, [router]);

  /**
   * 📝 Register Action
   * Creates a new user record, signs in automatically, and forwards to dashboard.
   */
  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await registerUser(name, email, password);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("nexbank_token", data.token);
    localStorage.setItem("nexbank_user", JSON.stringify(data.user));
    router.push("/dashboard");
  }, [router]);

  /**
   * 🚪 Logout Action
   * Requests JWT blacklist verification on the backend and clears local storage traces.
   */
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      /**
       * ⚠️ Token might already be expired — clean up locally regardless
       */
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("nexbank_token");
    localStorage.removeItem("nexbank_user");
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
