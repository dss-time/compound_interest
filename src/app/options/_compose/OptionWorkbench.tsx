"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  buildPayoffSeries,
  calcBreakeven,
  calcPayoffAtExpiry,
  calcRiskProfile,
  OptionParams,
  OptionSide,
  OptionType,
} from "@/app/options/_domain/payoff";
import { OptionPayoffChart } from "@/app/options/_components/OptionPayoffChart";

function fmt(n: number) {
  if (!isFinite(n)) return "∞";
  return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
}

export function OptionWorkbench() {
  const [params, setParams] = useState<OptionParams>({
    optionType: "call",
    side: "long",
    spot: 100,
    strike: 105,
    premium: 3.2,
    contracts: 1,
  });

  const [expiryPrice, setExpiryPrice] = useState(110);

  const series = useMemo(() => buildPayoffSeries(params), [params]);
  const breakeven = useMemo(() => calcBreakeven(params), [params]);
  const pnlNow = useMemo(() => calcPayoffAtExpiry(params, expiryPrice), [params, expiryPrice]);
  const risk = useMemo(() => calcRiskProfile(params), [params]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-2xl">美股期权到期盈亏（单腿）</CardTitle>
            <Badge variant="secondary">新页面</Badge>
          </div>
          <p className="text-sm text-muted-foreground">支持 Call/Put + 买方/卖方，按到期日价格计算盈亏。</p>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="类型">
              <Select
                value={params.optionType}
                onValueChange={(value) => setParams((s) => ({ ...s, optionType: value as OptionType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="put">Put</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="方向">
              <Select value={params.side} onValueChange={(value) => setParams((s) => ({ ...s, side: value as OptionSide }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">买方 (Long)</SelectItem>
                  <SelectItem value="short">卖方 (Short)</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="合约张数">
              <Input
                type="number"
                min="1"
                step="1"
                value={params.contracts}
                onChange={(e) => setParams((s) => ({ ...s, contracts: Math.max(1, Number(e.target.value) || 1) }))}
              />
            </Field>

            <Field label="标的现价 (USD)">
              <Input
                type="number"
                step="0.01"
                value={params.spot}
                onChange={(e) => setParams((s) => ({ ...s, spot: Number(e.target.value) || 0 }))}
              />
            </Field>

            <Field label="行权价 Strike (USD)">
              <Input
                type="number"
                step="0.01"
                value={params.strike}
                onChange={(e) => setParams((s) => ({ ...s, strike: Number(e.target.value) || 0 }))}
              />
            </Field>

            <Field label="权利金 Premium (USD)">
              <Input
                type="number"
                step="0.01"
                value={params.premium}
                onChange={(e) => setParams((s) => ({ ...s, premium: Number(e.target.value) || 0 }))}
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Kpi title="到期盈亏（按下方价格）" value={fmt(pnlNow)} tone={pnlNow >= 0 ? "good" : "bad"} />
            <Kpi title="盈亏平衡点" value={breakeven.toFixed(2)} />
            <Kpi title="最大盈利" value={fmt(risk.maxProfit)} />
            <Kpi title="最大亏损" value={fmt(risk.maxLoss)} />
          </div>

          <Field label="假设到期价 (USD)">
            <Input type="number" step="0.01" value={expiryPrice} onChange={(e) => setExpiryPrice(Number(e.target.value) || 0)} />
          </Field>

          <OptionPayoffChart data={series} breakeven={breakeven} />
        </CardContent>
      </Card>
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
      <div className={`mt-1 text-xl font-semibold ${tone === "good" ? "text-emerald-500" : tone === "bad" ? "text-rose-500" : ""}`}>
        {value}
      </div>
    </div>
  );
}
