/**
 * @fileoverview Animated Background — floating gradient orbs behind all content.
 * Pure CSS animation, no JS overhead. Fixed position so it scrolls with the page.
 */

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Purple orb — top left, largest */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20 animate-float"
        style={{
          background: "radial-gradient(circle, #9b59b6 0%, transparent 70%)",
          top: "10%",
          left: "10%",
        }}
      />
      {/* Gold orb — top right */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-15 animate-float-delayed"
        style={{
          background: "radial-gradient(circle, #d4af37 0%, transparent 70%)",
          top: "20%",
          right: "15%",
        }}
      />
      {/* Deep violet orb — bottom center */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-10 animate-float-slow"
        style={{
          background: "radial-gradient(circle, #8e44ad 0%, transparent 70%)",
          bottom: "5%",
          left: "40%",
        }}
      />
      {/* Small gold orb — mid left */}
      <div
        className="absolute w-[250px] h-[250px] rounded-full opacity-20 animate-float-delayed"
        style={{
          background: "radial-gradient(circle, #f0d060 0%, transparent 70%)",
          top: "60%",
          left: "5%",
        }}
      />
    </div>
  );
}
