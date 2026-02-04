import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function QuickStart({ presets, onApply, t }: any) {
  return (
    <div className="grid gap-3 rounded-xl border border-border/60 bg-background/70 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{t("quickStartTitle")}</div>
          <div className="text-xs text-muted-foreground">{t("quickStartSub")}</div>
        </div>
        <Badge variant="outline">{t("quickStartBadge")}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.slice(0, 3).map((preset: any) => (
          <Button key={preset.id} variant="secondary" size="sm" onClick={() => onApply(preset)}>
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
