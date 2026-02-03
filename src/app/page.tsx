"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HelpCircle, Languages, Moon, RefreshCw, Share2, Sun, Copy } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { t as tr } from "@/lib/i18n";
import {
  addMonths,
  clamp,
  decodeState,
  encodeState,
  fmtCNY,
  fmtPct,
  formatNow,
  isInputLike,
  parsePctList,
  parseSeq,
  safeJsonParse,
  toISODate,
} from "@/lib/utils";
import {
  buildEventsMapFromSeq,
  calcMonthlyTimeline,
  calcTradingDaysTimelineStrict,
  calcSingleDrawdown,
  calcWorstSingle,
  initCalendars,
  parseCalendarJSON,
  setCalendar,
  simulateRandom,
  calendarCoversRange,
} from "@/lib/calc";
import { PRESETS } from "@/lib/presets";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const STORAGE_KEY = "ci_settings_v1";
const CALENDAR_KEY = "ci_calendars_v1";
const SCENARIO_KEY = "ci_scenarios_v1";
const SHARE_KEY = "s";

const DEFAULTS = {
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
};

type Scenario = {
  id: string;
  createdAt: number;
  label: string;
  params: typeof DEFAULTS;
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

type ChartMode = "balance_profit" | "balance" | "profit" | "gain";

function getMonths(duration, unit) {
  const dur = Math.max(0, Number(duration) || 0);
  const months = unit === "years" ? Math.round(dur * 12) : Math.round(dur);
  return Math.max(0, months);
}

function sanitizeState(raw) {
  if (!raw || typeof raw !== "object") return { ...DEFAULTS };
  return {
    ...DEFAULTS,
    ...raw,
  };
}

function serializeCalendars(calendars) {
  const out = {};
  ["CN", "US"].forEach((m) => {
    if (calendars[m] && calendars[m] instanceof Set) {
      out[m] = Array.from(calendars[m]);
    }
  });
  return out;
}

function hydrateCalendars(calendars, data) {
  let next = { ...calendars };
  if (!data || typeof data !== "object") return next;
  ["CN", "US"].forEach((m) => {
    if (Array.isArray(data[m])) {
      next = setCalendar(next, m, data[m], "local");
    }
  });
  return next;
}

function HelpTip({ text }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
  );
}

function Field({ label, help, children, inline = false }) {
  return (
    <div className={inline ? "grid gap-2" : "grid gap-2"}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <span>{label}</span>
        {help ? <HelpTip text={help} /> : null}
      </div>
      {children}
    </div>
  );
}

export default function Page() {
  const [state, setState] = useState({ ...DEFAULTS });
  const [calendars, setCalendars] = useState(initCalendars());
  const [nowText, setNowText] = useState("");
  const [copyLabel, setCopyLabel] = useState(null);
  const [shareLabel, setShareLabel] = useState(null);
  const [presetId, setPresetId] = useState(PRESETS[0]?.id || "");
  const [saveStatus, setSaveStatus] = useState("");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [chartMode, setChartMode] = useState<ChartMode>("balance_profit");

  const lastSaveRef = useRef(0);

  const lang = state.lang;
  const theme = state.theme;
  const t = (key, vars) => tr(lang, key, vars);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (state.simMode === "tradingDays" && !state.startDate) {
      setState((s) => ({ ...s, startDate: toISODate(new Date()) }));
    }
  }, [state.simMode, state.startDate]);

  useEffect(() => {
    const tick = () => setNowText(formatNow(lang));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lang]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = safeJsonParse(raw);
      if (parsed.ok) {
        setState((prev) => ({ ...prev, ...sanitizeState(parsed.data) }));
      }
    }

    const calRaw = localStorage.getItem(CALENDAR_KEY);
    if (calRaw) {
      const parsed = safeJsonParse(calRaw);
      if (parsed.ok) {
        setCalendars((prev) => hydrateCalendars(prev, parsed.data));
      }
    }

    const url = new URL(window.location.href);
    const s = url.searchParams.get(SHARE_KEY);
    if (s) {
      const decoded = decodeState(s);
      if (decoded.ok) {
        setState((prev) => ({ ...prev, ...sanitizeState(decoded.data) }));
      }
    }

    const scenarioRaw = localStorage.getItem(SCENARIO_KEY);
    if (scenarioRaw) {
      const parsed = safeJsonParse(scenarioRaw);
      if (parsed.ok && Array.isArray(parsed.data)) {
        setScenarios(parsed.data);
      }
    }
  }, []);

  useEffect(() => {
    const now = Date.now();
    if (now - lastSaveRef.current < 300) return;
    lastSaveRef.current = now;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSaveStatus(t("presetSaved"));
    } catch (e) {
      setSaveStatus(t("presetSaveFailed"));
    }
  }, [state, t]);

  useEffect(() => {
    try {
      const payload = serializeCalendars(calendars);
      localStorage.setItem(CALENDAR_KEY, JSON.stringify(payload));
    } catch (e) {
      setSaveStatus(t("presetSaveFailed"));
    }
  }, [calendars, t]);

  useEffect(() => {
    try {
      localStorage.setItem(SCENARIO_KEY, JSON.stringify(scenarios));
    } catch (e) {
      setSaveStatus(t("presetSaveFailed"));
    }
  }, [scenarios, t]);

  useEffect(() => {
    const onKey = (e) => {
      if (!e.altKey) return;
      if (isInputLike(e.target)) return;
      const key = e.key.toLowerCase();
      if (key === "l") {
        e.preventDefault();
        setState((s) => ({ ...s, lang: s.lang === "zh" ? "en" : "zh" }));
      }
      if (key === "t") {
        e.preventDefault();
        setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));
      }
      if (key === "r") {
        e.preventDefault();
        resetToDemo();
      }
      if (key === "c") {
        e.preventDefault();
        handleCopy();
      }
      if (key === "s") {
        e.preventDefault();
        handleShare();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const months = getMonths(state.duration, state.durationUnit);

  const baseResult = useMemo(() => {
    if (state.simMode === "monthly") {
      return {
        ok: true,
        base: calcMonthlyTimeline({
          principal: state.principal,
          monthlyRate: state.monthlyRate / 100,
          months,
          mode: state.mode,
          events: [],
        }),
      };
    }

    if (!state.startDate) {
      return { ok: false, error: lang === "zh" ? "请填写开始日期。" : "Please set a start date." };
    }
    if (months <= 0) {
      return {
        ok: false,
        error: lang === "zh" ? "投资时长必须大于 0。" : "Duration must be greater than 0.",
      };
    }

    const meta = calendars.meta[state.market];
    if (!meta || !meta.count) {
      return { ok: false, error: t("errNeedCalendarHint") };
    }

    const startDate = new Date(state.startDate + "T00:00:00");
    if (!isFinite(startDate.getTime())) {
      return { ok: false, error: lang === "zh" ? "开始日期无效。" : "Invalid start date." };
    }

    const tl = calcTradingDaysTimelineStrict({
      calendars,
      principal: state.principal,
      startDate,
      months,
      mode: state.mode,
      market: state.market,
      rateMode: state.rateMode,
      dailyRateDecimal: state.dailyRate / 100,
      annualRateDecimal: state.annualRate / 100,
      eventsByMonth: new Map(),
      t,
      lang,
    });

    if (!tl.ok) return { ok: false, error: tl.error };
    return { ok: true, base: tl, extra: tl.extra };
  }, [state, months, calendars, lang, t]);

  const ddResult = useMemo(() => {
    if (!baseResult.ok || !state.ddEnabled) return { ok: true, mode: "off" };
    const base = baseResult.base;

    if (state.ddMode === "single") {
      const list = parsePctList(state.ddList);
      const ddPctList = list.length ? list : [10];
      const strategy = state.ddStrategy;
      const fixedMonth = clamp(Math.floor(Number(state.ddMonth) || 1), 1, Math.max(1, months));

      const results = [];
      for (const dd of ddPctList) {
        if (strategy === "worst") {
          const r = calcWorstSingle({
            ...state,
            calendars,
            months,
            drawdownPct: dd,
            drawdownMonth: 1,
            principal: state.principal,
            monthlyRate: state.monthlyRate / 100,
            dailyRateDecimal: state.dailyRate / 100,
            annualRateDecimal: state.annualRate / 100,
            t,
            lang,
          });
          if (!r.ok) return { ok: false, error: r.error };
          results.push(r);
        } else {
          const r = calcSingleDrawdown({
            ...state,
            calendars,
            months,
            drawdownPct: dd,
            drawdownMonth: fixedMonth,
            principal: state.principal,
            monthlyRate: state.monthlyRate / 100,
            dailyRateDecimal: state.dailyRate / 100,
            annualRateDecimal: state.annualRate / 100,
            t,
            lang,
          });
          if (!r.ok) return { ok: false, error: r.error };
          results.push(r);
        }
      }
      return { ok: true, mode: "single", strategy, results, base };
    }

    if (state.ddMode === "multi") {
      const seq = parseSeq(state.ddSeq);
      const eventsByMonth = buildEventsMapFromSeq(seq);
      let tl;

      if (state.simMode === "monthly") {
        tl = calcMonthlyTimeline({
          principal: state.principal,
          monthlyRate: state.monthlyRate / 100,
          months,
          mode: state.mode,
          events: seq,
        });
      } else {
        const startDate = new Date(state.startDate + "T00:00:00");
        tl = calcTradingDaysTimelineStrict({
          calendars,
          principal: state.principal,
          startDate,
          months,
          mode: state.mode,
          market: state.market,
          rateMode: state.rateMode,
          dailyRateDecimal: state.dailyRate / 100,
          annualRateDecimal: state.annualRate / 100,
          eventsByMonth,
          t,
          lang,
        });
        if (!tl.ok) return { ok: false, error: tl.error };
      }
      return { ok: true, mode: "multi", seq, base, tl };
    }

    const pool = parsePctList(state.ddPool);
    const runs = Math.max(10, Math.floor(Number(state.simRuns) || 2000));
    const seedStr = (state.simSeed || "").trim() || "auto";
    const sim = simulateRandom({
      ...state,
      calendars,
      months,
      ddPool: pool.length ? pool : [10],
      runs,
      seedStr,
      method: state.randMethod,
      probPct: Number(state.randProb) || 0,
      count: Number(state.randCount) || 0,
      principal: state.principal,
      monthlyRate: state.monthlyRate / 100,
      dailyRateDecimal: state.dailyRate / 100,
      annualRateDecimal: state.annualRate / 100,
      t,
      lang,
    });
    if (!sim.ok) return { ok: false, error: sim.error };
    return { ok: true, mode: "random", sim, base };
  }, [baseResult, state, months, calendars, lang, t]);

  const calendarStatus = useMemo(() => {
    if (state.simMode !== "tradingDays") return "";
    const meta = calendars.meta[state.market];
    if (!meta || !meta.count) return t("calStatusNotImported");
    const mktName = state.market === "CN" ? t("calImportedCN") : t("calImportedUS");
    return `${t("calImportedPrefix")} ${mktName} ${t("calImportedMid")} ${meta.count} ${t("calImportedSuffix")} ${
      meta.min && meta.max ? `（${meta.min} ~ ${meta.max}）` : ""
    }`;
  }, [state.simMode, state.market, calendars, t]);

  const calendarBanner = useMemo(() => {
    if (state.simMode !== "tradingDays") return "";
    const meta = calendars.meta[state.market];
    if (!meta || !meta.count) return t("bannerNeedImport");
    if (!state.startDate || months <= 0) return "";
    const endEx = addMonths(new Date(state.startDate + "T00:00:00"), months);
    const cover = calendarCoversRange(calendars, state.market, state.startDate, toISODate(endEx), lang);
    if (!cover.ok) {
      return `${t("calCoverNotEnoughPrefix")}${cover.reason}${t("calCoverNeed")}${state.startDate} ~ ${toISODate(
        new Date(endEx.getTime() - 86400000)
      )}`;
    }
    return "";
  }, [state.simMode, state.market, state.startDate, months, calendars, lang, t]);

  const annualizedHint = useMemo(() => {
    if (!baseResult.ok || !state.showAnnualized) return "";
    if (state.simMode === "monthly") return t("annualHintMonthly");
    const extra = baseResult.extra || {};
    if (!extra.startISO || !extra.endISO) return "";
    const endExclusive = new Date(extra.endISO + "T00:00:00");
    endExclusive.setDate(endExclusive.getDate() - 1);
    return t("annualHintTradingTpl", {
      start: extra.startISO,
      end: toISODate(endExclusive),
      td: String(extra.tradingDays || 0),
    });
  }, [baseResult, state.showAnnualized, state.simMode, t]);

  const summaryText = useMemo(() => {
    if (!baseResult.ok) return "";
    const monthsText = getMonths(state.duration, state.durationUnit);
    if (state.simMode === "monthly") {
      return t("summaryMonthlyTpl", {
        balance: fmtCNY(lang, baseResult.base.balance),
        profit: fmtCNY(lang, baseResult.base.profit),
        annual: fmtPct(baseResult.base.annualized),
        months: String(monthsText),
      });
    }
    const extra = baseResult.extra || {};
    return t("summaryTradingTpl", {
      balance: fmtCNY(lang, baseResult.base.balance),
      profit: fmtCNY(lang, baseResult.base.profit),
      annual: fmtPct(baseResult.base.annualized),
      start: extra.startISO || "-",
      end: extra.endISO ? toISODate(new Date(new Date(extra.endISO).getTime() - 86400000)) : "-",
    });
  }, [baseResult, lang, state.duration, state.durationUnit, state.simMode, t]);

  const chartData = useMemo(() => {
    if (!baseResult.ok) return [];
    return baseResult.base.rows.map((r) => ({
      month: r.m,
      balance: r.balance,
      profit: r.profit,
      gain: r.gain,
    }));
  }, [baseResult]);

  const resetToDemo = () => {
    setState({ ...DEFAULTS, lang: state.lang, theme: state.theme });
  };

  const applyPreset = () => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setState((prev) => ({ ...prev, ...preset.values }));
  };

  const applyQuickPreset = (preset) => {
    setPresetId(preset.id);
    setState((prev) => ({ ...prev, ...preset.values }));
  };

  const saveScenario = () => {
    if (!baseResult.ok) return;
    const idx = scenarios.length + 1;
    const label = t("scenarioLabelTpl", { n: String(idx) });
    const monthsText = getMonths(state.duration, state.durationUnit);
    const next: Scenario = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      label,
      params: { ...state },
      result: {
        balance: baseResult.base.balance,
        profit: baseResult.base.profit,
        totalReturn: baseResult.base.totalReturn,
        annualized: baseResult.base.annualized,
        months: monthsText,
        simMode: state.simMode,
        market: state.market,
        startDate: state.startDate,
        duration: state.duration,
        durationUnit: state.durationUnit,
        rateMode: state.rateMode,
        monthlyRate: state.monthlyRate,
        dailyRate: state.dailyRate,
        annualRate: state.annualRate,
      },
    };
    setScenarios((prev) => [next, ...prev].slice(0, 6));
  };

  const removeScenario = (id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const buildCopyText = () => {
    if (!baseResult.ok) return baseResult.error;
    const params = state;

    let startISO = "-";
    let endISO = "-";
    let td = 0;

    let base = baseResult.base;
    if (params.simMode !== "monthly") {
      const extra = baseResult.extra || {};
      startISO = extra.startISO;
      const endExclusive = new Date(extra.endISO + "T00:00:00");
      endExclusive.setDate(endExclusive.getDate() - 1);
      endISO = toISODate(endExclusive);
      td = extra.tradingDays || 0;
    }

    const lines = [];
    if (params.simMode === "monthly") {
      lines.push(t("copySimMonthlyTpl", { mr: Number(params.monthlyRate).toFixed(2) }));
    } else {
      const mktName = params.market === "CN" ? t("mktCN") : t("mktUS");
      lines.push(
        t("copySimTradingTpl", {
          mkt: mktName,
          start: startISO,
          end: endISO,
          td: String(td),
        })
      );
      if (params.rateMode === "daily") {
        lines.push(t("copyDailyRateTpl", { dr: Number(params.dailyRate).toFixed(4) }));
      } else {
        lines.push(t("copyAnnualRateTpl", { ar: Number(params.annualRate).toFixed(2) }));
      }
    }

    lines.push(t("copyPrincipalTpl", { p: String(params.principal) }));
    lines.push(t("copyDurationTpl", { m: String(months) }));
    lines.push(params.mode === "compound" ? t("copyModeCompound") : t("copyModeSimple"));
    lines.push("");
    lines.push(t("copyTotalTpl", { v: fmtCNY(lang, base.balance) }));
    lines.push(t("copyProfitTpl", { v: fmtCNY(lang, base.profit) }));
    lines.push(t("copyTotalReturnTpl", { v: fmtPct(base.totalReturn) }));
    if (params.showAnnualized) lines.push(t("copyAnnualizedTpl", { v: fmtPct(base.annualized) }));

    return lines.join("\n");
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleCopy = async () => {
    const text = buildCopyText();
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopyLabel(t("copyBtnCopied"));
      setTimeout(() => setCopyLabel(null), 900);
    } else {
      alert(t("copyFail"));
    }
  };

  const handleShare = async () => {
    const shareState = { ...state };
    const encoded = encodeState(shareState);
    const url = new URL(window.location.href);
    url.searchParams.set(SHARE_KEY, encoded);
    const ok = await copyToClipboard(url.toString());
    if (ok) {
      setShareLabel(t("shareBtnCopied"));
      setTimeout(() => setShareLabel(null), 900);
    } else {
      alert(t("copyFail"));
    }
  };

  const onCalendarImport = async (file) => {
    try {
      const raw = await file.text();
      const res = parseCalendarJSON(raw, state.market, t);
      if (!res.ok) {
        alert(res.error || t("alertCalReadFail"));
        return;
      }
      let next = calendars;
      res.updates.forEach((u) => {
        next = setCalendar(next, u.market, u.dates, "import");
      });
      setCalendars(next);
    } catch (e) {
      alert(t("alertCalReadFail"));
    }
  };

  const renderTable = (headers, rows) => (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((h, idx) => (
            <TableHead key={idx} className={idx === 0 ? "text-center" : undefined}>
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, rIdx) => (
          <TableRow key={rIdx}>
            {row.map((cell, cIdx) => {
              if (cell && typeof cell === "object" && "text" in cell) {
                const tone =
                  cell.className === "good" ? "positive" : cell.className === "bad" ? "negative" : undefined;
                return (
                  <TableCell key={cIdx} className={`${tone || ""} ${cIdx === 0 ? "text-center" : ""}`}>
                    {cell.text}
                  </TableCell>
                );
              }
              return (
                <TableCell key={cIdx} className={cIdx === 0 ? "text-center" : undefined}>
                  {String(cell)}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderDetailsTable = () => {
    if (!baseResult.ok) return null;
    const headers = [t("thMonth"), t("thGain"), t("thProfit"), t("thBalance")];
    const body = baseResult.base.rows.map((r) => [
      r.m,
      fmtCNY(lang, r.gain),
      fmtCNY(lang, r.profit),
      fmtCNY(lang, r.balance),
    ]);
    return renderTable(headers, body);
  };

  const renderSingleDdTable = (data) => {
    const headers = [
      t("thDd"),
      t("thNetProfit"),
      t("thFinalBalance"),
      t("thPeak"),
      data.strategy === "fixed" ? t("thFixedMonth") : t("thWorstMonth"),
    ];
    const body = [];
    body.push(["-", fmtCNY(lang, data.base.profit), fmtCNY(lang, data.base.balance), "-", "-"]);
    data.results.forEach((r) => {
      const prClass = r.finalProfit >= 0 ? "good" : "bad";
      body.push([
        r.dd + "%",
        { text: fmtCNY(lang, r.finalProfit), className: prClass },
        fmtCNY(lang, r.finalBalance),
        isFinite(r.peakBefore) ? fmtCNY(lang, r.peakBefore) : "-",
        String(r.month),
      ]);
    });
    return renderTable(headers, body);
  };

  const renderMultiSummary = (data) => {
    const headers = [lang === "zh" ? "项目" : "Item", lang === "zh" ? "数值" : "Value"];
    const ddCount = data.seq.length;
    const worstPeak = data.tl.rows.reduce((acc, r) => Math.max(acc, r.peak), data.base.balance);
    const body = [
      [lang === "zh" ? "回撤次数" : "Drawdowns", String(ddCount)],
      [t("thNetProfit"), { text: fmtCNY(lang, data.tl.profit), className: data.tl.profit >= 0 ? "good" : "bad" }],
      [t("thFinalBalance"), fmtCNY(lang, data.tl.balance)],
      [
        lang === "zh" ? "相对无回撤差值" : "Delta vs no-DD",
        {
          text: fmtCNY(lang, data.tl.balance - data.base.balance),
          className: data.tl.balance - data.base.balance >= 0 ? "good" : "bad",
        },
      ],
      [lang === "zh" ? "周期内最高峰值（Peak）" : "Peak during period", fmtCNY(lang, worstPeak)],
    ];

    const evHeaders = [
      lang === "zh" ? "序号" : "#",
      t("thMonth"),
      t("thDd"),
      lang === "zh" ? "回撤前 Peak" : "Peak before DD",
      lang === "zh" ? "回撤后余额" : "Balance after DD",
    ];
    const evRows = data.tl.appliedEvents.map((e, idx) => [
      String(idx + 1),
      String(e.month),
      e.dd + "%",
      fmtCNY(lang, e.peakBefore),
      fmtCNY(lang, e.balanceAfter),
    ]);

    return (
      <div className="grid gap-4">
        <div className="table-scroll">{renderTable(headers, body)}</div>
        <div className="table-scroll">{renderTable(evHeaders, evRows.length ? evRows : [["-", "-", "-", "-", "-"]])}</div>
      </div>
    );
  };

  const renderRandomSummary = (data) => {
    const headers = [t("thMetric"), t("thP50"), t("thP90Worst"), t("thMin"), t("thMax")];
    const body = [
      [
        t("thNetProfit"),
        fmtCNY(lang, data.sim.profit.p50),
        fmtCNY(lang, data.sim.profit.p90Worst),
        fmtCNY(lang, data.sim.profit.min),
        fmtCNY(lang, data.sim.profit.max),
      ],
      [
        t("thFinalBalance"),
        fmtCNY(lang, data.sim.balance.p50),
        fmtCNY(lang, data.sim.balance.p90Worst),
        fmtCNY(lang, data.sim.balance.min),
        fmtCNY(lang, data.sim.balance.max),
      ],
      [
        lang === "zh" ? "相对无回撤差值（余额）" : "Delta vs no-DD (balance)",
        fmtCNY(lang, data.sim.balance.p50 - data.base.balance),
        fmtCNY(lang, data.sim.balance.p90Worst - data.base.balance),
        fmtCNY(lang, data.sim.balance.min - data.base.balance),
        fmtCNY(lang, data.sim.balance.max - data.base.balance),
      ],
    ];

    return (
      <div className="grid gap-4">
        <div className="table-scroll">{renderTable(headers, body)}</div>
        <div className="text-xs text-muted-foreground">
          {t("rndMetaRuns")}
          <span className="mono ml-1">{data.sim.runs}</span>
          {t("rndMetaSeed")}
          <span className="mono ml-1">{String(data.sim.seedUsed).slice(0, 48)}</span>
          <div className="mt-2 text-xs text-muted-foreground/80">{t("rndExplain")}</div>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffe9d6,transparent_55%),radial-gradient(circle_at_bottom,#d9f0ff,transparent_45%)] dark:bg-[radial-gradient(circle_at_top,#241a10,transparent_55%),radial-gradient(circle_at_bottom,#0a1928,transparent_45%)]">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-10">
          <header className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Compound Interest Lab</div>
                <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{t("pageTitle")}</h1>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">{t("pageSub")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }))}
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {theme === "dark" ? t("themeLight") : t("themeDark")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState((s) => ({ ...s, lang: s.lang === "zh" ? "en" : "zh" }))}
                >
                  <Languages className="h-4 w-4" />
                  {lang === "zh" ? "EN" : "中"}
                </Button>
                <div className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                  {nowText}
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="overflow-hidden">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{t("secParams")}</CardTitle>
                  <Badge variant="secondary">{t("pillInputUpdate")}</Badge>
                </div>
                <CardDescription>{saveStatus || t("presetLabel")}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3 rounded-xl border border-border/60 bg-background/70 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">{t("quickStartTitle")}</div>
                      <div className="text-xs text-muted-foreground">{t("quickStartSub")}</div>
                    </div>
                    <Badge variant="outline">{t("quickStartBadge")}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.slice(0, 3).map((preset) => (
                      <Button key={preset.id} variant="secondary" size="sm" onClick={() => applyQuickPreset(preset)}>
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 rounded-xl border border-dashed border-border/70 bg-muted/40 p-4">
                  <Field label={t("lblSimMode")} help={t("helpSimMode")}>
                    <Tabs
                      value={state.simMode}
                      onValueChange={(value) => setState((s) => ({ ...s, simMode: value }))}
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="monthly">{t("optSimMonthly")}</TabsTrigger>
                        <TabsTrigger value="tradingDays">{t("optSimTradingDays")}</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </Field>

                  {state.simMode === "tradingDays" && (
                    <div className="grid gap-4">
                      <Field label={t("lblMarket")} help={t("helpMarket")}>
                        <Select
                          value={state.market}
                          onValueChange={(value) => setState((s) => ({ ...s, market: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CN">{t("optMarketCN")}</SelectItem>
                            <SelectItem value="US">{t("optMarketUS")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label={t("lblStartDate")} help={t("helpStartDate")}>
                          <Input
                            type="date"
                            value={state.startDate}
                            onChange={(e) => setState((s) => ({ ...s, startDate: e.target.value }))}
                          />
                        </Field>
                        <Field label={t("lblRateMode")} help={t("helpRateMode")}>
                          <Select
                            value={state.rateMode}
                            onValueChange={(value) => setState((s) => ({ ...s, rateMode: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">{t("optRateDaily")}</SelectItem>
                              <SelectItem value="annual">{t("optRateAnnual")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>

                      {state.rateMode === "daily" ? (
                        <Field label={t("lblDailyRate")} help={t("helpDailyRate")}>
                          <Input
                            type="number"
                            step="0.0001"
                            value={state.dailyRate}
                            onChange={(e) => setState((s) => ({ ...s, dailyRate: e.target.value }))}
                          />
                        </Field>
                      ) : (
                        <Field label={t("lblAnnualRate")} help={t("helpAnnualRate")}>
                          <Input
                            type="number"
                            step="0.01"
                            value={state.annualRate}
                            onChange={(e) => setState((s) => ({ ...s, annualRate: e.target.value }))}
                          />
                        </Field>
                      )}

                      <Field label={t("lblCalendarImport")} help={t("helpCalendarImport")}>
                        <Input type="file" accept="application/json" onChange={(e) => onCalendarImport(e.target.files?.[0])} />
                      </Field>

                      <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
                        {calendarStatus}
                      </div>
                      {calendarBanner ? (
                        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                          {calendarBanner}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t("lblPrincipal")} help={t("helpPrincipal")}>
                    <Input
                      type="number"
                      min="0"
                      step="100"
                      value={state.principal}
                      onChange={(e) => setState((s) => ({ ...s, principal: Number(e.target.value) }))}
                    />
                  </Field>

                  {state.simMode === "monthly" && (
                    <Field label={t("lblMonthlyRate")} help={t("helpMonthlyRate")}>
                      <Input
                        type="number"
                        step="0.01"
                        value={state.monthlyRate}
                        onChange={(e) => setState((s) => ({ ...s, monthlyRate: e.target.value }))}
                      />
                    </Field>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t("lblDuration")} help={t("helpDuration")}>
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <Input
                        id="duration"
                        type="number"
                        min="0"
                        step="1"
                        value={state.duration}
                        onChange={(e) => setState((s) => ({ ...s, duration: e.target.value }))}
                      />
                      <Select
                        value={state.durationUnit}
                        onValueChange={(value) => setState((s) => ({ ...s, durationUnit: value }))}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="months">{t("optUnitMonths")}</SelectItem>
                          <SelectItem value="years">{t("optUnitYears")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </Field>

                  <Field label={t("lblCalcMode")} help={t("helpCalcMode")}>
                    <Select
                      value={state.mode}
                      onValueChange={(value) => setState((s) => ({ ...s, mode: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compound">{t("optCompound")}</SelectItem>
                        <SelectItem value="simple">{t("optSimple")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t("lblShowAnnual")} help={t("helpShowAnnual")}>
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2">
                      <span className="text-sm">{t("txtShowAnnual")}</span>
                      <Switch
                        checked={state.showAnnualized}
                        onCheckedChange={(checked) => setState((s) => ({ ...s, showAnnualized: checked }))}
                      />
                    </div>
                  </Field>

                  <Field label={t("presetLabel")}>
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <Select value={presetId} onValueChange={setPresetId}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRESETS.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="secondary" onClick={applyPreset}>
                        {t("presetApply")}
                      </Button>
                    </div>
                  </Field>
                </div>

                {saveStatus ? <div className="text-xs text-muted-foreground">{saveStatus}</div> : null}

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">{t("secDD")}</div>
                    <div className="text-sm text-muted-foreground">{t("pillDD")}</div>
                  </div>
                  <Badge variant="outline">{t("pillDD")}</Badge>
                </div>

                <Field label={t("lblEnableDD")} help={t("helpEnableDD")}>
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2">
                    <span className="text-sm">{t("txtEnableDD")}</span>
                    <Switch
                      checked={state.ddEnabled}
                      onCheckedChange={(checked) => setState((s) => ({ ...s, ddEnabled: checked }))}
                    />
                  </div>
                </Field>

                {state.ddEnabled && (
                  <div className="grid gap-4">
                    <Field label={t("lblDDMode")} help={t("helpDDMode")}>
                      <Select value={state.ddMode} onValueChange={(value) => setState((s) => ({ ...s, ddMode: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">{t("optDDSingle")}</SelectItem>
                          <SelectItem value="multi">{t("optDDMulti")}</SelectItem>
                          <SelectItem value="random">{t("optDDRandom")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    {state.ddMode === "single" && (
                      <>
                        <Field label={t("lblDDList")} help={t("helpDDList")}>
                          <Input
                            type="text"
                            value={state.ddList}
                            onChange={(e) => setState((s) => ({ ...s, ddList: e.target.value }))}
                          />
                        </Field>

                        <Field label={t("lblDDWhen")} help={t("helpDDWhen")}>
                          <Select
                            value={state.ddStrategy}
                            onValueChange={(value) => setState((s) => ({ ...s, ddStrategy: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="worst">{t("optDDWorst")}</SelectItem>
                              <SelectItem value="fixed">{t("optDDFixed")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>

                        {state.ddStrategy === "fixed" && (
                          <Field label={t("lblDDMonth")} help={t("helpDDMonth")}>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              value={state.ddMonth}
                              onChange={(e) => setState((s) => ({ ...s, ddMonth: e.target.value }))}
                            />
                          </Field>
                        )}
                      </>
                    )}

                    {state.ddMode === "multi" && (
                      <Field label={t("lblDDSeq")} help={t("helpDDSeq")}>
                        <Input
                          type="text"
                          value={state.ddSeq}
                          onChange={(e) => setState((s) => ({ ...s, ddSeq: e.target.value }))}
                        />
                      </Field>
                    )}

                    {state.ddMode === "random" && (
                      <>
                        <Field label={t("lblDDPool")} help={t("helpDDPool")}>
                          <Input
                            type="text"
                            value={state.ddPool}
                            onChange={(e) => setState((s) => ({ ...s, ddPool: e.target.value }))}
                          />
                        </Field>

                        <Field label={t("lblRandMethod")} help={t("helpRandMethod")}>
                          <Select
                            value={state.randMethod}
                            onValueChange={(value) => setState((s) => ({ ...s, randMethod: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="prob">{t("optRandProb")}</SelectItem>
                              <SelectItem value="count">{t("optRandCount")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>

                        {state.randMethod === "prob" ? (
                          <Field label={t("lblRandProb")} help={t("helpRandProb")}>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={state.randProb}
                              onChange={(e) => setState((s) => ({ ...s, randProb: e.target.value }))}
                            />
                          </Field>
                        ) : (
                          <Field label={t("lblRandCount")} help={t("helpRandCount")}>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={state.randCount}
                              onChange={(e) => setState((s) => ({ ...s, randCount: e.target.value }))}
                            />
                          </Field>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label={t("lblSimRuns")} help={t("helpSimRuns")}>
                            <Input
                              type="number"
                              min="100"
                              step="100"
                              value={state.simRuns}
                              onChange={(e) => setState((s) => ({ ...s, simRuns: e.target.value }))}
                            />
                          </Field>
                          <Field label={t("lblSimSeed")} help={t("helpSimSeed")}>
                            <Input
                              type="text"
                              value={state.simSeed}
                              onChange={(e) => setState((s) => ({ ...s, simSeed: e.target.value }))}
                            />
                          </Field>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <Separator />

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={resetToDemo}>
                    <RefreshCw className="h-4 w-4" />
                    {t("btnReset")}
                  </Button>
                  <Button variant="outline" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                    {copyLabel || t("btnCopy")}
                  </Button>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                    {shareLabel || t("btnShare")}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">{t("btnShareHint")}</div>

                <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-xs text-muted-foreground">
                  <div className="font-medium text-foreground">{t("kbTitle")}</div>
                  <div className="mt-2 grid gap-1">
                    <div>{t("kbAltL")}</div>
                    <div>{t("kbAltT")}</div>
                    <div>{t("kbAltR")}</div>
                    <div>{t("kbAltC")}</div>
                    <div>{t("kbAltS")}</div>
                  </div>
                </div>

                <div className="grid gap-3 rounded-xl border border-border/60 bg-background/70 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">{t("scenarioTitle")}</div>
                      <div className="text-xs text-muted-foreground">{t("scenarioSub")}</div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={saveScenario} disabled={!baseResult.ok}>
                      {t("scenarioSave")}
                    </Button>
                  </div>
                  {scenarios.length === 0 ? (
                    <div className="text-xs text-muted-foreground">{t("scenarioEmpty")}</div>
                  ) : (
                    <div className="grid gap-3">
                      {scenarios.map((item) => {
                        const diff = baseResult.ok ? baseResult.base.balance - item.result.balance : 0;
                        return (
                          <div key={item.id} className="rounded-lg border border-border/60 bg-background/80 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <div className="text-sm font-semibold">{item.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(item.createdAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US")}
                                </div>
                              </div>
                              <Button size="sm" variant="ghost" onClick={() => removeScenario(item.id)}>
                                {t("scenarioRemove")}
                              </Button>
                            </div>
                            <div className="mt-2 grid gap-2 text-xs text-muted-foreground">
                              <div>
                                {t("scenarioBalance")} {fmtCNY(lang, item.result.balance)} · {t("scenarioProfit")}{" "}
                                {fmtCNY(lang, item.result.profit)}
                              </div>
                              {baseResult.ok ? (
                                <div className={diff >= 0 ? "text-emerald-500" : "text-rose-500"}>
                                  {t("scenarioDiff")} {fmtCNY(lang, diff)}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Accordion type="single" collapsible>
                  <AccordionItem value="details">
                    <AccordionTrigger>{t("detailsSummary")}</AccordionTrigger>
                    <AccordionContent>
                      <div className="table-scroll">{renderDetailsTable()}</div>
                      <div className="mt-2 text-xs text-muted-foreground">{t("detailsHint")}</div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card className="overflow-hidden bg-gradient-to-br from-primary/10 via-transparent to-accent/20">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{t("secResult")}</CardTitle>
                  <Badge>{t("pillRealtime")}</Badge>
                </div>
                <CardDescription>{summaryText || (state.showAnnualized ? annualizedHint || t("annualHintMonthly") : t("kpiProfitHint"))}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {state.simMode === "tradingDays" && !calendars.meta[state.market]?.count ? (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                    <div className="text-sm font-semibold">{t("calendarGuideTitle")}</div>
                    <div className="mt-2 text-xs">{t("calendarGuideSub")}</div>
                    <div className="mt-3 grid gap-1 text-xs text-destructive/80">
                      <div>1. {t("calendarGuideStep1")}</div>
                      <div>2. {t("calendarGuideStep2")}</div>
                      <div>3. {t("calendarGuideStep3")}</div>
                    </div>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="calendarFormat">
                        <AccordionTrigger className="text-destructive">{t("calendarGuideFormat")}</AccordionTrigger>
                        <AccordionContent>
                          <div className="rounded-md border border-destructive/30 bg-background/80 p-3 text-xs text-muted-foreground">
                            <div className="mono">{t("calendarGuideExample")}</div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                ) : null}
                {baseResult.ok ? (
                  <>
                    <div className="rounded-xl border border-border/60 bg-background/80 p-4">
                      <div className="text-xs uppercase text-muted-foreground">{t("summaryTitle")}</div>
                      <div className="mt-2 text-base font-semibold">{summaryText}</div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                        <div className="text-xs uppercase text-muted-foreground">{t("kpiFinal")}</div>
                        <div className="mt-2 text-2xl font-semibold">{fmtCNY(lang, baseResult.base.balance)}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{t("kpiFinalHint")}</div>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                        <div className="text-xs uppercase text-muted-foreground">{t("kpiProfit")}</div>
                        <div
                          className={`mt-2 text-2xl font-semibold ${
                            baseResult.base.profit >= 0 ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          {fmtCNY(lang, baseResult.base.profit)}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{t("kpiProfitHint")}</div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                        <div className="text-xs uppercase text-muted-foreground">{t("kpiTotalReturn")}</div>
                        <div
                          className={`mt-2 text-2xl font-semibold ${
                            baseResult.base.totalReturn >= 0 ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          {fmtPct(baseResult.base.totalReturn)}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{t("kpiTotalReturnHint")}</div>
                      </div>
                      {state.showAnnualized && (
                        <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                          <div className="text-xs uppercase text-muted-foreground">{t("kpiAnnualized")}</div>
                          <div
                            className={`mt-2 text-2xl font-semibold ${
                              baseResult.base.annualized >= 0 ? "text-emerald-500" : "text-rose-500"
                            }`}
                          >
                            {fmtPct(baseResult.base.annualized)}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">{annualizedHint}</div>
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">{t("chartTitle")}</div>
                          <div className="text-xs text-muted-foreground">{t("chartSub")}</div>
                        </div>
                        <Tabs value={chartMode} onValueChange={(value) => setChartMode(value as ChartMode)}>
                          <TabsList>
                            <TabsTrigger value="balance_profit">{t("chartModeBoth")}</TabsTrigger>
                            <TabsTrigger value="balance">{t("chartBalance")}</TabsTrigger>
                            <TabsTrigger value="profit">{t("chartProfit")}</TabsTrigger>
                            <TabsTrigger value="gain">{t("chartGain")}</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                      <div className="mt-4 h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => fmtCNY(lang, value).replace(/[^\d.-]/g, "")}
                            />
                            <RechartsTooltip
                              formatter={(value, name) => {
                                const label =
                                  name === "balance"
                                    ? t("chartBalance")
                                    : name === "profit"
                                    ? t("chartProfit")
                                    : name === "gain"
                                    ? t("chartGain")
                                    : name;
                                return [fmtCNY(lang, value), label];
                              }}
                              labelFormatter={(label) => `${t("thMonth")} ${label}`}
                            />
                            {(chartMode === "balance_profit" || chartMode === "balance") && (
                              <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} dot={false} />
                            )}
                            {(chartMode === "balance_profit" || chartMode === "profit") && (
                              <Line type="monotone" dataKey="profit" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                            )}
                            {chartMode === "gain" && (
                              <Line type="monotone" dataKey="gain" stroke="#a855f7" strokeWidth={2} dot={false} />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {state.ddEnabled && (
                      <div className="grid gap-3 rounded-xl border border-border/60 bg-background/70 p-4">
                        <div className="text-sm font-semibold">
                          {state.ddMode === "single"
                            ? t("ddTitleSingle")
                            : state.ddMode === "multi"
                            ? t("ddTitleMulti")
                            : t("ddTitleRandom")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {state.ddMode === "single"
                            ? t("ddHintSingle")
                            : state.ddMode === "multi"
                            ? t("ddHintMulti")
                            : t("ddHintRandom")}
                        </div>
                        {!ddResult.ok ? (
                          <div className="text-sm text-muted-foreground">{ddResult.error || "-"}</div>
                        ) : ddResult.mode === "single" ? (
                          <div className="table-scroll">{renderSingleDdTable(ddResult)}</div>
                        ) : ddResult.mode === "multi" ? (
                          renderMultiSummary(ddResult)
                        ) : ddResult.mode === "random" ? (
                          renderRandomSummary(ddResult)
                        ) : null}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                    {baseResult.error || (lang === "zh" ? "无法计算。" : "Cannot compute.")}
                  </div>
                )}

                <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-xs text-muted-foreground">
                  <div className="font-medium text-foreground">{t("footTitle")}</div>
                  <div className="mt-2 grid gap-1">
                    <div>{t("footLine1")}</div>
                    <div>{t("footLine2")}</div>
                  </div>
                </div>

                <Accordion type="single" collapsible>
                  <AccordionItem value="assumptions">
                    <AccordionTrigger>{t("assumeTitle")}</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-2 text-xs text-muted-foreground">
                        <div>{t("assumeItem1")}</div>
                        <div>{t("assumeItem2")}</div>
                        <div>{t("assumeItem3")}</div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
