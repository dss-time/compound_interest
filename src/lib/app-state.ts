import { setCalendar } from "@/lib/calc";

export const STORAGE_KEY = "ci_settings_v1";
export const CALENDAR_KEY = "ci_calendars_v1";
export const SCENARIO_KEY = "ci_scenarios_v1";
export const SHARE_KEY = "s";

export type Lang = "zh" | "en";
export type Theme = "dark" | "light";
export type SimMode = "monthly" | "tradingDays";
export type Market = "CN" | "US";
export type RateMode = "daily" | "annual";
export type DurationUnit = "months" | "years";
export type CalcMode = "compound" | "simple";
export type DdMode = "single" | "multi" | "random";
export type RandMethod = "prob" | "count";
export type Currency = "CNY" | "USD";

export type AppState = {
  lang: Lang;
  theme: Theme;
  simMode: SimMode;
  market: Market;
  startDate: string;
  rateMode: RateMode;
  dailyRate: number;
  annualRate: number;
  principal: number;
  monthlyRate: number;
  duration: number;
  durationUnit: DurationUnit;
  mode: CalcMode;
  showAnnualized: boolean;
  ddEnabled: boolean;
  ddMode: DdMode;
  ddList: string;
  ddStrategy: "worst" | "fixed";
  ddMonth: number;
  ddSeq: string;
  ddPool: string;
  randMethod: RandMethod;
  randProb: number;
  randCount: number;
  simRuns: number;
  simSeed: string;
  currency: Currency;
  fxRate: number;
};

export const DEFAULTS: AppState = {
  lang: "zh",
  theme: "dark",
  simMode: "monthly",
  market: "CN",
  startDate: "",
  rateMode: "daily",
  dailyRate: 0.1,
  annualRate: 15,
  principal: 300000,
  monthlyRate: 2,
  duration: 12,
  durationUnit: "months",
  mode: "compound",
  showAnnualized: true,
  ddEnabled: true,
  ddMode: "single",
  ddList: "5,10,20,30",
  ddStrategy: "worst",
  ddMonth: 6,
  ddSeq: "10@6, 20@18",
  ddPool: "5,10,20,30",
  randMethod: "prob",
  randProb: 2,
  randCount: 6,
  simRuns: 2000,
  simSeed: "auto",
  currency: "CNY",
  fxRate: 7.2,
};

export type Scenario = {
  id: string;
  createdAt: number;
  label: string;
  params: AppState;
  result: {
    balance: number;
    profit: number;
    totalReturn: number;
    annualized: number;
    months: number;
    simMode: string;
    market: string;
    startDate: string;
    duration: number;
    durationUnit: string;
    rateMode: string;
    monthlyRate: number;
    dailyRate: number;
    annualRate: number;
  };
};

export type ResultSnapshot = {
  createdAt: number;
  balance: number;
  profit: number;
  annualized: number;
  drawdownImpact: number;
  chartData: Array<{ month: number; balance: number; profit: number; gain: number }>;
};

export type ChartMode = "balance_profit" | "balance" | "profit" | "gain";

export type BaseExtra = {
  startISO?: string;
  endISO?: string;
  tradingDays?: number;
};

export type BaseResult =
  | { ok: true; base: any; extra?: BaseExtra }
  | { ok: false; error: string; extra?: BaseExtra };

export function getMonths(duration: number, unit: DurationUnit) {
  const dur = Math.max(0, Number(duration) || 0);
  const months = unit === "years" ? Math.round(dur * 12) : Math.round(dur);
  return Math.max(0, months);
}

export function sanitizeState(raw: any): AppState {
  if (!raw || typeof raw !== "object") return { ...DEFAULTS };
  return {
    ...DEFAULTS,
    ...raw,
  } as AppState;
}

export function serializeCalendars(calendars: any) {
  const out: Record<string, string[]> = {};
  ["CN", "US"].forEach((m) => {
    if (calendars[m] && calendars[m] instanceof Set) {
      out[m] = Array.from(calendars[m]);
    }
  });
  return out;
}

export function hydrateCalendars(calendars: any, data: any) {
  let next = { ...calendars };
  if (!data || typeof data !== "object") return next;
  ["CN", "US"].forEach((m) => {
    if (Array.isArray(data[m])) {
      next = setCalendar(next, m, data[m], "local");
    }
  });
  return next;
}
