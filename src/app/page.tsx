"use client";

import { useEffect, useMemo, useRef, useCallback } from "react";

import { AppHeader } from "@/app/_components/AppHeader";
import { ParamsCard } from "@/app/_compose/ParamsCard";
import { ResultsCard } from "@/app/_compose/ResultsCard";
import { PAGE_BG, PAGE_WRAP } from "@/app/_styles/layout";
import { type CalendarEventInput } from "@/app/_components/ScenarioCalendar";
import { useAppStore } from "@/app/_store/useAppStore";
import { useAppPersistence } from "@/app/_effects/useAppPersistence";
import { useAutoStartDate } from "@/app/_effects/useAutoStartDate";
import { useDocumentMeta } from "@/app/_effects/useDocumentMeta";
import { useClock } from "@/app/_hooks/useClock";
import { useHotkeys } from "@/app/_hooks/useHotkeys";
import { initI18n, t as translate } from "@/app/_domain/i18n";

import {
  addMonths,
  clamp,
  convertAmount,
  encodeState,
  fmtMoney,
  fmtPct,
  parsePctList,
  parseSeq,
  toISODate,
} from "@/lib/utils";
import {
  buildEventsMapFromSeq,
  calcMonthlyTimeline,
  calcTradingDaysTimelineStrict,
  calcSingleDrawdown,
  calcWorstSingle,
  calendarCoversRange,
  parseCalendarJSON,
  setCalendar,
  simulateRandom,
} from "@/lib/calc";
import { AppState, BaseResult, DEFAULTS, SHARE_KEY, Scenario, getMonths } from "@/lib/app-state";
import { PRESETS } from "@/lib/presets";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStateValidation } from "@/app/_hooks/useStateValidation";
import { useExportActions } from "@/app/_hooks/useExportActions";
import { buildWorkbookBlob, downloadBlob } from "@/app/_domain/export";

export default function Page() {
  const {
    state,
    setState,
    calendars,
    setCalendars,
    copyLabel,
    setCopyLabel,
    shareLabel,
    setShareLabel,
    presetId,
    setPresetId,
    saveStatus,
    setSaveStatus,
    scenarios,
    setScenarios,
    chartMode,
    setChartMode,
    snapshot,
    setSnapshot,
    snapshots,
    setSnapshots,
    selectedSnapshotId,
    setSelectedSnapshotId,
  } = useAppStore();

  const lastSaveRef = useRef(0);
  const lang = state.lang;

  useEffect(() => {
    initI18n(state.lang);
  }, [state.lang]);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => translate(key, vars), [lang]);

  useDocumentMeta(state.lang, state.theme);
  useAutoStartDate(state.simMode, state.startDate, setState);
  useAppPersistence({
    state,
    setState,
    calendars,
    setCalendars,
    scenarios,
    setScenarios,
    lastSaveRef,
    setSaveStatus,
    t,
  });

  const nowText = useClock(state.lang);
  const validationErrors = useStateValidation(state);
  const chartRef = useRef<HTMLDivElement | null>(null);

  const months = getMonths(state.duration, state.durationUnit);
  const hasValidationErrors = useMemo(
    () => Object.values(validationErrors).some(Boolean),
    [validationErrors]
  );

  const baseResult: BaseResult = useMemo(() => {
    if (hasValidationErrors) {
      return {
        ok: false,
        error: lang === "zh" ? "请先修复参数校验错误。" : "Please fix validation errors first.",
      };
    }

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
      return { ok: false, error: lang === "zh" ? "投资时长必须大于 0。" : "Duration must be greater than 0." };
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
  }, [state, months, calendars, lang, t, hasValidationErrors]);

  const ddResult = useMemo(() => {
    if (!baseResult.ok || !state.ddEnabled || state.uiMode !== "pro") return { ok: true, mode: "off" };
    const base = baseResult.base;

    if (state.ddMode === "single") {
      const list = parsePctList(state.ddList);
      const ddPctList = list.length ? list : [10];
      const strategy = state.ddStrategy;
      const fixedMonth = clamp(Math.floor(Number(state.ddMonth) || 1), 1, Math.max(1, months));

      const results = [] as any[];
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
      let tl: any;

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
    const extra = baseResult.extra;
    if (!extra?.startISO || !extra?.endISO) return "";
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
        balance: fmtMoney(lang, state.currency, baseResult.base.balance),
        profit: fmtMoney(lang, state.currency, baseResult.base.profit),
        annual: fmtPct(baseResult.base.annualized),
        months: String(monthsText),
      });
    }
    const extra = baseResult.extra;
    return t("summaryTradingTpl", {
      balance: fmtMoney(lang, state.currency, baseResult.base.balance),
      profit: fmtMoney(lang, state.currency, baseResult.base.profit),
      annual: fmtPct(baseResult.base.annualized),
      start: extra?.startISO || "-",
      end: extra?.endISO ? toISODate(new Date(new Date(extra.endISO).getTime() - 86400000)) : "-",
    });
  }, [baseResult, lang, state.duration, state.durationUnit, state.simMode, state.currency, t]);

  const chartData = useMemo(() => {
    if (!baseResult.ok) return [];
    return baseResult.base.rows.map((r: any) => ({
      month: r.m,
      balance: r.balance,
      profit: r.profit,
      gain: r.gain,
    }));
  }, [baseResult]);

  const sensitivityRows = useMemo(() => {
    if (!baseResult.ok) return [];
    const rows: Array<{ label: string; balance: number; profit: number }> = [];
    if (state.simMode === "monthly") {
      const shifts = [-2, -1, 0, 1, 2];
      shifts.forEach((shift) => {
        const monthlyRate = (state.monthlyRate + shift) / 100;
        const result = calcMonthlyTimeline({
          principal: state.principal,
          monthlyRate,
          months,
          mode: state.mode,
          events: [],
        });
        rows.push({
          label: `${shift > 0 ? "+" : ""}${shift.toFixed(0)}%`,
          balance: result.balance,
          profit: result.profit,
        });
      });
      return rows;
    }

    if (!state.startDate) return rows;
    const meta = calendars.meta[state.market];
    if (!meta || !meta.count) return rows;
    const shifts = state.rateMode === "daily" ? [-0.03, -0.015, 0, 0.015, 0.03] : [-3, -1.5, 0, 1.5, 3];
    shifts.forEach((shift) => {
      const startDate = new Date(state.startDate + "T00:00:00");
      const result = calcTradingDaysTimelineStrict({
        calendars,
        principal: state.principal,
        startDate,
        months,
        mode: state.mode,
        market: state.market,
        rateMode: state.rateMode,
        dailyRateDecimal: (state.dailyRate + (state.rateMode === "daily" ? shift : 0)) / 100,
        annualRateDecimal: (state.annualRate + (state.rateMode === "annual" ? shift : 0)) / 100,
        eventsByMonth: new Map(),
        t,
        lang,
      });
      if (result.ok) {
        rows.push({
          label: `${shift > 0 ? "+" : ""}${shift.toFixed(state.rateMode === "daily" ? 3 : 1)}%`,
          balance: result.balance,
          profit: result.profit,
        });
      }
    });
    return rows;
  }, [baseResult, state, months, calendars, t, lang]);

  const drawdownImpact = useMemo(() => {
    if (!baseResult.ok || !state.ddEnabled || state.uiMode !== "pro" || !ddResult.ok) return 0;
    if (ddResult.mode === "single") {
      const worst = ddResult.results.reduce(
        (acc: number, row: any) => Math.min(acc, row.finalBalance),
        Number.POSITIVE_INFINITY
      );
      return isFinite(worst) ? worst - baseResult.base.balance : 0;
    }
    if (ddResult.mode === "multi") {
      return ddResult.tl.balance - baseResult.base.balance;
    }
    if (ddResult.mode === "random") {
      return ddResult.sim.balance.p90Worst - baseResult.base.balance;
    }
    return 0;
  }, [baseResult, ddResult, state.ddEnabled, state.uiMode]);

  const currentMetrics = useMemo(() => {
    if (!baseResult.ok) return null;
    return {
      id: "current",
      createdAt: Date.now(),
      balance: baseResult.base.balance,
      profit: baseResult.base.profit,
      annualized: baseResult.base.annualized,
      drawdownImpact,
    };
  }, [baseResult, drawdownImpact]);

  const normalizedSnapshot = useMemo(() => {
    const target = snapshots.find((s) => s.id === selectedSnapshotId) || snapshot;
    if (!target) return null;
    const from = target.currency || state.currency;
    const fx = target.fxRate || state.fxRate;
    return {
      ...target,
      balance: convertAmount(target.balance, from, state.currency, fx),
      profit: convertAmount(target.profit, from, state.currency, fx),
      drawdownImpact: convertAmount(target.drawdownImpact, from, state.currency, fx),
      chartData: target.chartData.map((row) => ({
        ...row,
        balance: convertAmount(row.balance, from, state.currency, fx),
        profit: convertAmount(row.profit, from, state.currency, fx),
        gain: convertAmount(row.gain, from, state.currency, fx),
      })),
    };
  }, [snapshot, snapshots, selectedSnapshotId, state.currency, state.fxRate]);

  const calendarInitialDate = useMemo(() => {
    if (state.startDate) return new Date(state.startDate + "T00:00:00");
    if (snapshots.length) return new Date(snapshots[0].createdAt);
    return new Date();
  }, [state.startDate, snapshots]);

  const calendarEvents = useMemo<CalendarEventInput[]>(() => {
    const events: CalendarEventInput[] = [];
    const startDate = state.startDate ? new Date(state.startDate + "T00:00:00") : (() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    })();
    events.push({ id: "start", title: t("calEventStart"), start: startDate });
    events.push({
      id: "end",
      title: t("calEventEnd"),
      start: addMonths(startDate, Math.max(1, months)),
    });

    if (startDate && state.ddEnabled) {
      if (state.ddMode === "single" && state.ddStrategy === "fixed") {
        const list = parsePctList(state.ddList);
        const ddPctList = list.length ? list : [10];
        const fixedMonth = clamp(Math.floor(Number(state.ddMonth) || 1), 1, Math.max(1, months));
        const drawdownDate = addMonths(startDate, fixedMonth);
        ddPctList.forEach((dd, idx) => {
          events.push({
            id: `dd_fixed_${idx}`,
            title: t("calEventDrawdown", { dd: String(dd) }),
            start: drawdownDate,
          });
        });
      } else if (state.ddMode === "multi") {
        const seq = parseSeq(state.ddSeq);
        seq.forEach((item, idx) => {
          events.push({
            id: `dd_seq_${idx}`,
            title: t("calEventDrawdown", { dd: String(item.dd) }),
            start: addMonths(startDate, item.month),
          });
        });
      } else if (state.ddMode === "random") {
        events.push({
          id: "dd_random",
          title: t("calEventDrawdownRandom"),
          start: startDate,
        });
      }
    }

    snapshots.forEach((snap, index) => {
      events.push({
        id: `snap_${snap.id}`,
        title: t("calEventSnapshot", { n: String(index + 1) }),
        start: new Date(snap.createdAt),
      });
    });

    return events;
  }, [
    state.startDate,
    state.ddEnabled,
    state.ddMode,
    state.ddStrategy,
    state.ddList,
    state.ddMonth,
    state.ddSeq,
    months,
    snapshots,
    t,
  ]);

  const jsonPanels = useMemo(() => {
    const params = {
      ...state,
      months,
      locale: state.lang,
    };

    const resultPayload = baseResult.ok
      ? {
          summary: summaryText,
          metrics: {
            balance: baseResult.base.balance,
            profit: baseResult.base.profit,
            annualized: baseResult.base.annualized,
            totalReturn: baseResult.base.totalReturn,
            drawdownImpact,
          },
          extra: baseResult.extra || null,
          rowsPreview: baseResult.base.rows.slice(0, 12),
          rowsTotal: baseResult.base.rows.length,
        }
      : { error: (baseResult as { error?: string }).error || "-" };

    const snapshotPayload = normalizedSnapshot
      ? {
          id: normalizedSnapshot.id,
          createdAt: normalizedSnapshot.createdAt,
          balance: normalizedSnapshot.balance,
          profit: normalizedSnapshot.profit,
          annualized: normalizedSnapshot.annualized,
          drawdownImpact: normalizedSnapshot.drawdownImpact,
        }
      : { message: t("insightSnapshotEmpty") };

    return [
      {
        id: "params",
        title: t("insightDataParams"),
        subtitle: t("insightDataParamsSub"),
        data: params,
      },
      {
        id: "results",
        title: t("insightDataResults"),
        subtitle: t("insightDataResultsSub"),
        data: resultPayload,
      },
      {
        id: "snapshot",
        title: t("insightDataSnapshot"),
        subtitle: t("insightDataSnapshotSub"),
        data: snapshotPayload,
      },
    ];
  }, [state, months, baseResult, summaryText, drawdownImpact, normalizedSnapshot, t]);

  const captureSnapshot = useCallback(() => {
    if (!baseResult.ok) return;
    const snap = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      currency: state.currency,
      fxRate: state.fxRate,
      balance: baseResult.base.balance,
      profit: baseResult.base.profit,
      annualized: baseResult.base.annualized,
      drawdownImpact,
      chartData,
    };
    setSnapshot(snap);
    setSnapshots([snap, ...snapshots].slice(0, 5));
    setSelectedSnapshotId(snap.id);
  }, [
    baseResult,
    chartData,
    drawdownImpact,
    state.currency,
    state.fxRate,
    setSnapshot,
    snapshots,
    setSnapshots,
    setSelectedSnapshotId,
  ]);

  const exportCsv = useCallback(() => {
    if (!baseResult.ok) return;
    const csvRows = baseResult.base.rows.map((row: any) => ({
      month: row.m,
      gain: row.gain,
      profit: row.profit,
      balance: row.balance,
    }));
    const blob = buildWorkbookBlob([{ name: "result", rows: csvRows }]);
    downloadBlob(`compound-interest-${Date.now()}.csv`, blob);
  }, [baseResult]);

  const getPdfSummaryLines = useCallback(() => {
    if (!baseResult.ok) return [lang === "zh" ? "当前无法计算" : "Cannot compute now."];
    return [
      `${lang === "zh" ? "币种" : "Currency"}: ${state.currency}`,
      `${lang === "zh" ? "本金" : "Principal"}: ${fmtMoney(lang, state.currency, state.principal)}`,
      `${lang === "zh" ? "净收益" : "Profit"}: ${fmtMoney(lang, state.currency, baseResult.base.profit)}`,
      `${lang === "zh" ? "总金额" : "Final Balance"}: ${fmtMoney(lang, state.currency, baseResult.base.balance)}`,
      `${lang === "zh" ? "年化" : "Annualized"}: ${fmtPct(baseResult.base.annualized)}`,
      `${lang === "zh" ? "回撤影响" : "Drawdown Impact"}: ${fmtMoney(lang, state.currency, drawdownImpact)}`,
    ];
  }, [baseResult, drawdownImpact, lang, state.currency, state.principal]);

  const { exportCsv: handleExportCsv, exportPng: handleExportPng, exportPdf: handleExportPdf } = useExportActions({
    chartRef,
    onExportCsv: exportCsv,
    title: "compound-interest-result",
    getSummaryLines: getPdfSummaryLines,
  });

  const resetToDemo = () => {
    setState((s) => ({ ...DEFAULTS, lang: s.lang, theme: s.theme }));
  };

  const applyPreset = () => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setState((prev) => ({ ...prev, ...(preset.values as Partial<AppState>) }));
  };

  const applyQuickPreset = (preset: (typeof PRESETS)[number]) => {
    setPresetId(preset.id);
    setState((prev) => ({ ...prev, ...(preset.values as Partial<AppState>) }));
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
        currency: state.currency,
        fxRate: state.fxRate,
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
    setScenarios([next, ...scenarios].slice(0, 6));
  };

  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  const buildCopyText = () => {
    if (baseResult.ok === false) return baseResult.error;
    const params = state;

    let startISO = "-";
    let endISO = "-";
    let td = 0;

    const base = baseResult.base;
    if (params.simMode !== "monthly") {
      const extra = baseResult.extra;
      startISO = extra?.startISO || "-";
      if (extra?.endISO) {
        const endExclusive = new Date(extra.endISO + "T00:00:00");
        endExclusive.setDate(endExclusive.getDate() - 1);
        endISO = toISODate(endExclusive);
      }
      td = extra?.tradingDays || 0;
    }

    const lines = [] as string[];
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
    lines.push(`${lang === "zh" ? "币种" : "Currency"}: ${params.currency}`);
    lines.push(`FX (USD/CNY): ${params.fxRate}`);
    lines.push(t("copyDurationTpl", { m: String(months) }));
    lines.push(params.mode === "compound" ? t("copyModeCompound") : t("copyModeSimple"));
    lines.push("");
    lines.push(t("copyTotalTpl", { v: fmtMoney(lang, state.currency, base.balance) }));
    lines.push(t("copyProfitTpl", { v: fmtMoney(lang, state.currency, base.profit) }));
    lines.push(t("copyTotalReturnTpl", { v: fmtPct(base.totalReturn) }));
    if (params.showAnnualized) lines.push(t("copyAnnualizedTpl", { v: fmtPct(base.annualized) }));

    return lines.join("\n");
  };

  const copyToClipboard = async (text: string) => {
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

  const onCalendarImport = async (file?: File) => {
    if (!file) return;
    try {
      const raw = await file.text();
      const res = parseCalendarJSON(raw, state.market, t);
      if (!res.ok) {
        alert(res.error || t("alertCalReadFail"));
        return;
      }
      let next = calendars;
      res.updates.forEach((u: any) => {
        next = setCalendar(next, u.market, u.dates, "import");
      });
      setCalendars(next);
    } catch (e) {
      alert(t("alertCalReadFail"));
    }
  };

  const onToggleTheme = () => {
    setState((s) => {
      const nextTheme = s.theme === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      return { ...s, theme: nextTheme };
    });
  };

  const onToggleLang = () => {
    setState((s) => ({ ...s, lang: s.lang === "zh" ? "en" : "zh" }));
  };

  useHotkeys({
    onToggleLang,
    onToggleTheme,
    onReset: resetToDemo,
    onCopy: handleCopy,
    onShare: handleShare,
  });

  return (
    <TooltipProvider>
      <main className={PAGE_BG}>
        <div className={PAGE_WRAP}>
          <AppHeader
            nowText={nowText}
            lang={state.lang}
            theme={state.theme}
            t={t}
            onToggleTheme={onToggleTheme}
            onToggleLang={onToggleLang}
          />
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <ParamsCard
              t={t}
              state={state}
              setState={setState}
              presetId={presetId}
              setPresetId={setPresetId}
              saveStatus={saveStatus}
              applyPreset={applyPreset}
              applyQuickPreset={applyQuickPreset}
              onCalendarImport={onCalendarImport}
              calendarStatus={calendarStatus}
              calendarBanner={calendarBanner}
              resetToDemo={resetToDemo}
              handleCopy={handleCopy}
              handleShare={handleShare}
              copyLabel={copyLabel}
              shareLabel={shareLabel}
              scenarios={scenarios}
              baseResult={baseResult}
              onSaveScenario={saveScenario}
              onRemoveScenario={removeScenario}
              validationErrors={validationErrors}
            />
            <ResultsCard
              t={t}
              lang={state.lang}
              state={state}
              calendars={calendars}
              baseResult={baseResult}
              months={months}
              annualizedHint={annualizedHint}
              summaryText={summaryText}
              chartData={chartData}
              snapshotChartData={normalizedSnapshot?.chartData || []}
              chartMode={chartMode}
              onChartModeChange={setChartMode}
              ddResult={ddResult}
              onExportCsv={handleExportCsv}
              onExportPng={handleExportPng}
              onExportPdf={handleExportPdf}
              snapshotMetrics={normalizedSnapshot}
              currentMetrics={currentMetrics}
              snapshots={snapshots}
              selectedSnapshotId={selectedSnapshotId}
              onSelectSnapshot={setSelectedSnapshotId}
              onCaptureSnapshot={captureSnapshot}
              onClearSnapshot={() => {
                if (!selectedSnapshotId) return;
                const next = snapshots.filter((s) => s.id !== selectedSnapshotId);
                setSnapshots(next);
                setSelectedSnapshotId(next[0]?.id || null);
                setSnapshot(next[0] || null);
              }}
              chartRef={chartRef}
              calendarEvents={calendarEvents}
              calendarInitialDate={calendarInitialDate}
              jsonPanels={jsonPanels}
              sensitivityRows={sensitivityRows}
            />
          </div>
        </div>
      </main>
    </TooltipProvider>
  );
}
