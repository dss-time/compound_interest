import { useEffect } from "react";

import { isInputLike } from "@/lib/utils";

type HotkeyHandlers = {
  onToggleLang: () => void;
  onToggleTheme: () => void;
  onReset: () => void;
  onCopy: () => void;
  onShare: () => void;
};

export function useHotkeys(handlers: HotkeyHandlers) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      if (isInputLike(e.target as HTMLElement)) return;
      const key = e.key.toLowerCase();
      if (key === "l") {
        e.preventDefault();
        handlers.onToggleLang();
      }
      if (key === "t") {
        e.preventDefault();
        handlers.onToggleTheme();
      }
      if (key === "r") {
        e.preventDefault();
        handlers.onReset();
      }
      if (key === "c") {
        e.preventDefault();
        handlers.onCopy();
      }
      if (key === "s") {
        e.preventDefault();
        handlers.onShare();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlers]);
}
