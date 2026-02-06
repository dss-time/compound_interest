import { Button } from "@/components/ui/button";
import { fmtMoney, fmtPct } from "@/lib/utils";

type SnapshotLike = {
  id: string;
  createdAt: number;
  balance: number;
  profit: number;
  annualized: number;
  drawdownImpact: number;
};

function deltaClass(v: number) {
  if (v > 0) return "text-emerald-500";
  if (v < 0) return "text-rose-500";
  return "text-muted-foreground";
}

export function SnapshotCompare({
  lang,
  currency,
  current,
  snapshot,
  snapshots,
  selectedId,
  onSelect,
  onCapture,
  onClear,
}: {
  lang: "zh" | "en";
  currency: "CNY" | "USD";
  current: SnapshotLike | null;
  snapshot: SnapshotLike | null;
  snapshots: SnapshotLike[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCapture: () => void;
  onClear: () => void;
}) {
  const title = lang === "zh" ? "结果快照对比" : "Snapshot Compare";
  const capture = lang === "zh" ? "保存当前快照" : "Capture Current";
  const clear = lang === "zh" ? "删除选中快照" : "Delete Snapshot";
  const empty = lang === "zh" ? "暂无快照，先保存一次用于差异对比。" : "No snapshot yet. Capture one first.";

  return (
    <div className="grid gap-3 rounded-xl border border-border/60 bg-background/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold">{title}</div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={onCapture} disabled={!current}>
            {capture}
          </Button>
          <Button size="sm" variant="ghost" onClick={onClear} disabled={!snapshot}>
            {clear}
          </Button>
        </div>
      </div>

      {snapshots.length ? (
        <div className="flex flex-wrap gap-2 text-xs">
          {snapshots.map((item) => {
            const active = selectedId === item.id;
            return (
              <button
                key={item.id}
                className={`rounded-full border px-3 py-1 transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/60 bg-background/80 text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => onSelect(item.id)}
              >
                {new Date(item.createdAt).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US")} ·{" "}
                {new Date(item.createdAt).toLocaleTimeString(lang === "zh" ? "zh-CN" : "en-US", { hour12: false })}
              </button>
            );
          })}
        </div>
      ) : null}

      {!snapshot || !current ? (
        <div className="text-xs text-muted-foreground">{empty}</div>
      ) : (
        <div className="grid gap-2 text-xs">
          <div className="text-muted-foreground">
            {lang === "zh" ? "快照时间" : "Snapshot Time"}: {new Date(snapshot.createdAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US")}
          </div>
          <MetricRow
            name={lang === "zh" ? "收益" : "Profit"}
            current={fmtMoney(lang, currency, current.profit)}
            delta={current.profit - snapshot.profit}
            deltaText={fmtMoney(lang, currency, current.profit - snapshot.profit)}
          />
          <MetricRow
            name={lang === "zh" ? "回撤影响" : "Drawdown Impact"}
            current={fmtMoney(lang, currency, current.drawdownImpact)}
            delta={current.drawdownImpact - snapshot.drawdownImpact}
            deltaText={fmtMoney(lang, currency, current.drawdownImpact - snapshot.drawdownImpact)}
          />
          <MetricRow
            name={lang === "zh" ? "年化" : "Annualized"}
            current={fmtPct(current.annualized)}
            delta={current.annualized - snapshot.annualized}
            deltaText={fmtPct(current.annualized - snapshot.annualized)}
          />
          <MetricRow
            name={lang === "zh" ? "总金额" : "Final Balance"}
            current={fmtMoney(lang, currency, current.balance)}
            delta={current.balance - snapshot.balance}
            deltaText={fmtMoney(lang, currency, current.balance - snapshot.balance)}
          />
        </div>
      )}
    </div>
  );
}

function MetricRow({
  name,
  current,
  delta,
  deltaText,
}: {
  name: string;
  current: string;
  delta: number;
  deltaText: string;
}) {
  const prefix = delta > 0 ? "+" : "";
  return (
    <div className="grid grid-cols-[130px_1fr_auto] items-center gap-2 rounded-md border border-border/50 bg-background/80 px-3 py-2">
      <div className="text-muted-foreground">{name}</div>
      <div className="font-medium">{current}</div>
      <div className={deltaClass(delta)}>{prefix}{deltaText}</div>
    </div>
  );
}
