import { sanitizeState, type AppState } from "./app-state";

export function buildHydratedStatePatch(storageData: unknown, shareData: unknown): AppState | null {
  let patch: AppState | null = null;

  if (storageData && typeof storageData === "object") {
    patch = { ...(patch || {}), ...sanitizeState(storageData) };
  }

  if (shareData && typeof shareData === "object") {
    patch = { ...(patch || {}), ...sanitizeState(shareData) };
  }

  return patch;
}
