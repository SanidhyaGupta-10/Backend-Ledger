/**
 * @fileoverview LoadingSpinner — pulsing gold ring shown during API calls.
 * Centered by default, can be used inline with size prop.
 */

export default function LoadingSpinner({ size = "lg" }: { size?: "sm" | "lg" }) {
  const dimension = size === "sm" ? "w-6 h-6" : "w-12 h-12";

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${dimension} rounded-full border-2 border-glass-border border-t-gold animate-spin-slow`}
      />
    </div>
  );
}
