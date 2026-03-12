import { CalendarRange, Shield, Sparkles, Target, TrendingUp, Wallet, type LucideIcon } from "lucide-react";

export type StrategyBriefItem = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

const BRIEF_ICONS: Record<string, LucideIcon> = {
  simulation: Sparkles,
  return: TrendingUp,
  duration: CalendarRange,
  capital: Wallet,
  risk: Shield,
};

export function StrategyBrief({
  lang,
  title,
  subtitle,
  items,
}: {
  lang: "zh" | "en";
  title: string;
  subtitle: string;
  items: StrategyBriefItem[];
}) {
  return (
    <div className="dr-panel grid gap-4 rounded-[24px] p-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/18 bg-primary/10 text-primary">
            <Target className="h-4 w-4" />
          </span>
          <div className="text-base font-semibold text-foreground">{title}</div>
        </div>
        <div className="mt-1 surface-sub">{subtitle}</div>
      </div>
      <div className="brief-grid">
        {items.map((item) => {
          const Icon = BRIEF_ICONS[item.id] || Sparkles;
          return (
            <div key={item.id} className="brief-item p-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-border/60 bg-background/70 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div className={lang === "zh" ? "text-xs font-medium text-muted-foreground" : "text-[11px] font-medium tracking-[0.08em] text-muted-foreground"}>
                  {item.label}
                </div>
              </div>
              <div className="mt-2 text-[1.05rem] font-semibold leading-snug text-foreground">{item.value}</div>
              <div className="mt-2 text-[13px] leading-6 text-muted-foreground">{item.detail}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
