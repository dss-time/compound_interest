import { useEffect } from "react";

export function useDocumentMeta(lang: "zh" | "en", theme: "dark" | "light") {
  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
}
