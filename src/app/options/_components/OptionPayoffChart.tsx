"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RefObject } from "react";

function fmtUSD(v: number) {
  if (!isFinite(v)) return "∞";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

export function OptionPayoffChart({
  data,
  breakevens,
  lang,
  chartRef,
}: {
  data: Array<{ price: number; pnl: number }>;
  breakevens: number[];
  lang: "zh" | "en";
  chartRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={chartRef} className="option-chart-shell">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="optionPnlFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.34" />
              <stop offset="65%" stopColor="#3b82f6" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="price" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
          <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => fmtUSD(Number(value)).replace(/[^\d.-]/g, "")} />
          <Tooltip
            content={({ active, payload, label }) => {
              const point = payload?.[0]?.payload as { price: number; pnl: number } | undefined;
              if (!active || !point) return null;
              return (
                <div className="chart-tooltip">
                  <div className="chart-tooltip-title">{lang === "zh" ? "到期价格" : "Expiry Price"} {fmtUSD(Number(label))}</div>
                  <div className="chart-tooltip-grid">
                    <div className="chart-tooltip-row">
                      <div className="chart-tooltip-label">{lang === "zh" ? "策略盈亏" : "Strategy P/L"}</div>
                      <div className="chart-tooltip-value">{fmtUSD(point.pnl)}</div>
                    </div>
                  </div>
                </div>
              );
            }}
          />
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
          {breakevens.map((be, idx) => (
            <ReferenceLine key={`${be}-${idx}`} x={be} stroke="#f97316" strokeDasharray="5 3" />
          ))}
          <Area type="monotone" dataKey="pnl" stroke="#3b82f6" strokeWidth={2.8} fill="url(#optionPnlFill)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
