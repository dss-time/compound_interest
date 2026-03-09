import { create } from "zustand";

import { AppState, DEFAULTS, Scenario, ChartMode, ResultSnapshot, STORAGE_KEY, sanitizeState } from "@/lib/app-state";
import { PRESETS } from "@/lib/presets";
import { initCalendars } from "@/lib/calc";
import { safeJsonParse } from "@/lib/utils";

type AppStore = {
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
  calendars: ReturnType<typeof initCalendars>;
  setCalendars: (
    c:
      | ReturnType<typeof initCalendars>
      | ((prev: ReturnType<typeof initCalendars>) => ReturnType<typeof initCalendars>)
  ) => void;
  copyLabel: string | null;
  setCopyLabel: (v: string | null) => void;
  shareLabel: string | null;
  setShareLabel: (v: string | null) => void;
  presetId: string;
  setPresetId: (id: string) => void;
  saveStatus: string;
  setSaveStatus: (v: string) => void;
  scenarios: Scenario[];
  setScenarios: (s: Scenario[] | ((prev: Scenario[]) => Scenario[])) => void;
  chartMode: ChartMode;
  setChartMode: (v: ChartMode) => void;
  snapshot: ResultSnapshot | null;
  setSnapshot: (snapshot: ResultSnapshot | null) => void;
  snapshots: ResultSnapshot[];
  setSnapshots: (items: ResultSnapshot[] | ((prev: ResultSnapshot[]) => ResultSnapshot[])) => void;
  selectedSnapshotId: string | null;
  setSelectedSnapshotId: (id: string | null) => void;
};

function getInitialAppState(): AppState {
  if (typeof window === "undefined") return { ...DEFAULTS };
  const domTheme =
    document.documentElement.dataset.theme === "light" || !document.documentElement.classList.contains("dark") ? "light" : "dark";
  const domLang = document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "zh";

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = safeJsonParse(raw);
      if (parsed.ok) {
        const next = sanitizeState(parsed.data);
        return {
          ...next,
          lang: domLang,
          theme: domTheme,
        };
      }
    }
  } catch {
    // Fall through to DOM-derived defaults.
  }

  return {
    ...DEFAULTS,
    theme: domTheme,
    lang: domLang,
  };
}

export const useAppStore = create<AppStore>((set) => ({
  state: getInitialAppState(),
  setState: (updater) => set((store) => ({ state: updater(store.state) })),
  calendars: initCalendars(),
  setCalendars: (c) =>
    set((store) => ({
      calendars: typeof c === "function" ? c(store.calendars) : c,
    })),
  copyLabel: null,
  setCopyLabel: (v) => set({ copyLabel: v }),
  shareLabel: null,
  setShareLabel: (v) => set({ shareLabel: v }),
  presetId: PRESETS[0]?.id || "",
  setPresetId: (id) => set({ presetId: id }),
  saveStatus: "",
  setSaveStatus: (v) => set({ saveStatus: v }),
  scenarios: [],
  setScenarios: (s) => set((store) => ({ scenarios: typeof s === "function" ? s(store.scenarios) : s })),
  chartMode: "balance_profit",
  setChartMode: (v) => set({ chartMode: v }),
  snapshot: null,
  setSnapshot: (snapshot) => set({ snapshot }),
  snapshots: [],
  setSnapshots: (items) => set((store) => ({ snapshots: typeof items === "function" ? items(store.snapshots) : items })),
  selectedSnapshotId: null,
  setSelectedSnapshotId: (id) => set({ selectedSnapshotId: id }),
}));
