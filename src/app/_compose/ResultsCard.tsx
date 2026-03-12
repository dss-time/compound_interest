import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  AlertTriangle,
  ArrowRightLeft,
  BadgePercent,
  CalendarDays,
  Calculator,
  LineChart,
  PieChart,
  Sparkles,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { CalendarGuide } from "@/app/_components/CalendarGuide";
import { ChartPanel } from "@/app/_components/ChartPanel";
import { ExportActions } from "@/app/_components/ExportActions";
import { GoalPlanner } from "@/app/_components/GoalPlanner";
import { InvestmentCompare } from "@/app/_components/InvestmentCompare";
import { JsonInspector } from "@/app/_components/JsonInspector";
import { ScenarioCalendar, type CalendarEventInput } from "@/app/_components/ScenarioCalendar";
import { MultiSummaryTable, RandomSummaryTable, SingleDrawdownTable } from "@/app/_components/ResultTables";
import { SensitivityTable, type SensitivityRow } from "@/app/_components/SensitivityTable";
import { SnapshotCompare } from "@/app/_components/SnapshotCompare";
import { StrategyBrief } from "@/app/_components/StrategyBrief";
import { convertByCurrency, fmtMoney, fmtPct } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ResultsCard({
  t,
  lang,
  state,
  calendars,
  baseResult,
  strategyBriefTitle,
  strategyBriefSubtitle,
  strategyBriefItems,
  blockingActions,
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
  compareSectionRef,
}: any) {
  const resultStudioSub =
    lang === "zh"
      ? "先展示能让客户一眼看懂的结论，再展开图表、时间轴和压力测试。"
      : "Lead with the conclusion clients can grasp at a glance, then open up charts, timeline, and stress views.";
  const resultSectionTitle = lang === "zh" ? "计算结果" : "Calculated Result";
  const trendSectionTitle = lang === "zh" ? "收益增长趋势" : "Growth Trend";
  const compareSectionTitle = lang === "zh" ? "投资对比" : "Investment Compare";
  const detailSectionTitle = lang === "zh" ? "进阶分析" : "Advanced Analysis";

  return (
    <Card className="results-card dr-card float-in-delay overflow-hidden rounded-[28px] bg-gradient-to-br from-primary/12 via-background/84 to-accent/34">
      <CardHeader className="gap-4 border-b border-border/50 bg-gradient-to-r from-background/20 to-transparent">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-[1.45rem]">{t("secResult")}</CardTitle>
            <CardDescription className="mt-2 max-w-3xl leading-relaxed">
              {resultStudioSub}
            </CardDescription>
          </div>
          <Badge className="rounded-full border border-border/50 bg-background/70 px-3 py-1.5 text-foreground">{t("pillRealtime")}</Badge>
        </div>
        <CardDescription>
          {summaryText || (state.showAnnualized ? annualizedHint || t("annualHintMonthly") : t("kpiProfitHint"))}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <CalendarGuide
          show={state.simMode === "tradingDays" && !calendars.meta[state.market]?.count}
          t={t}
          marketLabel={state.market === "CN" ? t("optMarketCN") : t("optMarketUS")}
        />
        {baseResult.ok ? (
          <>
            <div className="finance-summary-banner">
              <div className="text-sm font-semibold text-foreground">{t("summaryTitle")}</div>
              <div className="finance-summary-copy">{summaryText}</div>
              <div className="finance-summary-sub">
                {state.showAnnualized ? annualizedHint || t("annualHintMonthly") : t("kpiProfitHint")}
              </div>
            </div>

            <SectionHeading title={resultSectionTitle} icon={Calculator} />

            <div className="finance-result-grid">
              <div className="finance-result-card finance-result-card-green">
                <div className="finance-result-head">
                  <span className="finance-result-icon">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="finance-result-top">{t("kpiProfit")}</div>
                    <div className="finance-result-note">{t("kpiProfitHint")}</div>
                  </div>
                </div>
                <div className="finance-result-value">{fmtMoney(lang, state.currency, baseResult.base.profit)}</div>
              </div>
              <div className="finance-result-card finance-result-card-orange">
                <div className="finance-result-head">
                  <span className="finance-result-icon">
                    <BadgePercent className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="finance-result-top">{state.showAnnualized ? t("kpiAnnualized") : t("kpiTotalReturn")}</div>
                    <div className="finance-result-note">
                      {state.showAnnualized ? annualizedHint : t("kpiTotalReturnHint")}
                    </div>
                  </div>
                </div>
                <div className="finance-result-value">
                  {state.showAnnualized ? fmtPct(baseResult.base.annualized) : fmtPct(baseResult.base.totalReturn)}
                </div>
              </div>
              <div className="finance-result-card finance-result-card-blue">
                <div className="finance-result-head">
                  <span className="finance-result-icon">
                    <Wallet className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="finance-result-top">{t("kpiFinal")}</div>
                    <div className="finance-result-note">{t("kpiFinalHint")}</div>
                  </div>
                </div>
                <div className="finance-result-value">{fmtMoney(lang, state.currency, baseResult.base.balance)}</div>
              </div>
              <div className="finance-side-insight">
                <div className="finance-result-head">
                  <span className="finance-result-icon finance-result-icon-neutral">
                    <ArrowRightLeft className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="finance-side-label">{lang === "zh" ? "辅助换算" : "Secondary View"}</div>
                    <div className="finance-side-note">
                      {lang === "zh"
                        ? "同步显示另一币种估算值，便于和客户沟通汇率影响。"
                        : "Shows the alternate currency estimate for client conversations about FX impact."}
                    </div>
                  </div>
                </div>
                <div className="finance-side-value">
                  {(() => {
                    const converted = convertByCurrency(baseResult.base.balance, state.currency, state.fxRate);
                    return fmtMoney(lang, converted.secondaryCurrency, converted.secondary);
                  })()}
                </div>
              </div>
            </div>

            <SectionHeading title={trendSectionTitle} icon={LineChart} />
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

            <div ref={compareSectionRef}>
              <SectionHeading title={compareSectionTitle} icon={PieChart} />
              <InvestmentCompare lang={lang} />
            </div>

            <SectionHeading title={detailSectionTitle} icon={Sparkles} />
            <div className="results-support-grid">
              <div className="results-support-card results-support-card-compact">
                <ExportActions lang={lang} onCsv={onExportCsv} onPng={onExportPng} onPdf={onExportPdf} />
              </div>
              <div className="results-support-card">
                <GoalPlanner
                  lang={lang}
                  currency={state.currency}
                  simMode={state.simMode}
                  mode={state.mode}
                  principal={state.principal}
                  months={months}
                  monthlyRatePct={state.monthlyRate}
                />
              </div>
              <div className="results-support-card results-support-card-wide">
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
              </div>
            </div>

            <StrategyBrief lang={lang} title={strategyBriefTitle} subtitle={strategyBriefSubtitle} items={strategyBriefItems} />

            <div className="dr-panel rounded-[24px] p-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-border/60 bg-background/70 text-primary">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div className="text-base font-semibold text-foreground">{t("insightTitle")}</div>
              </div>
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
                    theme={state.theme}
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

            <SensitivityTable lang={lang} currency={state.currency} rows={sensitivityRows as SensitivityRow[]} />

            {state.uiMode === "pro" && state.ddEnabled && (
              <div className="dr-panel grid gap-3 rounded-xl p-4">
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
          <div className="dr-panel rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full border border-destructive/30 bg-destructive/10 p-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-foreground">{t("invalidStateTitle")}</div>
                <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("invalidStateSub")}</div>
                <div className="mt-3 rounded-lg border border-destructive/20 bg-background/70 px-3 py-2 text-sm text-foreground">
                  {(baseResult as { error?: string }).error || (lang === "zh" ? "无法计算。" : "Cannot compute.")}
                </div>
                {blockingActions?.length ? (
                  <div className="mt-3">
                    <div className="text-xs font-medium text-muted-foreground">
                      {t("invalidStateActionTitle")}
                    </div>
                    <div className="mt-2 grid gap-2">
                      {blockingActions.map((action: string) => (
                        <div key={action} className="rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <div className="dr-panel rounded-xl p-4 text-xs text-muted-foreground">
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

function SectionHeading({ title, icon: Icon }: { title: string; icon?: LucideIcon }) {
  return (
    <div className="finance-section-head">
      {Icon ? (
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-border/60 bg-background/70 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      ) : null}
      <div className="finance-section-title">{title}</div>
      <div className="finance-section-line" />
    </div>
  );
}
