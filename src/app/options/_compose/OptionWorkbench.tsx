"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  buildPayoffSeries,
  calcStrategyPayoffAtExpiry,
  estimateRangeRisk,
  findBreakevens,
  STRATEGIES,
  type StrategyTemplate,
} from "@/app/options/_domain/payoff";
import { OptionPayoffChart } from "@/app/options/_components/OptionPayoffChart";
import { StrategyCard } from "@/app/options/_components/StrategyCard";
import { buildWorkbookBlob, downloadBlob } from "@/app/_domain/export";
import { useExportActions } from "@/app/_hooks/useExportActions";
import { toPng } from "html-to-image";
import { initI18n, t as tr } from "@/app/_domain/i18n";
import { useAppStore } from "@/app/_store/useAppStore";

function fmtUSD(v: number) {
  if (!isFinite(v)) return "∞";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(v);
}

const outlookMapZh = {
  bullish: "看涨",
  bearish: "看跌",
  neutral: "中性",
  volatile: "高波动",
} as const;

const outlookMapEn = {
  bullish: "Bullish",
  bearish: "Bearish",
  neutral: "Neutral",
  volatile: "Volatile",
} as const;

function cloneStrategies(): StrategyTemplate[] {
  return STRATEGIES.map((s) => ({
    ...s,
    legs: s.legs.map((leg) => ({ ...leg })),
    stock: s.stock ? { ...s.stock } : undefined,
  }));
}

export function OptionWorkbench() {
  const lang = useAppStore((s) => s.state.lang);
  const [expiryPrice, setExpiryPrice] = useState(100);
  const [centerPrice, setCenterPrice] = useState(100);
  const [strategies, setStrategies] = useState<StrategyTemplate[]>(() => cloneStrategies());
  const [activeId, setActiveId] = useState(strategies[0]?.id || "");
  const chartRef = useRef<HTMLDivElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    initI18n(lang);
  }, [lang]);

  const t = (key: string) => tr(key);

  const analyses = useMemo(() => {
    return strategies.map((strategy) => {
      const series = buildPayoffSeries(strategy, centerPrice || 100);
      const pnl = calcStrategyPayoffAtExpiry(strategy, expiryPrice || 0);
      const breakevens = findBreakevens(series);
      const risk = estimateRangeRisk(series);
      return { strategy, series, pnl, breakevens, risk };
    });
  }, [centerPrice, expiryPrice, strategies]);

  const active = analyses.find((item) => item.strategy.id === activeId) || analyses[0];

  const exportCsv = () => {
    const rows = analyses.map((item) => ({
      strategy: item.strategy.name,
      outlook: item.strategy.outlook,
      expiry_price: expiryPrice,
      pnl: item.pnl,
      breakevens: item.breakevens.join(" / "),
      max_profit_in_range: item.risk.maxProfit,
      max_loss_in_range: item.risk.maxLoss,
      legs: item.strategy.legs
        .map((leg) => `${leg.label} ${leg.optionType.toUpperCase()} ${leg.side.toUpperCase()} K=${leg.strike} P=${leg.premium} Q=${leg.qty}`)
        .join(" ; "),
    }));

    const blob = buildWorkbookBlob([{ name: "options_strategies", rows }]);
    downloadBlob(`options-strategies-${Date.now()}.csv`, blob);
  };

  const summaryLines = () => {
    if (!active) return ["No active strategy"];
    return [
      `Strategy: ${active.strategy.name}`,
      `Expiry Price: ${expiryPrice}`,
      `P/L at expiry: ${fmtUSD(active.pnl)}`,
      `Breakeven(s): ${active.breakevens.length ? active.breakevens.join(" / ") : "N/A"}`,
      `Max Profit (range): ${fmtUSD(active.risk.maxProfit)}`,
      `Max Loss (range): ${fmtUSD(active.risk.maxLoss)}`,
      `Legs: ${active.strategy.legs
        .map((leg) => `${leg.label} ${leg.optionType.toUpperCase()} ${leg.side.toUpperCase()} K=${leg.strike} P=${leg.premium} Q=${leg.qty}`)
        .join(" | ")}`,
    ];
  };

  const { exportCsv: handleExportCsv, exportPdf: handleExportPdf } = useExportActions({
    chartRef,
    onExportCsv: exportCsv,
    title: `options-${active?.strategy.id || "strategy"}`,
    getSummaryLines: summaryLines,
  });

  const handleExportPng = async () => {
    const node = detailRef.current;
    if (!node) return;
    const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
    const blob = await (await fetch(dataUrl)).blob();
    downloadBlob(`options-${active?.strategy.id || "strategy"}.png`, blob);
  };

  const updateLeg = (strategyId: string, legIndex: number, key: "strike" | "premium" | "qty", value: number) => {
    setStrategies((prev) =>
      prev.map((strategy) => {
        if (strategy.id !== strategyId) return strategy;
        const nextLegs = strategy.legs.map((leg, idx) => {
          if (idx !== legIndex) return leg;
          const safe = key === "qty" ? Math.max(1, Math.round(value || 1)) : Number(value) || 0;
          return { ...leg, [key]: safe };
        });
        return { ...strategy, legs: nextLegs };
      })
    );
  };

  const updateStock = (strategyId: string, key: "shares" | "entry", value: number) => {
    setStrategies((prev) =>
      prev.map((strategy) => {
        if (strategy.id !== strategyId || !strategy.stock) return strategy;
        if (key === "shares") {
          return { ...strategy, stock: { ...strategy.stock, shares: Math.max(1, Math.round(value || 1)) } };
        }
        return { ...strategy, stock: { ...strategy.stock, entry: Number(value) || 0 } };
      })
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-2xl">{t("optPageTitle")}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const next = cloneStrategies();
                setStrategies(next);
                setActiveId(next[0]?.id || "");
              }}
            >
              {t("optReset")}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{t("optPageSub")}</p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label={t("optExpiryPrice")}>
            <Input
              type="number"
              step="0.01"
              value={expiryPrice}
              onChange={(e) => setExpiryPrice(Number(e.target.value) || 0)}
            />
          </Field>
          <Field label={t("optCenterPrice")}>
            <Input
              type="number"
              step="0.01"
              value={centerPrice}
              onChange={(e) => setCenterPrice(Number(e.target.value) || 100)}
            />
          </Field>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {analyses.map((item) => (
          <StrategyCard
            key={item.strategy.id}
            strategy={item.strategy}
            pnl={item.pnl}
            breakevens={item.breakevens}
            maxProfit={item.risk.maxProfit}
            maxLoss={item.risk.maxLoss}
            active={item.strategy.id === active?.strategy.id}
            onSelect={() => setActiveId(item.strategy.id)}
            outlookLabel={lang === "zh" ? outlookMapZh[item.strategy.outlook] : outlookMapEn[item.strategy.outlook]}
          />
        ))}
      </section>

      {active ? (
        <div ref={detailRef}>
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-xl">
                  {active.strategy.name} {t("optDetails")}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportCsv}>
                    {t("optExportCsv")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPng}>
                    {t("optExportPng")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPdf}>
                    {t("optExportPdf")}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{active.strategy.description}</p>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Kpi title={t("optPnlNow")} value={fmtUSD(active.pnl)} tone={active.pnl >= 0 ? "good" : "bad"} />
                <Kpi title={t("optBreakeven")} value={active.breakevens.length ? active.breakevens.join(" / ") : "无"} />
                <Kpi title={t("optRiskHint")} value={`${active.strategy.maxProfitHint} / ${active.strategy.maxLossHint}`} />
              </div>

              <OptionPayoffChart data={active.series} breakevens={active.breakevens} chartRef={chartRef} />

              <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-sm">
                <div className="mb-2 font-medium">{t("optLegsTitle")}</div>
                <div className="grid gap-3 text-xs">
                  {active.strategy.stock ? (
                    <div className="grid gap-2 rounded-md bg-muted/60 p-3 md:grid-cols-2">
                      <Field label={t("optStockShares")}>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={active.strategy.stock.shares}
                          onChange={(e) => updateStock(active.strategy.id, "shares", Number(e.target.value))}
                        />
                      </Field>
                      <Field label={t("optStockEntry")}>
                        <Input
                          type="number"
                          step="0.01"
                          value={active.strategy.stock.entry}
                          onChange={(e) => updateStock(active.strategy.id, "entry", Number(e.target.value))}
                        />
                      </Field>
                    </div>
                  ) : null}

                {active.strategy.legs.map((leg, idx) => (
                  <div key={`${active.strategy.id}-${idx}`} className="grid gap-2 rounded-md bg-muted/60 p-3 md:grid-cols-6">
                    <div className="md:col-span-2">
                      {leg.label} | {leg.optionType.toUpperCase()} | {leg.side.toUpperCase()}
                    </div>
                    <Field label="Strike">
                      <Input
                        type="number"
                        step="0.01"
                        value={leg.strike}
                        onChange={(e) => updateLeg(active.strategy.id, idx, "strike", Number(e.target.value))}
                      />
                    </Field>
                    <Field label="Premium">
                      <Input
                        type="number"
                        step="0.01"
                        value={leg.premium}
                        onChange={(e) => updateLeg(active.strategy.id, idx, "premium", Number(e.target.value))}
                      />
                    </Field>
                    <Field label="Qty">
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={leg.qty}
                        onChange={(e) => updateLeg(active.strategy.id, idx, "qty", Number(e.target.value))}
                      />
                    </Field>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      ) : null}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium">{label}</div>
      {children}
    </div>
  );
}

function Kpi({ title, value, tone }: { title: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/70 p-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className={`mt-1 text-lg font-semibold ${tone === "good" ? "text-emerald-500" : tone === "bad" ? "text-rose-500" : ""}`}>
        {value}
      </div>
    </div>
  );
}
