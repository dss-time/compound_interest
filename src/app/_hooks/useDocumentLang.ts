"use client";

import { useEffect, useState } from "react";

function readLang() {
  if (typeof document === "undefined") return "zh" as const;
  return document.documentElement.lang.toLowerCase().startsWith("en") ? ("en" as const) : ("zh" as const);
}

export function useDocumentLang() {
  const [lang, setLang] = useState<"zh" | "en">(() => readLang());

  useEffect(() => {
    setLang(readLang());
    const observer = new MutationObserver(() => setLang(readLang()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);

  return lang;
}
