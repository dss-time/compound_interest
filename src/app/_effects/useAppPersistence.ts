import { useEffect, useLayoutEffect, useRef } from "react";

import { decodeState, safeJsonParse } from "@/lib/utils";
import { buildHydratedStatePatch } from "@/lib/persistence";
import {
  CALENDAR_KEY,
  SCENARIO_KEY,
  SHARE_KEY,
  STORAGE_KEY,
  hydrateCalendars,
  serializeCalendars,
} from "@/lib/app-state";

export function useAppPersistence({
  state,
  setState,
  calendars,
  setCalendars,
  scenarios,
  setScenarios,
  lastSaveRef,
  setSaveStatus,
  t,
}: any) {
  const didHydrateRef = useRef(false);
  const hydrationDoneRef = useRef(false);
  const skipNextStateSaveRef = useRef(false);

  useLayoutEffect(() => {
    if (didHydrateRef.current) return;
    didHydrateRef.current = true;
    let storageData: unknown = null;
    let shareData: unknown = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = safeJsonParse(raw);
        if (parsed.ok) {
          storageData = parsed.data;
        }
      }

      const calRaw = localStorage.getItem(CALENDAR_KEY);
      if (calRaw) {
        const parsed = safeJsonParse(calRaw);
        if (parsed.ok) {
          setCalendars((prev: any) => hydrateCalendars(prev, parsed.data));
        }
      }

      const url = new URL(window.location.href);
      const s = url.searchParams.get(SHARE_KEY);
      if (s) {
        const decoded = decodeState(s);
        if (decoded.ok) {
          shareData = decoded.data;
        }
      }

      const mergedStatePatch = buildHydratedStatePatch(storageData, shareData);
      if (mergedStatePatch) {
        // Prevent the first persistence effect from writing stale pre-hydration defaults.
        skipNextStateSaveRef.current = true;
        setState((prev: any) => ({ ...prev, ...mergedStatePatch }));
      }

      const scenarioRaw = localStorage.getItem(SCENARIO_KEY);
      if (scenarioRaw) {
        const parsed = safeJsonParse(scenarioRaw);
        if (parsed.ok && Array.isArray(parsed.data)) {
          setScenarios(parsed.data);
        }
      }
    } catch (e) {
      if (setSaveStatus) setSaveStatus(t?.("presetSaveFailed") || "");
    }

    hydrationDoneRef.current = true;
  }, [setState, setCalendars, setScenarios, setSaveStatus, t]);

  useEffect(() => {
    if (!hydrationDoneRef.current) return;
    if (skipNextStateSaveRef.current) {
      skipNextStateSaveRef.current = false;
      return;
    }
    const now = Date.now();
    if (lastSaveRef?.current && now - lastSaveRef.current < 300) return;
    if (lastSaveRef) lastSaveRef.current = now;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (setSaveStatus) setSaveStatus(t?.("presetSaved") || "");
    } catch (e) {
      if (setSaveStatus) setSaveStatus(t?.("presetSaveFailed") || "");
    }
  }, [state, t, lastSaveRef, setSaveStatus]);

  useEffect(() => {
    if (!hydrationDoneRef.current) return;
    try {
      const payload = serializeCalendars(calendars);
      localStorage.setItem(CALENDAR_KEY, JSON.stringify(payload));
    } catch (e) {
      if (setSaveStatus) setSaveStatus(t?.("presetSaveFailed") || "");
    }
  }, [calendars, t, setSaveStatus]);

  useEffect(() => {
    if (!hydrationDoneRef.current) return;
    try {
      localStorage.setItem(SCENARIO_KEY, JSON.stringify(scenarios));
    } catch (e) {
      if (setSaveStatus) setSaveStatus(t?.("presetSaveFailed") || "");
    }
  }, [scenarios, t, setSaveStatus]);
}
