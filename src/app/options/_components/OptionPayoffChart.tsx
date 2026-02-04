"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RefObject } from "react";

export function OptionPayoffChart({
  data,
  breakevens,
  chartRef,
}: {
  data: Array<{ price: number; pnl: number }>;
  breakevens: number[];
  chartRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={chartRef} className="h-80 w-full rounded-xl border border-border/60 bg-background/70 p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="price" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip formatter={(value: number) => value.toFixed(2)} />
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
          {breakevens.map((be, idx) => (
            <ReferenceLine key={`${be}-${idx}`} x={be} stroke="#f97316" strokeDasharray="5 3" />
          ))}
          <Line type="monotone" dataKey="pnl" stroke="#06b6d4" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
