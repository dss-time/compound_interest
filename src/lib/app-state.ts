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
  uiMode: "basic" | "pro";
  devMode: boolean;
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
  uiMode: "basic",
  devMode: false,
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
    currency: Currency;
    fxRate: number;
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
  id: string;
  createdAt: number;
  currency: Currency;
  fxRate: number;
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

  const pick = <T extends string>(value: any, allowed: readonly T[], fallback: T): T =>
    allowed.includes(value) ? (value as T) : fallback;
  const num = (value: any, fallback: number) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };
  const str = (value: any, fallback: string) => (typeof value === "string" ? value : fallback);
  const bool = (value: any, fallback: boolean) => (typeof value === "boolean" ? value : fallback);

  return {
    lang: pick(raw.lang, ["zh", "en"] as const, DEFAULTS.lang),
    theme: pick(raw.theme, ["dark", "light"] as const, DEFAULTS.theme),
    uiMode: pick(raw.uiMode, ["basic", "pro"] as const, DEFAULTS.uiMode),
    devMode: bool(raw.devMode, DEFAULTS.devMode),
    simMode: pick(raw.simMode, ["monthly", "tradingDays"] as const, DEFAULTS.simMode),
    market: pick(raw.market, ["CN", "US"] as const, DEFAULTS.market),
    startDate: str(raw.startDate, DEFAULTS.startDate),
    rateMode: pick(raw.rateMode, ["daily", "annual"] as const, DEFAULTS.rateMode),
    dailyRate: num(raw.dailyRate, DEFAULTS.dailyRate),
    annualRate: num(raw.annualRate, DEFAULTS.annualRate),
    principal: num(raw.principal, DEFAULTS.principal),
    monthlyRate: num(raw.monthlyRate, DEFAULTS.monthlyRate),
    duration: num(raw.duration, DEFAULTS.duration),
    durationUnit: pick(raw.durationUnit, ["months", "years"] as const, DEFAULTS.durationUnit),
    mode: pick(raw.mode, ["compound", "simple"] as const, DEFAULTS.mode),
    showAnnualized: bool(raw.showAnnualized, DEFAULTS.showAnnualized),
    ddEnabled: bool(raw.ddEnabled, DEFAULTS.ddEnabled),
    ddMode: pick(raw.ddMode, ["single", "multi", "random"] as const, DEFAULTS.ddMode),
    ddList: str(raw.ddList, DEFAULTS.ddList),
    ddStrategy: pick(raw.ddStrategy, ["worst", "fixed"] as const, DEFAULTS.ddStrategy),
    ddMonth: num(raw.ddMonth, DEFAULTS.ddMonth),
    ddSeq: str(raw.ddSeq, DEFAULTS.ddSeq),
    ddPool: str(raw.ddPool, DEFAULTS.ddPool),
    randMethod: pick(raw.randMethod, ["prob", "count"] as const, DEFAULTS.randMethod),
    randProb: num(raw.randProb, DEFAULTS.randProb),
    randCount: num(raw.randCount, DEFAULTS.randCount),
    simRuns: num(raw.simRuns, DEFAULTS.simRuns),
    simSeed: str(raw.simSeed, DEFAULTS.simSeed),
    currency: pick(raw.currency, ["CNY", "USD"] as const, DEFAULTS.currency),
    fxRate: num(raw.fxRate, DEFAULTS.fxRate),
  };
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
  const isISODate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
  const buildYearCountFromISOList = (isoList: string[]) => {
    const yearCount = new Map<number, number>();
    for (const iso of isoList) {
      const y = Number(String(iso).slice(0, 4));
      if (Number.isFinite(y)) yearCount.set(y, (yearCount.get(y) || 0) + 1);
    }
    return yearCount;
  };
  const setCalendarLocal = (nextCalendars: any, market: "CN" | "US", dates: string[], source: string) => {
    const arr = (dates || [])
      .map(String)
      .map((d) => d.trim())
      .filter((d) => isISODate(d));
    const uniq = Array.from(new Set(arr)).sort();
    const out = { ...nextCalendars };
    out[market] = new Set(uniq);
    out.meta = {
      ...out.meta,
      [market]: {
        count: uniq.length,
        min: uniq[0] || null,
        max: uniq[uniq.length - 1] || null,
        source,
      },
    };
    out.yearCount = {
      ...out.yearCount,
      [market]: buildYearCountFromISOList(uniq),
    };
    return out;
  };

  let next = { ...calendars };
  if (!data || typeof data !== "object") return next;
  ["CN", "US"].forEach((m) => {
    if (Array.isArray(data[m])) {
      next = setCalendarLocal(next, m as "CN" | "US", data[m], "local");
    }
  });
  return next;
}
