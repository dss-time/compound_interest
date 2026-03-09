import { useEffect, useLayoutEffect } from "react";
import { normalizeTheme } from "@/lib/theme";

export function useDocumentMeta(lang: "zh" | "en", theme: "dark" | "light") {
  useLayoutEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  useLayoutEffect(() => {
    // Ensure deterministic initial theme. Default to dark when theme is missing/invalid.
    const nextTheme = normalizeTheme(theme, "dark");
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, [theme]);

  useLayoutEffect(() => {
    // Fallback: if no explicit class has been applied yet, keep default dark.
    if (!document.documentElement.classList.contains("dark") && !document.documentElement.dataset.theme) {
      document.documentElement.classList.add("dark");
      document.documentElement.dataset.theme = "dark";
    }
  }, [theme]);
}
