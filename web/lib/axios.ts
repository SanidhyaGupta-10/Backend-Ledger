/**
 * @fileoverview Axios HTTP client configured for NexBank backend.
 * Creates a reusable instance with baseURL, JSON headers, and JWT interceptor.
 */

import axios from "axios";

/** Backend API URL — NEXT_PUBLIC_ prefix makes it accessible in the browser */
const backend_api =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api";

/**
 * Pre-configured Axios instance.
 * All API calls should use this instead of raw axios.
 */
export const api = axios.create({
  baseURL: backend_api,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor — auto-attaches JWT token from localStorage
 * to every outgoing request as a Bearer Authorization header.
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("nexbank_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);