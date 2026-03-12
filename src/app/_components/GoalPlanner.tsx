"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Sparkles, Target, TrendingUp } from "lucide-react";

import { Input } from "@/components/ui/input";
import { fmtMoney } from "@/lib/utils";

export function GoalPlanner({
  lang,
  currency,
  simMode,
  mode,
  principal,
  months,
  monthlyRatePct,
}: {
  lang: "zh" | "en";
  currency: "CNY" | "USD";
  simMode: "monthly" | "tradingDays";
  mode: "compound" | "simple";
  principal: number;
  months: number;
  monthlyRatePct: number;
}) {
  const [targetBalance, setTargetBalance] = useState(() => Math.max(1, Math.round(principal * 1.5)));
  const safePrincipal = Math.max(1, Number(principal) || 1);
  const safeMonths = Math.max(1, Number(months) || 1);
  const rate = Number(monthlyRatePct) / 100;

  const neededMonthlyRate = useMemo(() => {
    const target = Math.max(1, Number(targetBalance) || 1);
    if (target <= 0 || safePrincipal <= 0 || safeMonths <= 0) return null;
    if (mode === "simple") {
      return target / safePrincipal / safeMonths - 1 / safeMonths;
    }
    return Math.pow(target / safePrincipal, 1 / safeMonths) - 1;
  }, [targetBalance, safePrincipal, safeMonths, mode]);

  const neededMonths = useMemo(() => {
    const target = Math.max(1, Number(targetBalance) || 1);
    if (target <= safePrincipal) return 0;
    if (mode === "simple") {
      if (rate <= 0) return null;
      return (target / safePrincipal - 1) / rate;
    }
    if (rate <= -1 || rate === 0) return null;
    const denom = Math.log1p(rate);
    if (!isFinite(denom) || denom <= 0) return null;
    return Math.log(target / safePrincipal) / denom;
  }, [targetBalance, safePrincipal, mode, rate]);

  const title = lang === "zh" ? "目标反推" : "Goal Planner";
  const targetLabel = lang === "zh" ? "目标终值" : "Target Balance";
  const hint =
    simMode === "monthly"
      ? lang === "zh"
        ? "按当前本金与模式，反推所需月收益率与投资时长。"
        : "Reverse-calculate required monthly return and months."
      : lang === "zh"
      ? "当前为交易日模式：这里基于月度近似反推，供快速估算。"
      : "In trading-day mode this is monthly approximation for quick estimation.";
  const rateLabel = lang === "zh" ? "所需月收益率" : "Required Monthly Return";
  const monthsLabel = lang === "zh" ? "所需月数" : "Required Months";
  const na = lang === "zh" ? "无法计算" : "N/A";
  const approxLabel = lang === "zh" ? "估算视角" : "Estimation Lens";
  const plannerSummary =
    lang === "zh"
      ? `以 ${fmtMoney(lang, currency, safePrincipal)} 为起点，反推达到 ${fmtMoney(lang, currency, targetBalance)} 的所需条件。`
      : `Starting from ${fmtMoney(lang, currency, safePrincipal)}, estimate what it takes to reach ${fmtMoney(lang, currency, targetBalance)}.`;

  return (
    <div className="action-shell grid gap-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/18 bg-primary/10 text-primary">
              <Target className="h-4 w-4" />
            </span>
            <div className="text-base font-semibold text-foreground">{title}</div>
          </div>
          <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{hint}</div>
        </div>
        {simMode === "tradingDays" ? (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            {approxLabel}
          </div>
        ) : null}
      </div>
      <div className="rounded-[18px] border border-border/60 bg-background/70 px-3 py-3 text-xs leading-relaxed text-muted-foreground">
        {plannerSummary}
      </div>
      <div className="grid gap-2 xl:grid-cols-[140px_minmax(0,1fr)] xl:items-center">
        <div className="text-sm text-muted-foreground">{targetLabel}</div>
        <Input
          type="number"
          min={1}
          step={100}
          value={targetBalance}
          onChange={(e) => setTargetBalance(Number(e.target.value))}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-[18px] border border-border/50 bg-background/80 px-3 py-3">
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            {rateLabel}
          </div>
          <div className="mt-2 text-lg font-semibold text-foreground">
            {neededMonthlyRate !== null && isFinite(neededMonthlyRate) ? `${(neededMonthlyRate * 100).toFixed(3)}%` : na}
          </div>
        </div>
        <div className="rounded-[18px] border border-border/50 bg-background/80 px-3 py-3">
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5 text-primary" />
            {monthsLabel}
          </div>
          <div className="mt-2 text-lg font-semibold text-foreground">
            {neededMonths !== null && isFinite(neededMonths) ? neededMonths.toFixed(1) : na}
          </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
          {lang === "zh" ? "目标金额：" : "Target:"} {fmtMoney(lang, currency, targetBalance)}
      </div>
    </div>
  );
}
