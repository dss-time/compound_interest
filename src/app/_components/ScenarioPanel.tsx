import { Button } from "@/components/ui/button";
import { fmtMoney } from "@/lib/utils";

export function ScenarioPanel({ scenarios, baseResult, lang, currency, t, onSave, onRemove }: any) {
  return (
    <div className="grid gap-3 rounded-xl border border-border/60 bg-background/70 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{t("scenarioTitle")}</div>
          <div className="text-xs text-muted-foreground">{t("scenarioSub")}</div>
        </div>
        <Button size="sm" variant="secondary" onClick={onSave} disabled={!baseResult.ok}>
          {t("scenarioSave")}
        </Button>
      </div>
      {scenarios.length === 0 ? (
        <div className="text-xs text-muted-foreground">{t("scenarioEmpty")}</div>
      ) : (
        <div className="grid gap-3">
          {scenarios.map((item: any) => {
            const diff = baseResult.ok ? baseResult.base.balance - item.result.balance : 0;
            return (
              <div key={item.id} className="rounded-lg border border-border/60 bg-background/80 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US")}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => onRemove(item.id)}>
                    {t("scenarioRemove")}
                  </Button>
                </div>
                    <div className="mt-2 grid gap-2 text-xs text-muted-foreground">
                      <div>
                        {t("scenarioBalance")} {fmtMoney(lang, currency, item.result.balance)} · {t("scenarioProfit")}{" "}
                        {fmtMoney(lang, currency, item.result.profit)}
                      </div>
                      {baseResult.ok ? (
                        <div className={diff >= 0 ? "text-emerald-500" : "text-rose-500"}>
                          {t("scenarioDiff")} {fmtMoney(lang, currency, diff)}
                        </div>
                      ) : null}
                    </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
