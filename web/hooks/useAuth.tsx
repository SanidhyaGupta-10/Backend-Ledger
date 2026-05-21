/**
 * @fileoverview useAuth hooks — handles form states, strength validations, and submissions for login/register.
 * 🔒 Secures client-side credentials processing.
 */
"use client";

import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

/**
 * 🔑 Calculates password strength score (0 to 4)
 * Evaluates length, letter casing, numbers, and special characters.
 */
export function getPasswordStrength(pw: string): number {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

/**
 * 🎨 Password Strength Meter UI Configuration
 * Maps score indexes to CSS class indicators and labels.
 */
export const strengthConfig = [
  { color: "bg-error", label: "Too weak ❌" },
  { color: "bg-error", label: "Weak ⚠️" },
  { color: "bg-warning", label: "Fair ⚡" },
  { color: "bg-success", label: "Strong 💪" },
  { color: "bg-success", label: "Very strong 🏆" },
];

/**
 * 🔐 Custom Hook: useLogin
 * Manages states for secure session initiation and authentication errors.
 */
export function useLogin() {
  const { login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * 📤 Handles Login Form Submission
   * Sends user credentials to the auth controller, capturing failed attempts.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Login failed. Please try again. 😢";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    loading,
    handleSubmit,
  };
}

/**
 * 🆕 Custom Hook: useRegister
 * Governs registration forms, checking password integrity prior to sign-up.
 */
export function useRegister() {
  const { register } = useAuthContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * 📊 Real-time Password Strength Evaluation
   * Provides dynamic visual feedback during user input.
   */
  const strength = getPasswordStrength(password);

  /**
   * 📤 Handles Registration Form Submission
   * Ensures passwords match and calls register service.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match! 😟");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Registration failed. Please try again. 😢";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    setError,
    loading,
    strength,
    strengthConfig,
    handleSubmit,
  };
}
