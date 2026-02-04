import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { CalendarGuide } from "@/app/_components/CalendarGuide";
import { ChartPanel } from "@/app/_components/ChartPanel";
import { MultiSummaryTable, RandomSummaryTable, SingleDrawdownTable } from "@/app/_components/ResultTables";
import { fmtCNY, fmtPct } from "@/lib/utils";

export function ResultsCard({
  t,
  lang,
  state,
  calendars,
  baseResult,
  annualizedHint,
  summaryText,
  chartData,
  chartMode,
  onChartModeChange,
  ddResult,
}: any) {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-primary/10 via-transparent to-accent/20">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{t("secResult")}</CardTitle>
          <Badge>{t("pillRealtime")}</Badge>
        </div>
        <CardDescription>
          {summaryText || (state.showAnnualized ? annualizedHint || t("annualHintMonthly") : t("kpiProfitHint"))}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <CalendarGuide show={state.simMode === "tradingDays" && !calendars.meta[state.market]?.count} t={t} />
        {baseResult.ok ? (
          <>
            <div className="rounded-xl border border-border/60 bg-background/80 p-4">
              <div className="text-xs uppercase text-muted-foreground">{t("summaryTitle")}</div>
              <div className="mt-2 text-base font-semibold">{summaryText}</div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                <div className="text-xs uppercase text-muted-foreground">{t("kpiFinal")}</div>
                <div className="mt-2 text-2xl font-semibold">{fmtCNY(lang, baseResult.base.balance)}</div>
                <div className="mt-1 text-xs text-muted-foreground">{t("kpiFinalHint")}</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                <div className="text-xs uppercase text-muted-foreground">{t("kpiProfit")}</div>
                <div
                  className={`mt-2 text-2xl font-semibold ${
                    baseResult.base.profit >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {fmtCNY(lang, baseResult.base.profit)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{t("kpiProfitHint")}</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                <div className="text-xs uppercase text-muted-foreground">{t("kpiTotalReturn")}</div>
                <div
                  className={`mt-2 text-2xl font-semibold ${
                    baseResult.base.totalReturn >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {fmtPct(baseResult.base.totalReturn)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{t("kpiTotalReturnHint")}</div>
              </div>
              {state.showAnnualized && (
                <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                  <div className="text-xs uppercase text-muted-foreground">{t("kpiAnnualized")}</div>
                  <div
                    className={`mt-2 text-2xl font-semibold ${
                      baseResult.base.annualized >= 0 ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {fmtPct(baseResult.base.annualized)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{annualizedHint}</div>
                </div>
              )}
            </div>

            <ChartPanel
              chartData={chartData}
              chartMode={chartMode}
              onChangeMode={onChartModeChange}
              lang={lang}
              t={t}
            />

            {state.ddEnabled && (
              <div className="grid gap-3 rounded-xl border border-border/60 bg-background/70 p-4">
                <div className="text-sm font-semibold">
                  {state.ddMode === "single"
                    ? t("ddTitleSingle")
                    : state.ddMode === "multi"
                    ? t("ddTitleMulti")
                    : t("ddTitleRandom")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {state.ddMode === "single"
                    ? t("ddHintSingle")
                    : state.ddMode === "multi"
                    ? t("ddHintMulti")
                    : t("ddHintRandom")}
                </div>
                {!ddResult.ok ? (
                  <div className="text-sm text-muted-foreground">{ddResult.error || "-"}</div>
                ) : ddResult.mode === "single" ? (
                  <div className="table-scroll">
                    <SingleDrawdownTable data={ddResult} lang={lang} t={t} />
                  </div>
                ) : ddResult.mode === "multi" ? (
                  <MultiSummaryTable data={ddResult} lang={lang} t={t} />
                ) : ddResult.mode === "random" ? (
                  <RandomSummaryTable data={ddResult} lang={lang} t={t} />
                ) : null}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
            {(baseResult as { error?: string }).error || (lang === "zh" ? "无法计算。" : "Cannot compute.")}
          </div>
        )}

        <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">{t("footTitle")}</div>
          <div className="mt-2 grid gap-1">
            <div>{t("footLine1")}</div>
            <div>{t("footLine2")}</div>
          </div>
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value="assumptions">
            <AccordionTrigger>{t("assumeTitle")}</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-2 text-xs text-muted-foreground">
                <div>{t("assumeItem1")}</div>
                <div>{t("assumeItem2")}</div>
                <div>{t("assumeItem3")}</div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
