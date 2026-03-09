export type StrategyBriefItem = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export function StrategyBrief({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: StrategyBriefItem[];
}) {
  return (
    <div className="dr-panel grid gap-4 rounded-[24px] p-4">
      <div>
        <div className="section-kicker">{title}</div>
        <div className="mt-2 text-base font-semibold text-foreground">{title}</div>
        <div className="surface-sub">{subtitle}</div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="brief-item p-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{item.label}</div>
            <div className="mt-3 text-base font-semibold text-foreground">{item.value}</div>
            <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
