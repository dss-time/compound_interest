import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtMoney } from "@/lib/utils";

function BaseTable({ headers, rows }: { headers: string[]; rows: any[][] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((h, idx) => (
            <TableHead key={idx} className={idx === 0 ? "text-center" : undefined}>
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, rIdx) => (
          <TableRow key={rIdx}>
            {row.map((cell, cIdx) => {
              if (cell && typeof cell === "object" && "text" in cell) {
                const tone =
                  cell.className === "good" ? "positive" : cell.className === "bad" ? "negative" : undefined;
                return (
                  <TableCell key={cIdx} className={`${tone || ""} ${cIdx === 0 ? "text-center" : ""}`}>
                    {cell.text}
                  </TableCell>
                );
              }
              return (
                <TableCell key={cIdx} className={cIdx === 0 ? "text-center" : undefined}>
                  {String(cell)}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function DetailsTable({ baseResult, lang, t, currency = "CNY" }: any) {
  if (!baseResult.ok) return null;
  const headers = [t("thMonth"), t("thGain"), t("thProfit"), t("thBalance")];
  const body = baseResult.base.rows.map((r: any) => [
    r.m,
    fmtMoney(lang, currency, r.gain),
    fmtMoney(lang, currency, r.profit),
    fmtMoney(lang, currency, r.balance),
  ]);
  return <BaseTable headers={headers} rows={body} />;
}

export function SingleDrawdownTable({ data, lang, t, currency = "CNY" }: any) {
  const headers = [
    t("thDd"),
    t("thNetProfit"),
    t("thFinalBalance"),
    t("thPeak"),
    data.strategy === "fixed" ? t("thFixedMonth") : t("thWorstMonth"),
  ];
  const body: any[] = [];
  body.push(["-", fmtMoney(lang, currency, data.base.profit), fmtMoney(lang, currency, data.base.balance), "-", "-"]);
  data.results.forEach((r: any) => {
    const prClass = r.finalProfit >= 0 ? "good" : "bad";
    body.push([
      r.dd + "%",
      { text: fmtMoney(lang, currency, r.finalProfit), className: prClass },
      fmtMoney(lang, currency, r.finalBalance),
      isFinite(r.peakBefore) ? fmtMoney(lang, currency, r.peakBefore) : "-",
      String(r.month),
    ]);
  });
  return <BaseTable headers={headers} rows={body} />;
}

export function MultiSummaryTable({ data, lang, t, currency = "CNY" }: any) {
  const headers = [lang === "zh" ? "项目" : "Item", lang === "zh" ? "数值" : "Value"];
  const ddCount = data.seq.length;
  const worstPeak = data.tl.rows.reduce((acc: number, r: any) => Math.max(acc, r.peak), data.base.balance);
  const body = [
    [lang === "zh" ? "回撤次数" : "Drawdowns", String(ddCount)],
    [t("thNetProfit"), { text: fmtMoney(lang, currency, data.tl.profit), className: data.tl.profit >= 0 ? "good" : "bad" }],
    [t("thFinalBalance"), fmtMoney(lang, currency, data.tl.balance)],
    [
      lang === "zh" ? "相对无回撤差值" : "Delta vs no-DD",
      {
        text: fmtMoney(lang, currency, data.tl.balance - data.base.balance),
        className: data.tl.balance - data.base.balance >= 0 ? "good" : "bad",
      },
    ],
    [lang === "zh" ? "周期内最高峰值（Peak）" : "Peak during period", fmtMoney(lang, currency, worstPeak)],
  ];

  const evHeaders = [
    lang === "zh" ? "序号" : "#",
    t("thMonth"),
    t("thDd"),
    lang === "zh" ? "回撤前 Peak" : "Peak before DD",
    lang === "zh" ? "回撤后余额" : "Balance after DD",
  ];
  const evRows = data.tl.appliedEvents.map((e: any, idx: number) => [
    String(idx + 1),
    String(e.month),
    e.dd + "%",
    fmtMoney(lang, currency, e.peakBefore),
    fmtMoney(lang, currency, e.balanceAfter),
  ]);

  return (
    <div className="grid gap-4">
      <div className="table-scroll">
        <BaseTable headers={headers} rows={body} />
      </div>
      <div className="table-scroll">
        <BaseTable headers={evHeaders} rows={evRows.length ? evRows : [["-", "-", "-", "-", "-"]]} />
      </div>
    </div>
  );
}

export function RandomSummaryTable({ data, lang, t, currency = "CNY" }: any) {
  const headers = [t("thMetric"), t("thP50"), t("thP90Worst"), t("thMin"), t("thMax")];
  const body = [
    [
      t("thNetProfit"),
      fmtMoney(lang, currency, data.sim.profit.p50),
      fmtMoney(lang, currency, data.sim.profit.p90Worst),
      fmtMoney(lang, currency, data.sim.profit.min),
      fmtMoney(lang, currency, data.sim.profit.max),
    ],
    [
      t("thFinalBalance"),
      fmtMoney(lang, currency, data.sim.balance.p50),
      fmtMoney(lang, currency, data.sim.balance.p90Worst),
      fmtMoney(lang, currency, data.sim.balance.min),
      fmtMoney(lang, currency, data.sim.balance.max),
    ],
    [
      lang === "zh" ? "相对无回撤差值（余额）" : "Delta vs no-DD (balance)",
      fmtMoney(lang, currency, data.sim.balance.p50 - data.base.balance),
      fmtMoney(lang, currency, data.sim.balance.p90Worst - data.base.balance),
      fmtMoney(lang, currency, data.sim.balance.min - data.base.balance),
      fmtMoney(lang, currency, data.sim.balance.max - data.base.balance),
    ],
  ];

  return (
    <div className="grid gap-4">
      <div className="table-scroll">
        <BaseTable headers={headers} rows={body} />
      </div>
      <div className="text-xs text-muted-foreground">
        {t("rndMetaRuns")}
        <span className="mono ml-1">{data.sim.runs}</span>
        {t("rndMetaSeed")}
        <span className="mono ml-1">{String(data.sim.seedUsed).slice(0, 48)}</span>
        <div className="mt-2 text-xs text-muted-foreground/80">{t("rndExplain")}</div>
      </div>
    </div>
  );
}
