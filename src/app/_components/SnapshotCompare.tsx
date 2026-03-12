import { Camera, Clock3, GitCompareArrows, Trash2 } from "lucide-react";

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
  const emptyTitle = lang === "zh" ? "还没有对比基线" : "No baseline yet";
  const emptySub = current
    ? lang === "zh"
      ? "当前结果已经可用，建议先保存一次快照，后续改参数时就能直接看差值。"
      : "The current result is ready. Capture one snapshot first so later parameter changes are comparable."
    : lang === "zh"
    ? "先完成一次有效计算，再保存快照。"
    : "Complete one valid calculation before capturing a snapshot.";
  const emptyTips = lang === "zh"
    ? ["冻结当前收益曲线", "对比净收益与年化变化", "保留最近 5 个方案节点"]
    : ["Freeze the current curve", "Compare profit and annualized deltas", "Keep the latest 5 checkpoints"];
  const previewTitle = lang === "zh" ? "本次会冻结" : "This capture will freeze";
  const selectPrompt = lang === "zh" ? "已存在快照，选择一个后即可查看差值。" : "Snapshots exist. Select one to inspect the deltas.";

  return (
    <div className="action-shell grid gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-border/60 bg-background/70 text-primary">
              <GitCompareArrows className="h-4 w-4" />
            </span>
            <div className="text-base font-semibold text-foreground">{title}</div>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {lang === "zh" ? "冻结一个结果节点，后续改参数时可直接看差值。" : "Freeze a result checkpoint so later edits show direct deltas."}
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-2 md:w-auto">
          <Button
            size="sm"
            variant={snapshots.length ? "secondary" : "default"}
            onClick={onCapture}
            disabled={!current}
            className="min-w-0 flex-1 md:flex-none"
          >
            <Camera className="h-4 w-4" />
            {capture}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClear}
            disabled={!snapshot}
            className="min-w-0 flex-1 md:flex-none"
          >
            <Trash2 className="h-4 w-4" />
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
                className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-out ${
                  active
                    ? "border-primary/30 bg-primary/12 text-foreground shadow-[0_8px_18px_hsl(var(--primary)/0.12)]"
                    : "border-border/60 bg-background/80 text-muted-foreground hover:-translate-y-px hover:text-foreground hover:shadow-[0_8px_18px_rgba(15,23,42,0.06)]"
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

      {!snapshots.length ? (
        <div className="grid gap-3 rounded-[20px] border border-dashed border-border/70 bg-background/60 p-4">
          <div>
            <div className="text-sm font-semibold text-foreground">{emptyTitle}</div>
            <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{emptySub}</div>
          </div>
          {current ? (
            <div className="rounded-[18px] border border-border/60 bg-background/80 p-3">
              <div className="text-xs text-muted-foreground">{previewTitle}</div>
              <div className="mt-2 grid gap-2 md:grid-cols-3">
                <MiniMetric label={lang === "zh" ? "收益" : "Profit"} value={fmtMoney(lang, currency, current.profit)} />
                <MiniMetric label={lang === "zh" ? "总金额" : "Final Balance"} value={fmtMoney(lang, currency, current.balance)} />
                <MiniMetric label={lang === "zh" ? "年化" : "Annualized"} value={fmtPct(current.annualized)} />
              </div>
            </div>
          ) : null}
          <div className="grid gap-2 md:grid-cols-3">
            {emptyTips.map((tip) => (
              <div key={tip} className="rounded-[18px] border border-border/60 bg-background/80 px-3 py-2 text-xs text-muted-foreground">
                {tip}
              </div>
            ))}
          </div>
        </div>
      ) : !snapshot || !current ? (
        <div className="rounded-[18px] border border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground">{selectPrompt}</div>
      ) : (
        <div className="grid gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5 text-primary" />
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

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-border/60 bg-background/70 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
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
    <div className="grid grid-cols-[130px_1fr_auto] items-center gap-2 rounded-[18px] border border-border/50 bg-background/80 px-3 py-2">
      <div className="text-muted-foreground">{name}</div>
      <div className="font-medium">{current}</div>
      <div className={deltaClass(delta)}>{prefix}{deltaText}</div>
    </div>
  );
}
