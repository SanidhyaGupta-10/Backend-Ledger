/**
 * @fileoverview GlassCard — reusable glassmorphism card wrapper.
 * Applies the frosted glass effect with optional hover animation.
 */

import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** When true, card lifts and glows gold on hover */
  hover?: boolean;
}

export default function GlassCard({ children, className = "", hover = false }: GlassCardProps) {
  return (
    <div className={`glass ${hover ? "glass-hover" : ""} ${className}`}>
      {children}
    </div>
  );
}
