import type { Theme } from "./app-state";

export function normalizeTheme(theme: unknown, fallback: Theme = "dark"): Theme {
  return theme === "light" ? "light" : theme === "dark" ? "dark" : fallback;
}

export function nextThemeFromCurrent(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}

export function nextThemeFromDomHasDark(hasDarkClass: boolean): Theme {
  return hasDarkClass ? "light" : "dark";
}
