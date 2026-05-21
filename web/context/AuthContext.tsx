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

/** Shape of the auth context value available to all consuming components */
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

/** React context — starts as null, gets a value when AuthProvider mounts */
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * AuthProvider wraps the app and provides auth state to all children.
 * On mount, it checks localStorage for a saved user session.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /** On mount — restore user session from localStorage if it exists */
  useEffect(() => {
    const savedToken = localStorage.getItem("nexbank_token");
    const savedUser = localStorage.getItem("nexbank_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        // Corrupted data — clear it
        localStorage.removeItem("nexbank_token");
        localStorage.removeItem("nexbank_user");
      }
    }
    setIsLoading(false);
  }, []);

  /** Login — calls API, stores token + user in state and localStorage */
  const login = useCallback(async (email: string, password: string) => {
    const data = await loginUser(email, password);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("nexbank_token", data.token);
    localStorage.setItem("nexbank_user", JSON.stringify(data.user));
    router.push("/dashboard");
  }, [router]);

  /** Register — calls API, stores session, redirects to dashboard */
  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await registerUser(name, email, password);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("nexbank_token", data.token);
    localStorage.setItem("nexbank_user", JSON.stringify(data.user));
    router.push("/dashboard");
  }, [router]);

  /** Logout — calls API to blacklist token, clears local state */
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Token might already be expired — still clear locally
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
