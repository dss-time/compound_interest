import { sanitizeState, type AppState } from "./app-state";

export function buildHydratedStatePatch(storageData: unknown, shareData: unknown): Partial<AppState> | null {
  let patch: Partial<AppState> | null = null;

  if (storageData && typeof storageData === "object") {
    const { lang: _lang, theme: _theme, ...rest } = sanitizeState(storageData);
    patch = { ...(patch || {}), ...rest };
  }

  if (shareData && typeof shareData === "object") {
    const { lang: _lang, theme: _theme, ...rest } = sanitizeState(shareData);
    patch = { ...(patch || {}), ...rest };
  }

  return patch;
}
