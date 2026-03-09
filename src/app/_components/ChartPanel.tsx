import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useState, type RefObject } from "react";
import { Activity, TrendingUp, Wallet } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fmtMoney } from "@/lib/utils";

export function ChartPanel({
  chartData,
  chartMode,
  onChangeMode,
  lang,
  t,
  currency,
  snapshotData,
  chartRef,
}: {
  chartData: Array<{ month: number; balance: number; profit: number; gain: number }>;
  chartMode: string;
  onChangeMode: (value: string) => void;
  lang: "zh" | "en";
  t: (key: string, vars?: Record<string, string | number>) => string;
  currency: "USD" | "CNY";
  snapshotData?: Array<{ month: number; balance: number; profit: number; gain: number }>;
  chartRef?: RefObject<HTMLDivElement | null>;
}) {
  const [activeMonth, setActiveMonth] = useState<number | null>(null);
  const [modeFx, setModeFx] = useState(false);
  const latest = chartData.length ? chartData[chartData.length - 1] : null;
  const hasData = chartData.length > 0;
  const focusPoint = useMemo(
    () => chartData.find((item) => item.month === activeMonth) || latest,
    [chartData, activeMonth, latest]
  );
  const snapshotFocusPoint = useMemo(
    () => snapshotData?.find((item) => item.month === activeMonth) || (snapshotData?.length ? snapshotData[snapshotData.length - 1] : null),
    [snapshotData, activeMonth]
  );
  const focusMonthLabel = focusPoint ? `${t("thMonth")} ${focusPoint.month}` : "-";
  const balanceDelta =
    focusPoint && snapshotFocusPoint ? focusPoint.balance - snapshotFocusPoint.balance : null;
  const profitDelta =
    focusPoint && snapshotFocusPoint ? focusPoint.profit - snapshotFocusPoint.profit : null;
  const gainDelta =
    focusPoint && snapshotFocusPoint ? focusPoint.gain - snapshotFocusPoint.gain : null;

  const isBalanceVisible = chartMode === "balance_profit" || chartMode === "balance";
  const isProfitVisible = chartMode === "balance_profit" || chartMode === "profit";
  const isGainVisible = chartMode === "gain";
  const metricColors = {
    balance: "#10b981",
    profit: "#0ea5e9",
    gain: "#a855f7",
  } as const;
  const snapshotMap = useMemo(() => new Map((snapshotData || []).map((item) => [item.month, item])), [snapshotData]);

  useEffect(() => {
    setModeFx(true);
    const timer = window.setTimeout(() => setModeFx(false), 260);
    return () => window.clearTimeout(timer);
  }, [chartMode]);

  return (
    <div className="chart-card rounded-xl border border-border/60 bg-background/70 p-4" ref={chartRef}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{t("chartTitle")}</div>
          <div className="text-xs text-muted-foreground">{t("chartSub")}</div>
        </div>
        <Tabs value={chartMode} onValueChange={(value) => onChangeMode(value)}>
          <TabsList className="chart-mode-tabs h-auto gap-1 p-1">
            <TabsTrigger value="balance_profit">{t("chartModeBoth")}</TabsTrigger>
            <TabsTrigger value="balance">{t("chartBalance")}</TabsTrigger>
            <TabsTrigger value="profit">{t("chartProfit")}</TabsTrigger>
            <TabsTrigger value="gain">{t("chartGain")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">{focusMonthLabel}</div>
      <div className={`chart-legend-rail mt-2 ${modeFx ? "is-switching" : ""}`}>
        {isBalanceVisible ? (
          <span className="legend-chip">
            <span className="legend-dot bg-emerald-500" />
            {t("chartBalance")}
          </span>
        ) : null}
        {isProfitVisible ? (
          <span className="legend-chip">
            <span className="legend-dot bg-sky-500" />
            {t("chartProfit")}
          </span>
        ) : null}
        {isGainVisible ? (
          <span className="legend-chip">
            <span className="legend-dot bg-violet-500" />
            {t("chartGain")}
          </span>
        ) : null}
        {!!snapshotData?.length ? (
          <span className="legend-chip legend-chip-ghost">{lang === "zh" ? "快照（虚线）" : "Snapshot (dashed)"}</span>
        ) : null}
      </div>
      {focusPoint ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div className="chart-stat-tile">
            <div className="chart-stat-label">
              <Wallet className="h-3.5 w-3.5" />
              {t("chartBalance")}
            </div>
            <div className="chart-stat-value">{fmtMoney(lang, currency, focusPoint.balance)}</div>
            {balanceDelta !== null ? (
              <div className={`chart-stat-delta ${balanceDelta >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {lang === "zh" ? "较快照 " : "vs Snapshot "}
                {balanceDelta >= 0 ? "+" : ""}
                {fmtMoney(lang, currency, balanceDelta)}
              </div>
            ) : null}
          </div>
          <div className="chart-stat-tile">
            <div className="chart-stat-label">
              <TrendingUp className="h-3.5 w-3.5" />
              {t("chartProfit")}
            </div>
            <div className="chart-stat-value">{fmtMoney(lang, currency, focusPoint.profit)}</div>
            {profitDelta !== null ? (
              <div className={`chart-stat-delta ${profitDelta >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {lang === "zh" ? "较快照 " : "vs Snapshot "}
                {profitDelta >= 0 ? "+" : ""}
                {fmtMoney(lang, currency, profitDelta)}
              </div>
            ) : null}
          </div>
          <div className="chart-stat-tile">
            <div className="chart-stat-label">
              <Activity className="h-3.5 w-3.5" />
              {t("chartGain")}
            </div>
            <div className="chart-stat-value">{fmtMoney(lang, currency, focusPoint.gain)}</div>
            {gainDelta !== null ? (
              <div className={`chart-stat-delta ${gainDelta >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {lang === "zh" ? "较快照 " : "vs Snapshot "}
                {gainDelta >= 0 ? "+" : ""}
                {fmtMoney(lang, currency, gainDelta)}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {hasData ? (
        <div className="chart-canvas mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              onMouseMove={(state: any) => {
                if (state && state.activeLabel != null) {
                  const next = Number(state.activeLabel);
                  if (Number.isFinite(next)) setActiveMonth(next);
                }
              }}
              onMouseLeave={() => setActiveMonth(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => fmtMoney(lang, currency, value).replace(/[^\d.-]/g, "")}
              />
              <RechartsTooltip
                cursor={{ stroke: "hsl(var(--primary) / 0.28)", strokeDasharray: "4 4" }}
                content={({ active, payload, label }: TooltipProps<number, string>) => {
                  const month = Number(label);
                  if (!active || !payload?.length || !Number.isFinite(month)) return null;
                  const point = payload[0]?.payload as
                    | { balance: number; profit: number; gain: number }
                    | undefined;
                  if (!point) return null;
                  const snapshot = snapshotMap.get(month);
                  return (
                    <div className="chart-tooltip">
                      <div className="chart-tooltip-title">{`${t("thMonth")} ${month}`}</div>
                      <div className="chart-tooltip-grid">
                        {(["balance", "profit", "gain"] as const)
                          .filter((key) => (key === "balance" ? isBalanceVisible : key === "profit" ? isProfitVisible : isGainVisible))
                          .map((key) => {
                            const value = Number(point[key] ?? 0);
                            const snapshotValue = snapshot ? Number(snapshot[key]) : null;
                            const delta = snapshotValue === null ? null : value - snapshotValue;
                            const labelText =
                              key === "balance" ? t("chartBalance") : key === "profit" ? t("chartProfit") : t("chartGain");

                            return (
                              <div key={key} className="chart-tooltip-row">
                                <div className="chart-tooltip-label">
                                  <span className="legend-dot" style={{ backgroundColor: metricColors[key] }} />
                                  {labelText}
                                </div>
                                <div className="chart-tooltip-value">{fmtMoney(lang, currency, value)}</div>
                                {delta !== null ? (
                                  <div className={`chart-tooltip-delta ${delta >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                    {lang === "zh" ? "较快照 " : "vs Snapshot "}
                                    {delta >= 0 ? "+" : ""}
                                    {fmtMoney(lang, currency, delta)}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                }}
              />
              {activeMonth !== null ? (
                <ReferenceLine x={activeMonth} stroke="hsl(var(--primary) / 0.6)" strokeDasharray="4 4" />
              ) : null}
              {isBalanceVisible && (
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#10b981"
                  strokeWidth={2.4}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 1.5, stroke: "#10b981", fill: "hsl(var(--background))" }}
                />
              )}
              {isProfitVisible && (
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#0ea5e9"
                  strokeWidth={2.4}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 1.5, stroke: "#0ea5e9", fill: "hsl(var(--background))" }}
                />
              )}
              {isGainVisible && (
                <Line
                  type="monotone"
                  dataKey="gain"
                  stroke="#a855f7"
                  strokeWidth={2.4}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 1.5, stroke: "#a855f7", fill: "hsl(var(--background))" }}
                />
              )}
              {!!snapshotData?.length && (
                <>
                  {isBalanceVisible && (
                    <Line
                      type="monotone"
                      data={snapshotData}
                      dataKey="balance"
                      stroke="#10b981"
                      strokeWidth={1.2}
                      strokeOpacity={0.45}
                      dot={false}
                      strokeDasharray="6 4"
                      name={lang === "zh" ? "快照余额" : "Snapshot Balance"}
                    />
                  )}
                  {isProfitVisible && (
                    <Line
                      type="monotone"
                      data={snapshotData}
                      dataKey="profit"
                      stroke="#0ea5e9"
                      strokeWidth={1.2}
                      strokeOpacity={0.45}
                      dot={false}
                      strokeDasharray="6 4"
                      name={lang === "zh" ? "快照净收益" : "Snapshot Profit"}
                    />
                  )}
                  {isGainVisible && (
                    <Line
                      type="monotone"
                      data={snapshotData}
                      dataKey="gain"
                      stroke="#a855f7"
                      strokeWidth={1.2}
                      strokeOpacity={0.45}
                      dot={false}
                      strokeDasharray="6 4"
                      name={lang === "zh" ? "快照当月收益" : "Snapshot Gain"}
                    />
                  )}
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="chart-empty mt-4">
          <div className="chart-empty-title">{lang === "zh" ? "暂无可视化数据" : "No chart data yet"}</div>
          <div className="chart-empty-sub">
            {lang === "zh" ? "调整参数后将自动生成收益曲线。" : "Adjust inputs and the performance curve will appear automatically."}
          </div>
        </div>
      )}
    </div>
  );
}
