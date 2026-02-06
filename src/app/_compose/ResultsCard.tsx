import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { CalendarGuide } from "@/app/_components/CalendarGuide";
import { ChartPanel } from "@/app/_components/ChartPanel";
import { ExportActions } from "@/app/_components/ExportActions";
import { GoalPlanner } from "@/app/_components/GoalPlanner";
import { JsonInspector } from "@/app/_components/JsonInspector";
import { ScenarioCalendar, type CalendarEventInput } from "@/app/_components/ScenarioCalendar";
import { MultiSummaryTable, RandomSummaryTable, SingleDrawdownTable } from "@/app/_components/ResultTables";
import { SensitivityTable, type SensitivityRow } from "@/app/_components/SensitivityTable";
import { SnapshotCompare } from "@/app/_components/SnapshotCompare";
import { convertByCurrency, fmtMoney, fmtPct } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ResultsCard({
  t,
  lang,
  state,
  calendars,
  baseResult,
  months,
  annualizedHint,
  summaryText,
  chartData,
  snapshotChartData,
  chartMode,
  onChartModeChange,
  ddResult,
  onExportCsv,
  onExportPng,
  onExportPdf,
  snapshotMetrics,
  currentMetrics,
  snapshots,
  selectedSnapshotId,
  onSelectSnapshot,
  onCaptureSnapshot,
  onClearSnapshot,
  chartRef,
  calendarEvents,
  calendarInitialDate,
  jsonPanels,
  sensitivityRows,
}: any) {
  return (
    <Card className="float-in-delay overflow-hidden border-white/40 bg-gradient-to-br from-primary/12 via-background/80 to-accent/30 shadow-[0_18px_48px_rgba(12,20,34,0.12)] dark:border-white/10">
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
            <ExportActions lang={lang} onCsv={onExportCsv} onPng={onExportPng} onPdf={onExportPdf} />
            <SnapshotCompare
              lang={lang}
              currency={state.currency}
              current={currentMetrics}
              snapshot={snapshotMetrics}
              snapshots={snapshots}
              selectedId={selectedSnapshotId}
              onSelect={onSelectSnapshot}
              onCapture={onCaptureSnapshot}
              onClear={onClearSnapshot}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                <div className="text-xs uppercase text-muted-foreground">{t("kpiFinal")}</div>
                <div className="mt-2 text-2xl font-semibold">{fmtMoney(lang, state.currency, baseResult.base.balance)}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {(() => {
                    const converted = convertByCurrency(baseResult.base.balance, state.currency, state.fxRate);
                    return fmtMoney(lang, converted.secondaryCurrency, converted.secondary);
                  })()}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{t("kpiFinalHint")}</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                <div className="text-xs uppercase text-muted-foreground">{t("kpiProfit")}</div>
                <div
                  className={`mt-2 text-2xl font-semibold ${
                    baseResult.base.profit >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {fmtMoney(lang, state.currency, baseResult.base.profit)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {(() => {
                    const converted = convertByCurrency(baseResult.base.profit, state.currency, state.fxRate);
                    return fmtMoney(lang, converted.secondaryCurrency, converted.secondary);
                  })()}
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
              snapshotData={snapshotChartData}
              chartMode={chartMode}
              onChangeMode={onChartModeChange}
              lang={lang}
              t={t}
              currency={state.currency}
              chartRef={chartRef}
            />

            <div className="rounded-xl border border-border/60 bg-background/70 p-4">
              <div className="text-xs uppercase text-muted-foreground">{t("insightTitle")}</div>
              <Tabs defaultValue="calendar" className="mt-3">
                <TabsList className="flex flex-wrap">
                  <TabsTrigger value="calendar">{t("insightCalendarTab")}</TabsTrigger>
                  {state.devMode ? <TabsTrigger value="data">{t("insightDataTab")}</TabsTrigger> : null}
                </TabsList>
                <TabsContent value="calendar" className="mt-3">
                  <ScenarioCalendar
                    title={t("insightCalendarTitle")}
                    subtitle={t("insightCalendarSub")}
                    lang={lang}
                    events={calendarEvents as CalendarEventInput[]}
                    initialDate={calendarInitialDate}
                    emptyText={t("insightCalendarEmpty")}
                  />
                </TabsContent>
                {state.devMode ? (
                  <TabsContent value="data" className="mt-3">
                    <JsonInspector title={t("insightDataTitle")} theme={state.theme} panels={jsonPanels} />
                  </TabsContent>
                ) : null}
              </Tabs>
            </div>

            <GoalPlanner
              lang={lang}
              currency={state.currency}
              simMode={state.simMode}
              mode={state.mode}
              principal={state.principal}
              months={months}
              monthlyRatePct={state.monthlyRate}
            />

            <SensitivityTable lang={lang} currency={state.currency} rows={sensitivityRows as SensitivityRow[]} />

            {state.uiMode === "pro" && state.ddEnabled && (
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
                    <SingleDrawdownTable data={ddResult} lang={lang} t={t} currency={state.currency} />
                  </div>
                ) : ddResult.mode === "multi" ? (
                  <MultiSummaryTable data={ddResult} lang={lang} t={t} currency={state.currency} />
                ) : ddResult.mode === "random" ? (
                  <RandomSummaryTable data={ddResult} lang={lang} t={t} currency={state.currency} />
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
