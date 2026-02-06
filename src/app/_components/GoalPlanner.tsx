"use client";

import { useMemo, useState } from "react";

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

  return (
    <div className="grid gap-3 rounded-xl border border-border/60 bg-background/70 p-4">
      <div className="text-xs uppercase text-muted-foreground">{title}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
      <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
        <div className="text-sm text-muted-foreground">{targetLabel}</div>
        <Input
          type="number"
          min={1}
          step={100}
          value={targetBalance}
          onChange={(e) => setTargetBalance(Number(e.target.value))}
        />
      </div>
      <div className="grid gap-2 text-sm">
        <div className="rounded-md border border-border/50 bg-background/80 px-3 py-2">
          <span className="text-muted-foreground">{rateLabel}: </span>
          <span className="font-medium">
            {neededMonthlyRate !== null && isFinite(neededMonthlyRate) ? `${(neededMonthlyRate * 100).toFixed(3)}%` : na}
          </span>
        </div>
        <div className="rounded-md border border-border/50 bg-background/80 px-3 py-2">
          <span className="text-muted-foreground">{monthsLabel}: </span>
          <span className="font-medium">{neededMonths !== null && isFinite(neededMonths) ? neededMonths.toFixed(1) : na}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {lang === "zh" ? "目标金额：" : "Target:"} {fmtMoney(lang, currency, targetBalance)}
        </div>
      </div>
    </div>
  );
}
