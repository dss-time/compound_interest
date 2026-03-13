"use client";

import { useEffect } from "react";

const BUTTON_SELECTOR = [
  "button.liquid-button",
  ".liquid-button",
  "[data-liquid-button='true']",
  ".btn",
  ".button",
].join(", ");

export function LiquidEffects() {
  useEffect(() => {
    const timers = new WeakMap<HTMLElement, number>();

    const triggerRipple = (button: HTMLElement, event: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const hasPoint = Number.isFinite(event.clientX) && Number.isFinite(event.clientY) && (event.clientX !== 0 || event.clientY !== 0);
      const x = hasPoint ? event.clientX - rect.left : rect.width / 2;
      const y = hasPoint ? event.clientY - rect.top : rect.height / 2;

      button.style.setProperty("--ripple-x", `${x}px`);
      button.style.setProperty("--ripple-y", `${y}px`);
      button.classList.remove("ripple-active");

      const prevTimer = timers.get(button);
      if (prevTimer) window.clearTimeout(prevTimer);

      window.requestAnimationFrame(() => {
        button.classList.add("ripple-active");
        const timer = window.setTimeout(() => {
          button.classList.remove("ripple-active");
          timers.delete(button);
        }, 500);
        timers.set(button, timer);
      });
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest(BUTTON_SELECTOR) : null;
      if (!(target instanceof HTMLElement)) return;
      if (target.classList.contains("no-liquid")) return;
      triggerRipple(target, event);
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}
