/**
 * @fileoverview Root Layout — wraps every page in the app.
 * Sets up Inter font, AuthProvider context, Navbar, and animated background.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";

/** Inter font — loaded from Google Fonts with CSS variable for Tailwind */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/** SEO metadata — shown in browser tab and search results */
export const metadata: Metadata = {
  title: "NexBank — Banking Reimagined",
  description: "Premium next-generation banking with instant transfers, secure ledger, and smart insights.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* AuthProvider gives all pages access to login state */}
        <AuthProvider>
          <AnimatedBackground />
          <Navbar />
          {/* pt-16 offsets the fixed navbar height */}
          <main className="relative z-10 flex-1 pt-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
