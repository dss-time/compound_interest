import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { StrategyTemplate } from "@/app/options/_domain/payoff";

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
}: {
  strategy: StrategyTemplate;
  pnl: number;
  breakevens: number[];
  maxProfit: number;
  maxLoss: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <Card className={active ? "border-primary shadow-lg" : ""}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{strategy.name}</CardTitle>
          <Badge variant="outline">{strategy.outlook}</Badge>
        </div>
        <CardDescription>{strategy.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 text-xs">
        <div className="rounded-md bg-muted/60 px-2 py-1">
          当前到期盈亏: <span className={pnl >= 0 ? "text-emerald-500" : "text-rose-500"}>{fmtUSD(pnl)}</span>
        </div>
        <div>盈亏平衡点: {breakevens.length ? breakevens.join(" / ") : "无"}</div>
        <div>范围内最大盈利: {fmtUSD(maxProfit)}</div>
        <div>范围内最大亏损: {fmtUSD(maxLoss)}</div>
        <div className="text-muted-foreground">理论: {strategy.maxProfitHint} / {strategy.maxLossHint}</div>
        <Button size="sm" variant={active ? "default" : "secondary"} onClick={onSelect}>
          {active ? "查看中" : "查看详情"}
        </Button>
      </CardContent>
    </Card>
  );
}
