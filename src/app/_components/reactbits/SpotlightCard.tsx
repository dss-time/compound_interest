"use client";

import type { MouseEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";

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
  const frameRef = useRef<number | null>(null);
  const nextPointRef = useRef<{ x: string; y: string }>({ x: "50%", y: "50%" });

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const scheduleSpotlight = (x: string, y: string) => {
    nextPointRef.current = { x, y };
    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const container = containerRef.current;
      if (!container) return;
      container.style.setProperty("--spotlight-x", nextPointRef.current.x);
      container.style.setProperty("--spotlight-y", nextPointRef.current.y);
    });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    scheduleSpotlight(`${e.clientX - rect.left}px`, `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => scheduleSpotlight("50%", "50%")}
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
