import { DollarSign, Target, TrendingDown, TrendingUp } from "lucide-react";

import { getStrategyDescription, getStrategyRiskHints, type StrategyTemplate } from "@/app/options/_domain/payoff";

function fmtUSD(v: number) {
  if (!isFinite(v)) return "∞";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

export function StrategyCard({
  strategy,
  pnl,
  breakevens,
  maxProfit,
  maxLoss,
  active,
  onSelect,
  outlookLabel,
  lang,
}: {
  strategy: StrategyTemplate;
  pnl: number;
  breakevens: number[];
  maxProfit: number;
  maxLoss: number;
  active: boolean;
  onSelect: () => void;
  outlookLabel: string;
  lang: "zh" | "en";
}) {
  const riskHints = getStrategyRiskHints(strategy, lang);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`option-strategy-card liquid-button ${active ? "is-active" : ""}`}
      data-liquid-active={active ? "true" : undefined}
    >
      <div className="option-strategy-head">
        <div className="min-w-0">
          <div className="option-strategy-title">{strategy.name}</div>
          <div className="option-strategy-desc">{getStrategyDescription(strategy, lang)}</div>
        </div>
        <div className="option-pill">{outlookLabel}</div>
      </div>
      <div className="option-strategy-metrics">
        <div className="option-strategy-metric">
          <div className="option-strategy-label">
            <DollarSign className="h-3.5 w-3.5 text-primary" />
            {lang === "zh" ? "到期盈亏" : "Expiry P/L"}
          </div>
          <div className={pnl >= 0 ? "option-strategy-value text-emerald-500" : "option-strategy-value text-rose-500"}>
            {fmtUSD(pnl)}
          </div>
        </div>
        <div className="option-strategy-metric">
          <div className="option-strategy-label">
            <Target className="h-3.5 w-3.5 text-primary" />
            {lang === "zh" ? "盈亏平衡点" : "Breakeven"}
          </div>
          <div className="option-strategy-value">{breakevens.length ? breakevens.join(" / ") : lang === "zh" ? "无" : "None"}</div>
        </div>
        <div className="option-strategy-metric">
          <div className="option-strategy-label">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            {lang === "zh" ? "区间最大收益" : "Max Profit"}
          </div>
          <div className="option-strategy-value">{fmtUSD(maxProfit)}</div>
        </div>
        <div className="option-strategy-metric">
          <div className="option-strategy-label">
            <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
            {lang === "zh" ? "区间最大亏损" : "Max Loss"}
          </div>
          <div className="option-strategy-value">{fmtUSD(maxLoss)}</div>
        </div>
      </div>
      <div className="option-strategy-footer">
        <div className="option-strategy-note">
          {lang === "zh" ? "理论风险" : "Risk profile"}: {riskHints.maxProfit} / {riskHints.maxLoss}
        </div>
        <div className="option-strategy-cta">{active ? (lang === "zh" ? "当前查看中" : "Currently viewing") : lang === "zh" ? "查看详情" : "Open details"}</div>
      </div>
    </button>
  );
}
