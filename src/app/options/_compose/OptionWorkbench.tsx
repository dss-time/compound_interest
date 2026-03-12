"use client";

import { useMemo, useRef, useState } from "react";
import { RefreshCw, SlidersHorizontal } from "lucide-react";
import { toPng } from "html-to-image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appToast } from "@/app/_components/AppToaster";
import SpotlightCard from "@/app/_components/reactbits/SpotlightCard";
import { PAGE_BG, PAGE_WRAP } from "@/app/_styles/layout";
import {
  buildPayoffSeries,
  calcStrategyPayoffAtExpiry,
  estimateRangeRisk,
  findBreakevens,
  getStrategyDescription,
  getStrategyRiskHints,
  STRATEGIES,
  type StrategyTemplate,
} from "@/app/options/_domain/payoff";
import { OptionPayoffChart } from "@/app/options/_components/OptionPayoffChart";
import { StrategyCard } from "@/app/options/_components/StrategyCard";
import { buildWorkbookBlob, downloadBlob } from "@/app/_domain/export";
import { useExportActions } from "@/app/_hooks/useExportActions";
import { createTranslator } from "@/app/_domain/i18n";
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
  const theme = useAppStore((s) => s.state.theme);
  const [expiryPrice, setExpiryPrice] = useState(100);
  const [centerPrice, setCenterPrice] = useState(100);
  const [strategies, setStrategies] = useState<StrategyTemplate[]>(() => cloneStrategies());
  const [activeId, setActiveId] = useState(strategies[0]?.id || "");
  const chartRef = useRef<HTMLDivElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);

  const t = useMemo(() => createTranslator(lang), [lang]);

  const heroTitle = lang === "zh" ? "期权策略工作台" : "Options Strategy Workbench";
  const heroSub =
    lang === "zh"
      ? "用更直观的盈亏曲线和腿结构编辑，快速比较主流期权策略在到期时的风险收益。"
      : "Compare mainstream options structures with a cleaner payoff curve and editable leg setup.";
  const heroBadge = lang === "zh" ? "到期收益视角" : "Expiry payoff lens";
  const libraryTitle = lang === "zh" ? "策略库" : "Strategy Library";
  const librarySub =
    lang === "zh"
      ? "先选一个策略，再在下方细调执行价、权利金和数量。"
      : "Pick a structure first, then refine strikes, premiums, and size below.";
  const detailTitle = lang === "zh" ? "策略详情" : "Strategy Detail";
  const detailSub =
    lang === "zh"
      ? "这里展示当前策略在不同到期价格下的盈亏曲线，以及可编辑的腿结构。"
      : "This section shows the expiry payoff curve and editable legs for the selected structure.";
  const legStrikeLabel = lang === "zh" ? "执行价" : "Strike";
  const legPremiumLabel = lang === "zh" ? "权利金" : "Premium";
  const legQtyLabel = lang === "zh" ? "数量" : "Qty";
  const noBreakevenLabel = lang === "zh" ? "无" : "None";

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
  const activeRiskHints = active ? getStrategyRiskHints(active.strategy, lang) : null;

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
    if (!active) return [lang === "zh" ? "当前没有选中策略" : "No active strategy"];
    return [
      `${lang === "zh" ? "策略" : "Strategy"}: ${active.strategy.name}`,
      `${lang === "zh" ? "到期价格" : "Expiry Price"}: ${expiryPrice}`,
      `${lang === "zh" ? "到期盈亏" : "P/L at expiry"}: ${fmtUSD(active.pnl)}`,
      `${lang === "zh" ? "盈亏平衡点" : "Breakeven(s)"}: ${active.breakevens.length ? active.breakevens.join(" / ") : noBreakevenLabel}`,
      `${lang === "zh" ? "区间最大收益" : "Max Profit (range)"}: ${fmtUSD(active.risk.maxProfit)}`,
      `${lang === "zh" ? "区间最大亏损" : "Max Loss (range)"}: ${fmtUSD(active.risk.maxLoss)}`,
    ];
  };

  const { exportCsv: runExportCsv, exportPdf: runExportPdf } = useExportActions({
    chartRef,
    onExportCsv: exportCsv,
    title: `options-${active?.strategy.id || "strategy"}`,
    getSummaryLines: summaryLines,
  });

  const handleExportCsv = () => {
    try {
      runExportCsv();
      appToast("success", lang === "zh" ? "已导出 CSV" : "CSV exported", lang === "zh" ? "策略表格已导出到本地。" : "The strategy table was exported locally.");
    } catch {
      appToast("error", lang === "zh" ? "CSV 导出失败" : "CSV export failed", lang === "zh" ? "请稍后重试。" : "Please try again.");
    }
  };

  const handleExportPng = async () => {
    try {
      const node = detailRef.current;
      if (!node) {
        appToast("error", lang === "zh" ? "PNG 导出失败" : "PNG export failed", lang === "zh" ? "当前详情视图尚未准备好。" : "The detail view is not ready yet.");
        return;
      }
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      downloadBlob(`options-${active?.strategy.id || "strategy"}.png`, blob);
      appToast("success", lang === "zh" ? "已导出 PNG" : "PNG exported", lang === "zh" ? "当前策略详情已导出为图片。" : "The current strategy detail was exported as an image.");
    } catch {
      appToast("error", lang === "zh" ? "PNG 导出失败" : "PNG export failed", lang === "zh" ? "请稍后重试。" : "Please try again.");
    }
  };

  const handleExportPdf = async () => {
    try {
      await runExportPdf();
      appToast("success", lang === "zh" ? "已导出 PDF" : "PDF exported", lang === "zh" ? "当前策略摘要已导出为 PDF。" : "The strategy summary was exported as PDF.");
    } catch {
      appToast("error", lang === "zh" ? "PDF 导出失败" : "PDF export failed", lang === "zh" ? "请稍后重试。" : "Please try again.");
    }
  };

  const resetStrategies = () => {
    const next = cloneStrategies();
    setStrategies(next);
    setActiveId(next[0]?.id || "");
    appToast("info", lang === "zh" ? "已恢复默认参数" : "Defaults restored", lang === "zh" ? "所有策略腿结构已恢复到默认值。" : "All strategy legs were restored to defaults.");
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
    <main className={PAGE_BG}>
      <div className={`${PAGE_WRAP} gap-6`}>
        <SpotlightCard
          className="hero-card option-hero float-in rounded-[30px] p-5 backdrop-blur-xl md:p-7"
          spotlightColor={theme === "dark" ? "rgba(88,164,255,0.16)" : "rgba(76,132,255,0.16)"}
        >
          <div className="finance-hero-top">
            <div className="finance-brand-mark">
              <div className="finance-brand-name">{lang === "zh" ? "期权策略实验台" : "Options Strategy Studio"}</div>
              <div className="finance-hero-live">{heroBadge}</div>
            </div>
            <Button variant="outline" size="sm" className="bg-background/78" onClick={resetStrategies}>
              <RefreshCw className="h-4 w-4" />
              {t("optReset")}
            </Button>
          </div>

          <div className="option-hero-grid">
            <div className="option-hero-copy">
              <h1 className="option-hero-title">{heroTitle}</h1>
              <p className="option-hero-sub">{heroSub}</p>
              <div className="option-hero-stat-grid">
                <div className="hero-stat">
                  <div className="hero-stat-label">{lang === "zh" ? "当前策略" : "Active Strategy"}</div>
                  <div className="hero-stat-value">{active?.strategy.name || "-"}</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-label">{t("optExpiryPrice")}</div>
                  <div className="hero-stat-value">{fmtUSD(expiryPrice)}</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-label">{t("optCenterPrice")}</div>
                  <div className="hero-stat-value">{fmtUSD(centerPrice)}</div>
                </div>
              </div>
            </div>

            <div className="option-control-card">
              <div className="option-control-head">
                <SlidersHorizontal className="h-4 w-4" />
                <span>{lang === "zh" ? "核心假设" : "Core Assumptions"}</span>
              </div>
              <div className="grid gap-4">
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
              </div>
            </div>
          </div>
        </SpotlightCard>

        <section className="option-section-shell">
          <div className="option-section-head">
            <div>
              <div className="text-lg font-semibold text-foreground">{libraryTitle}</div>
              <div className="mt-1 text-sm text-muted-foreground">{librarySub}</div>
            </div>
            <div className="option-meta-pill">
              {analyses.length} {lang === "zh" ? "个策略" : "strategies"}
            </div>
          </div>

          <section className="option-strategy-grid">
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
                lang={lang}
              />
            ))}
          </section>
        </section>

        {active ? (
          <div ref={detailRef} className="dr-card option-detail-shell rounded-[28px]">
            <div className="option-detail-head">
              <div className="min-w-0">
                <div className="text-lg font-semibold text-foreground">
                  {active.strategy.name} · {detailTitle}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{detailSub}</div>
                <div className="mt-3 option-pill w-fit">{getStrategyDescription(active.strategy, lang)}</div>
              </div>
              <div className="option-export-row">
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

            <div className="option-kpi-grid">
              <Kpi title={t("optPnlNow")} value={fmtUSD(active.pnl)} tone={active.pnl >= 0 ? "good" : "bad"} />
              <Kpi title={t("optBreakeven")} value={active.breakevens.length ? active.breakevens.join(" / ") : noBreakevenLabel} />
              <Kpi title={lang === "zh" ? "区间最大收益" : "Max Profit"} value={fmtUSD(active.risk.maxProfit)} sub={activeRiskHints?.maxProfit} />
              <Kpi title={lang === "zh" ? "区间最大亏损" : "Max Loss"} value={fmtUSD(active.risk.maxLoss)} sub={activeRiskHints?.maxLoss} />
            </div>

            <OptionPayoffChart data={active.series} breakevens={active.breakevens} lang={lang} chartRef={chartRef} />

            <div className="option-legs-shell">
              <div className="text-base font-semibold text-foreground">{t("optLegsTitle")}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {lang === "zh" ? "调整执行价、权利金和数量，图表会实时更新。" : "Adjust strikes, premiums, and quantity to update the chart live."}
              </div>

              <div className="mt-4 grid gap-3 text-xs">
                {active.strategy.stock ? (
                  <div className="option-leg-row option-leg-row-stock">
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
                  <div key={`${active.strategy.id}-${idx}`} className="option-leg-row">
                    <div className="option-leg-meta">
                      <div className="option-leg-name">{leg.label}</div>
                      <div className="option-leg-type">
                        {leg.optionType.toUpperCase()} · {leg.side.toUpperCase()}
                      </div>
                    </div>
                    <Field label={legStrikeLabel}>
                      <Input
                        type="number"
                        step="0.01"
                        value={leg.strike}
                        onChange={(e) => updateLeg(active.strategy.id, idx, "strike", Number(e.target.value))}
                      />
                    </Field>
                    <Field label={legPremiumLabel}>
                      <Input
                        type="number"
                        step="0.01"
                        value={leg.premium}
                        onChange={(e) => updateLeg(active.strategy.id, idx, "premium", Number(e.target.value))}
                      />
                    </Field>
                    <Field label={legQtyLabel}>
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
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function Kpi({ title, value, tone, sub }: { title: string; value: string; tone?: "good" | "bad"; sub?: string }) {
  return (
    <div className="option-kpi">
      <div className="option-kpi-title">{title}</div>
      <div className={`option-kpi-value ${tone === "good" ? "text-emerald-500" : tone === "bad" ? "text-rose-500" : ""}`}>{value}</div>
      {sub ? <div className="option-kpi-sub">{sub}</div> : null}
    </div>
  );
}
