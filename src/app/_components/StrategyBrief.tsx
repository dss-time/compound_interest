export type StrategyBriefItem = {
  id: string;
  label: string;
  value: string;
  detail: string;
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
        <div className="text-base font-semibold text-foreground">{title}</div>
        <div className="mt-1 surface-sub">{subtitle}</div>
      </div>
      <div className="brief-grid">
        {items.map((item) => (
          <div key={item.id} className="brief-item p-3">
            <div className={lang === "zh" ? "text-xs font-medium text-muted-foreground" : "text-[11px] font-medium tracking-[0.08em] text-muted-foreground"}>
              {item.label}
            </div>
            <div className="mt-2 text-[1.05rem] font-semibold leading-snug text-foreground">{item.value}</div>
            <div className="mt-2 text-[13px] leading-6 text-muted-foreground">{item.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
