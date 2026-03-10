import { Button } from "@/components/ui/button";
import { convertAmount, fmtMoney } from "@/lib/utils";

export function ScenarioPanel({ scenarios, baseResult, lang, currency, t, onSave, onRemove }: any) {
  return (
    <div className="action-shell grid gap-3 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-semibold text-foreground">{t("scenarioTitle")}</div>
          <div className="mt-1 text-sm text-muted-foreground">{t("scenarioSub")}</div>
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
            const scenarioCurrency = item.result.currency || currency;
            const scenarioFx = item.result.fxRate || 1;
            const scenarioBalance = convertAmount(item.result.balance, scenarioCurrency, currency, scenarioFx);
            const scenarioProfit = convertAmount(item.result.profit, scenarioCurrency, currency, scenarioFx);
            const diff = baseResult.ok ? baseResult.base.balance - scenarioBalance : 0;
            return (
              <div key={item.id} className="rounded-[18px] border border-border/60 bg-background/80 p-3">
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
                        {t("scenarioBalance")} {fmtMoney(lang, currency, scenarioBalance)} · {t("scenarioProfit")}{" "}
                        {fmtMoney(lang, currency, scenarioProfit)}
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
