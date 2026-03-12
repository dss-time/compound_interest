import { AlertTriangle, ArrowRight, CheckCircle2, CircleDashed, ShieldCheck, Sparkles } from "lucide-react";

export type ReadinessItem = {
  id: string;
  title: string;
  detail: string;
  status: "done" | "pending" | "warning";
  statusLabel: string;
};

export function ReadinessPanel({
  title,
  subtitle,
  summary,
  primaryAction,
  items,
}: {
  title: string;
  subtitle: string;
  summary: string;
  primaryAction: string;
  items: ReadinessItem[];
}) {
  const iconForStatus = (status: ReadinessItem["status"]) => {
    if (status === "done") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (status === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <CircleDashed className="h-4 w-4 text-muted-foreground" />;
  };

  const badgeClass = (status: ReadinessItem["status"]) => {
    if (status === "done") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
    if (status === "warning") return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    return "border-border/60 bg-background/70 text-muted-foreground";
  };

  return (
    <div className="dr-panel grid gap-4 rounded-[24px] p-4">
      <div className="surface-head">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-500/18 bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div className="text-base font-semibold text-foreground">{title}</div>
          </div>
          <div className="mt-1 surface-sub">{subtitle}</div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {summary}
        </div>
      </div>
      <div className="readiness-strip flex items-start gap-2 px-4 py-3 text-xs leading-relaxed text-foreground">
        <ArrowRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
        <span>{primaryAction}</span>
      </div>
      <div className="grid gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="readiness-item grid gap-2 px-3 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
          >
            <div className="pt-0.5 sm:pt-0">{iconForStatus(item.status)}</div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">{item.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</div>
            </div>
            <div className={`justify-self-start rounded-full border px-2 py-1 text-[11px] font-medium shadow-sm sm:justify-self-end ${badgeClass(item.status)}`}>
              {item.statusLabel}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
