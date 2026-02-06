"use client";

import type { MouseEvent, ReactNode } from "react";
import { useRef } from "react";

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(255, 153, 31, 0.14)",
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    container.style.setProperty("--spotlight-x", `${e.clientX - rect.left}px`);
    container.style.setProperty("--spotlight-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(
          460px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%),
          ${spotlightColor},
          transparent 62%
        )`,
      }}
    >
      {children}
    </div>
  );
}
