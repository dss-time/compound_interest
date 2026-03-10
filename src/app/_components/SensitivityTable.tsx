"use client";

import { fmtMoney } from "@/lib/utils";

export type SensitivityRow = {
  label: string;
  balance: number;
  profit: number;
};

export function SensitivityTable({
  lang,
  currency,
  rows,
}: {
  lang: "zh" | "en";
  currency: "CNY" | "USD";
  rows: SensitivityRow[];
}) {
  if (!rows.length) return null;
  return (
    <div className="grid gap-3 rounded-xl border border-border/60 bg-background/70 p-4">
      <div>
        <div className="text-base font-semibold text-foreground">{lang === "zh" ? "敏感性分析" : "Sensitivity Analysis"}</div>
        <div className="mt-1 text-sm text-muted-foreground">
          {lang === "zh" ? "查看收益率变化对结果的影响区间。" : "Inspect how return shifts change the outcome range."}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="py-2">{lang === "zh" ? "参数扰动" : "Rate Shift"}</th>
              <th className="py-2">{lang === "zh" ? "期末余额" : "Final Balance"}</th>
              <th className="py-2">{lang === "zh" ? "净收益" : "Profit"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-border/50">
                <td className="py-2 font-medium">{row.label}</td>
                <td className="py-2">{fmtMoney(lang, currency, row.balance)}</td>
                <td className={`py-2 ${row.profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {fmtMoney(lang, currency, row.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
