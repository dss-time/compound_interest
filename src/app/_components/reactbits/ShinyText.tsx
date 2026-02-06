"use client";

import type { CSSProperties, ReactNode } from "react";

export default function ShinyText({
  children,
  className = "",
  shimmerWidth = 130,
  speed = 2.6,
}: {
  children: ReactNode;
  className?: string;
  shimmerWidth?: number;
  speed?: number;
}) {
  const shimmerStyle: CSSProperties = {
    backgroundImage: `linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0) 16%,
      rgba(255, 255, 255, 0.62) 50%,
      rgba(255, 255, 255, 0) 84%,
      transparent 100%
    )`,
    backgroundSize: `${shimmerWidth}% 100%`,
    backgroundRepeat: "no-repeat",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    animation: `rb-shimmer ${speed}s linear infinite`,
  };

  return (
    <>
      <style jsx>{`
        @keyframes rb-shimmer {
          0% {
            background-position: -${shimmerWidth}% 0;
          }
          100% {
            background-position: ${shimmerWidth + 100}% 0;
          }
        }
      `}</style>
      <span className={`relative inline-block ${className}`}>
        <span className="relative z-10">{children}</span>
        <span className="pointer-events-none absolute inset-0 z-20" style={shimmerStyle}>
          {children}
        </span>
      </span>
    </>
  );
}
