import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function QuickStart({ presets, onApply, t, lang }: any) {
  const describePreset = (preset: any) => {
    if (preset.id.includes("trading")) {
      return lang === "zh" ? "适合展示交易日精确路径与日历依赖。" : "Best for showing precise trading-day behavior and calendar dependency.";
    }
    return lang === "zh" ? "适合快速解释长期复利与节奏差异。" : "Best for explaining long-term compounding and pacing differences.";
  };

  return (
    <div className="dr-panel grid gap-4 rounded-[24px] p-4">
      <div className="surface-head">
        <div>
          <div className="section-kicker">{t("quickStartTitle")}</div>
          <div className="mt-2 text-base font-semibold text-foreground">{t("quickStartTitle")}</div>
          <div className="surface-sub">{t("quickStartSub")}</div>
        </div>
        <Badge variant="outline" className="rounded-full border-border/60 bg-background/70">
          {t("quickStartBadge")}
        </Badge>
      </div>
      <div className="quickstart-grid sm:grid-cols-3">
        {presets.slice(0, 3).map((preset: any, index: number) => (
          <Button
            key={preset.id}
            variant="secondary"
            className="quickstart-tile h-auto whitespace-normal p-0 shadow-none hover:bg-transparent"
            onClick={() => onApply(preset)}
          >
            <div className="quickstart-tag">{lang === "zh" ? `预设 0${index + 1}` : `Preset 0${index + 1}`}</div>
            <div className="quickstart-title">{lang === "en" ? preset.labelEn || preset.label : preset.labelZh || preset.label}</div>
            <div className="quickstart-sub">{describePreset(preset)}</div>
          </Button>
        ))}
      </div>
    </div>
  );
}
