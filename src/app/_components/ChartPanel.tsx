import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fmtCNY } from "@/lib/utils";

export function ChartPanel({ chartData, chartMode, onChangeMode, lang, t }: any) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">{t("chartTitle")}</div>
          <div className="text-xs text-muted-foreground">{t("chartSub")}</div>
        </div>
        <Tabs value={chartMode} onValueChange={(value) => onChangeMode(value)}>
          <TabsList>
            <TabsTrigger value="balance_profit">{t("chartModeBoth")}</TabsTrigger>
            <TabsTrigger value="balance">{t("chartBalance")}</TabsTrigger>
            <TabsTrigger value="profit">{t("chartProfit")}</TabsTrigger>
            <TabsTrigger value="gain">{t("chartGain")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => fmtCNY(lang, value).replace(/[^\d.-]/g, "")}
            />
            <RechartsTooltip
              formatter={(value, name) => {
                const label =
                  name === "balance"
                    ? t("chartBalance")
                    : name === "profit"
                    ? t("chartProfit")
                    : name === "gain"
                    ? t("chartGain")
                    : name;
                return [fmtCNY(lang, value), label];
              }}
              labelFormatter={(label) => `${t("thMonth")} ${label}`}
            />
            {(chartMode === "balance_profit" || chartMode === "balance") && (
              <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} dot={false} />
            )}
            {(chartMode === "balance_profit" || chartMode === "profit") && (
              <Line type="monotone" dataKey="profit" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            )}
            {chartMode === "gain" && (
              <Line type="monotone" dataKey="gain" stroke="#a855f7" strokeWidth={2} dot={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
