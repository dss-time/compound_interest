import { RefreshCw, Share2, Copy } from "lucide-react";

import { PRESETS } from "@/lib/presets";
import { AppState, Market, RateMode, DurationUnit, CalcMode, DdMode, RandMethod, Scenario } from "@/lib/app-state";
import { ValidationErrors } from "@/app/_rules/schema";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { Field } from "@/app/_components/Field";
import { QuickStart } from "@/app/_components/QuickStart";
import { ReadinessPanel, type ReadinessItem } from "@/app/_components/ReadinessPanel";
import { ScenarioPanel } from "@/app/_components/ScenarioPanel";
import { DetailsTable } from "@/app/_components/ResultTables";

export function ParamsCard({
  t,
  state,
  setState,
  presetId,
  setPresetId,
  saveStatus,
  applyPreset,
  applyQuickPreset,
  onCalendarImport,
  calendarStatus,
  calendarBanner,
  resetToDemo,
  focusResults,
  handleCopy,
  handleShare,
  copyLabel,
  shareLabel,
  readinessTitle,
  readinessSubtitle,
  readinessSummary,
  readinessPrimaryAction,
  readinessItems,
  scenarios,
  baseResult,
  onSaveScenario,
  onRemoveScenario,
  validationErrors,
}: {
  t: any;
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
  presetId: string;
  setPresetId: (id: string) => void;
  saveStatus: string;
  applyPreset: () => void;
  applyQuickPreset: (preset: (typeof PRESETS)[number]) => void;
  onCalendarImport: (file?: File) => void;
  calendarStatus: string;
  calendarBanner: string;
  resetToDemo: () => void;
  focusResults: () => void;
  handleCopy: () => void;
  handleShare: () => void;
  copyLabel: string | null;
  shareLabel: string | null;
  readinessTitle: string;
  readinessSubtitle: string;
  readinessSummary: string;
  readinessPrimaryAction: string;
  readinessItems: ReadinessItem[];
  scenarios: Scenario[];
  baseResult: any;
  onSaveScenario: () => void;
  onRemoveScenario: (id: string) => void;
  validationErrors: ValidationErrors;
}) {
  const err = (key: keyof ValidationErrors) => {
    const code = validationErrors[key];
    if (!code) return "";
    if (code === "mustBeNumber") return state.lang === "zh" ? "请输入数字" : "Must be a number";
    if (code === "tooSmall") return state.lang === "zh" ? "数值过小" : "Value is too small";
    if (code === "tooLarge") return state.lang === "zh" ? "数值过大" : "Value is too large";
    if (code === "invalidDdList") return state.lang === "zh" ? "回撤列表格式错误，例如 5,10,20" : "Invalid drawdown list, e.g. 5,10,20";
    if (code === "invalidDdPool") return state.lang === "zh" ? "回撤幅度池格式错误，例如 5,10,20" : "Invalid drawdown pool, e.g. 5,10,20";
    if (code === "invalidDdSeq") return state.lang === "zh" ? "回撤序列格式错误，例如 10@6,20@18" : "Invalid drawdown sequence, e.g. 10@6,20@18";
    return code;
  };
  const isPro = state.uiMode === "pro";
  const modeLabel = state.lang === "zh" ? "视图模式" : "View Mode";
  const modeBasic = state.lang === "zh" ? "基础版" : "Basic";
  const modePro = state.lang === "zh" ? "高级版" : "Advanced";
  const devLabel = state.lang === "zh" ? "高级数据视图" : "Advanced Data View";
  const studioSub =
    state.lang === "zh"
      ? "把输入、校验与分享动作整理成同一套客户可读的操作面板。"
      : "Organize inputs, validation, and sharing into a cleaner client-facing workspace.";
  const simSectionSub =
    state.lang === "zh"
      ? "先定义收益滚动框架，再决定是否需要交易日与市场日历。"
      : "Define the accrual model first, then decide whether the scenario needs trading-day precision.";
  const capitalSectionTitle = state.lang === "zh" ? "资金与周期" : "Capital and Horizon";
  const capitalSectionSub =
    state.lang === "zh"
      ? "这一组决定了客户最容易理解的三件事：本金、周期、收益滚动方式。"
      : "This block controls the three inputs clients understand fastest: principal, horizon, and accrual logic.";
  const displaySectionTitle = state.lang === "zh" ? "展示与换算" : "Display and Conversion";
  const displaySectionSub =
    state.lang === "zh"
      ? "处理展示币种、年化显示和快捷预设，让结果更容易对外沟通。"
      : "Handle display currency, annualized output, and presets so results are easier to communicate.";
  const proSectionSub =
    state.lang === "zh"
      ? "当你需要做压力测试和更严谨的客户演示时，再展开高级风控。"
      : "Open advanced risk controls only when you need stress testing and more rigorous client presentations.";
  const stepLabel = state.lang === "zh" ? "步骤" : "Step";
  const flowLabel = state.lang === "zh" ? "推荐操作流" : "Suggested Flow";
  const flowSub =
    state.lang === "zh"
      ? "先设定模拟逻辑，再补资金与周期，最后按需要展开展示、分享和高级风控。"
      : "Set the simulation logic first, then capital and horizon, and open presentation or risk controls only when needed.";
  const numberLocale = state.lang === "zh" ? "zh-CN" : "en-US";
  const formatWhole = (value: number) =>
    new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);
  const durationSummary =
    state.durationUnit === "years"
      ? state.lang === "zh"
        ? `${state.duration} 年`
        : `${state.duration} yr`
      : state.lang === "zh"
      ? `${state.duration} 个月`
      : `${state.duration} mo`;
  const activePreset = PRESETS.find((preset) => preset.id === presetId);
  const simSummary =
    state.simMode === "monthly"
      ? state.lang === "zh"
        ? `按月滚动 · 月收益 ${state.monthlyRate}%`
        : `Monthly accrual · ${state.monthlyRate}% / month`
      : state.lang === "zh"
      ? `${state.market === "CN" ? "A 股" : "美股"}交易日 · ${state.startDate || "默认今天"} · ${
          state.rateMode === "daily" ? `${state.dailyRate}% / 日` : `${state.annualRate}% / 年`
        }`
      : `${state.market === "CN" ? "CN" : "US"} trading days · ${state.startDate || "today"} · ${
          state.rateMode === "daily" ? `${state.dailyRate}% / day` : `${state.annualRate}% / year`
        }`;
  const capitalSummary =
    state.lang === "zh"
      ? `${formatWhole(state.principal)} ${state.currency} · ${durationSummary} · ${
          state.mode === "compound" ? "复利滚动" : "单利滚动"
        }`
      : `${formatWhole(state.principal)} ${state.currency} · ${durationSummary} · ${
          state.mode === "compound" ? "Compound" : "Simple"
        }`;
  const displaySummary =
    state.lang === "zh"
      ? `${state.currency} 展示 · ${state.showAnnualized ? "显示年化" : "隐藏年化"} · ${
          activePreset ? (activePreset.labelZh || activePreset.label) : "未选预设"
        }`
      : `${state.currency} display · ${state.showAnnualized ? "Annualized on" : "Annualized off"} · ${
          activePreset ? (activePreset.labelEn || activePreset.label) : "No preset"
        }`;
  const actionSummary =
    state.lang === "zh"
      ? `${copyLabel ? "复制已完成" : "可复制结果"} · ${shareLabel ? "链接已复制" : "可生成分享链接"}`
      : `${copyLabel ? "Copy ready" : "Copy result text"} · ${shareLabel ? "Link copied" : "Shareable link available"}`;
  const riskSummary =
    !isPro
      ? state.lang === "zh"
        ? "基础版已隐藏"
        : "Hidden in basic mode"
      : !state.ddEnabled
      ? state.lang === "zh"
        ? "默认关闭，按需展开"
        : "Off by default, open when needed"
      : state.lang === "zh"
      ? `已启用 · ${state.ddMode === "single" ? "单次" : state.ddMode === "multi" ? "多次" : "随机"}回撤`
      : `Enabled · ${state.ddMode === "single" ? "Single" : state.ddMode === "multi" ? "Multi" : "Random"} drawdown`;
  const librarySummary =
    state.lang === "zh"
      ? `已保存 ${scenarios.length} 个方案 · ${baseResult.ok ? "可展开查看明细表" : "需先得到有效结果"}`
      : `${scenarios.length} scenarios saved · ${baseResult.ok ? "detail table available" : "valid result required"}`;
  const primaryRateLabel =
    state.simMode === "monthly"
      ? t("lblMonthlyRate")
      : state.rateMode === "daily"
      ? t("lblDailyRate")
      : t("lblAnnualRate");
  const primaryRateValue =
    state.simMode === "monthly"
      ? `${state.monthlyRate}%`
      : state.rateMode === "daily"
      ? `${state.dailyRate}%`
      : `${state.annualRate}%`;
  const liveResultLabel = state.lang === "zh" ? "查看收益结果" : "View Returns";
  const liveResultSub = state.lang === "zh" ? "结果会随输入实时更新" : "Results update live as you edit";
  const calcStripTitle = state.lang === "zh" ? "投资收益计算" : "Return Calculator";

  return (
    <Card className="params-card dr-card float-in overflow-hidden rounded-[28px] backdrop-blur-xl">
      <CardHeader className="gap-4 border-b border-border/50 bg-gradient-to-r from-background/20 to-transparent">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-[1.45rem]">{t("secParams")}</CardTitle>
            <CardDescription className="mt-2 max-w-2xl leading-relaxed">{studioSub}</CardDescription>
          </div>
          <Badge variant="secondary" className="rounded-full border border-border/50 bg-background/70 px-3 py-1.5">
            {t("pillInputUpdate")}
          </Badge>
        </div>
        {saveStatus ? <CardDescription>{saveStatus}</CardDescription> : null}
      </CardHeader>
      <CardContent className="grid min-w-0 gap-6">
        <div className="studio-top-grid">
          <div className="surface-shell">
            <div className="surface-head">
              <div>
                <div className="text-base font-semibold text-foreground">{modeLabel}</div>
                <div className="mt-1 surface-sub">{proSectionSub}</div>
              </div>
            </div>
            <Tabs value={state.uiMode} onValueChange={(value) => setState((s) => ({ ...s, uiMode: value as "basic" | "pro" }))}>
              <TabsList className="grid h-auto w-full grid-cols-2 gap-1">
                <TabsTrigger value="basic" className="h-auto whitespace-normal px-2 py-2 text-xs leading-tight md:text-sm">
                  {modeBasic}
                </TabsTrigger>
                <TabsTrigger value="pro" className="h-auto whitespace-normal px-2 py-2 text-xs leading-tight md:text-sm">
                  {modePro}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {isPro ? (
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
                <span className="text-sm">{devLabel}</span>
                <Switch checked={state.devMode} onCheckedChange={(checked) => setState((s) => ({ ...s, devMode: checked }))} />
              </div>
            ) : null}
          </div>

          <QuickStart presets={PRESETS} onApply={applyQuickPreset} t={t} lang={state.lang} />
        </div>

        <ReadinessPanel
          title={readinessTitle}
          subtitle={readinessSubtitle}
          summary={readinessSummary}
          primaryAction={readinessPrimaryAction}
          items={readinessItems}
        />

        <div className="finance-calc-strip">
          <div className="finance-strip-head">
            <div className="finance-section-title">{calcStripTitle}</div>
            <div className="finance-section-line" />
          </div>
          <div className="finance-strip-grid">
            <div className="finance-strip-field">
              <div className="finance-strip-label">{t("lblPrincipal")}</div>
              <div className="finance-strip-value">{formatWhole(state.principal)} {state.currency}</div>
            </div>
            <div className="finance-strip-field">
              <div className="finance-strip-label">{t("lblDuration")}</div>
              <div className="finance-strip-value">{durationSummary}</div>
            </div>
            <div className="finance-strip-field">
              <div className="finance-strip-label">{primaryRateLabel}</div>
              <div className="finance-strip-value">{primaryRateValue}</div>
            </div>
            <div className="finance-strip-cta">
              <Button onClick={focusResults} className="finance-cta-button w-full">
                {liveResultLabel}
              </Button>
              <div className="finance-strip-note">{liveResultSub}</div>
            </div>
          </div>
        </div>

        <div className="surface-shell">
          <div className="surface-head">
            <div>
              <div className="text-base font-semibold text-foreground">{flowLabel}</div>
              <div className="mt-1 surface-sub">{flowSub}</div>
            </div>
            <Badge variant="secondary" className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5">
              {state.lang === "zh" ? "渐进披露" : "Progressive Disclosure"}
            </Badge>
          </div>

          <Accordion type="multiple" defaultValue={["step-sim", "step-capital"]} className="step-accordion">
            <AccordionItem value="step-sim" className="step-shell">
              <AccordionTrigger className="step-trigger hover:no-underline">
                <div className="step-copy">
                  <div className="step-eyebrow">{stepLabel} 1</div>
                  <div className="step-title-row">
                    <div className="step-title">{t("lblSimMode")}</div>
                    <Badge variant="outline" className="step-badge">
                      {state.simMode === "monthly" ? t("optSimMonthly") : t("optSimTradingDays")}
                    </Badge>
                  </div>
                  <div className="step-subtitle">{simSectionSub}</div>
                </div>
                <div className="step-summary">{simSummary}</div>
              </AccordionTrigger>
              <AccordionContent className="step-content">
                <div className="grid gap-4">
                  <Field label={t("lblSimMode")} help={t("helpSimMode")}>
                    <Tabs value={state.simMode} onValueChange={(value) => setState((s) => ({ ...s, simMode: value as any }))}>
                      <TabsList className="grid h-auto w-full grid-cols-2 gap-1">
                        <TabsTrigger value="monthly" className="h-auto whitespace-normal px-2 py-2 text-xs leading-tight md:text-sm">
                          {t("optSimMonthly")}
                        </TabsTrigger>
                        <TabsTrigger value="tradingDays" className="h-auto whitespace-normal px-2 py-2 text-xs leading-tight md:text-sm">
                          {t("optSimTradingDays")}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </Field>

                  {state.simMode === "tradingDays" ? (
                    <div className="grid gap-4">
                      <Field label={t("lblMarket")} help={t("helpMarket")}>
                        <Select value={state.market} onValueChange={(value) => setState((s) => ({ ...s, market: value as Market }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CN">{t("optMarketCN")}</SelectItem>
                            <SelectItem value="US">{t("optMarketUS")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label={t("lblStartDate")} help={t("helpStartDate")}>
                          <Input
                            type="date"
                            value={state.startDate}
                            onChange={(e) => setState((s) => ({ ...s, startDate: e.target.value }))}
                          />
                        </Field>
                        <Field label={t("lblRateMode")} help={t("helpRateMode")}>
                          <Select value={state.rateMode} onValueChange={(value) => setState((s) => ({ ...s, rateMode: value as RateMode }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">{t("optRateDaily")}</SelectItem>
                              <SelectItem value="annual">{t("optRateAnnual")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>

                      {state.rateMode === "daily" ? (
                        <Field label={t("lblDailyRate")} help={t("helpDailyRate")} error={err("dailyRate")}>
                          <Input
                            type="number"
                            step="0.0001"
                            value={state.dailyRate}
                            onChange={(e) => setState((s) => ({ ...s, dailyRate: Number(e.target.value) }))}
                          />
                        </Field>
                      ) : (
                        <Field label={t("lblAnnualRate")} help={t("helpAnnualRate")} error={err("annualRate")}>
                          <Input
                            type="number"
                            step="0.01"
                            value={state.annualRate}
                            onChange={(e) => setState((s) => ({ ...s, annualRate: Number(e.target.value) }))}
                          />
                        </Field>
                      )}

                      <Field label={t("lblCalendarImport")} help={t("helpCalendarImport")}>
                        <Input type="file" accept="application/json" onChange={(e) => onCalendarImport(e.target.files?.[0])} />
                      </Field>

                      <div className="dr-panel rounded-2xl p-3 text-xs text-muted-foreground">{calendarStatus}</div>
                      {calendarBanner ? (
                        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                          {calendarBanner}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step-capital" className="step-shell">
              <AccordionTrigger className="step-trigger hover:no-underline">
                <div className="step-copy">
                  <div className="step-eyebrow">{stepLabel} 2</div>
                  <div className="step-title-row">
                    <div className="step-title">{capitalSectionTitle}</div>
                    <Badge variant="outline" className="step-badge">
                      {state.mode === "compound" ? t("optCompound") : t("optSimple")}
                    </Badge>
                  </div>
                  <div className="step-subtitle">{capitalSectionSub}</div>
                </div>
                <div className="step-summary">{capitalSummary}</div>
              </AccordionTrigger>
              <AccordionContent className="step-content">
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label={t("lblPrincipal")} help={t("helpPrincipal")} error={err("principal")}>
                      <Input
                        type="number"
                        min="0"
                        step="100"
                        value={state.principal}
                        onChange={(e) => setState((s) => ({ ...s, principal: Number(e.target.value) }))}
                      />
                    </Field>

                    {state.simMode === "monthly" ? (
                      <Field label={t("lblMonthlyRate")} help={t("helpMonthlyRate")} error={err("monthlyRate")}>
                        <Input
                          type="number"
                          step="0.01"
                          value={state.monthlyRate}
                          onChange={(e) => setState((s) => ({ ...s, monthlyRate: Number(e.target.value) }))}
                        />
                      </Field>
                    ) : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label={t("lblDuration")} help={t("helpDuration")} error={err("duration")}>
                      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_130px]">
                        <Input
                          id="duration"
                          type="number"
                          min="0"
                          step="1"
                          value={state.duration}
                          onChange={(e) => setState((s) => ({ ...s, duration: Number(e.target.value) }))}
                        />
                        <Select value={state.durationUnit} onValueChange={(value) => setState((s) => ({ ...s, durationUnit: value as DurationUnit }))}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="months">{t("optUnitMonths")}</SelectItem>
                            <SelectItem value="years">{t("optUnitYears")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </Field>

                    <Field label={t("lblCalcMode")} help={t("helpCalcMode")}>
                      <Select value={state.mode} onValueChange={(value) => setState((s) => ({ ...s, mode: value as CalcMode }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compound">{t("optCompound")}</SelectItem>
                          <SelectItem value="simple">{t("optSimple")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <Field label={state.lang === "zh" ? "币种" : "Currency"}>
                      <Select value={state.currency} onValueChange={(value) => setState((s) => ({ ...s, currency: value as "CNY" | "USD" }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CNY">CNY</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label={state.lang === "zh" ? "汇率假设 (USD/CNY)" : "FX Assumption (USD/CNY)"} error={err("fxRate")}>
                      <Input
                        type="number"
                        step="0.0001"
                        value={state.fxRate}
                        onChange={(e) => setState((s) => ({ ...s, fxRate: Number(e.target.value) }))}
                      />
                    </Field>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step-display" className="step-shell">
              <AccordionTrigger className="step-trigger hover:no-underline">
                <div className="step-copy">
                  <div className="step-eyebrow">{stepLabel} 3</div>
                  <div className="step-title-row">
                    <div className="step-title">{displaySectionTitle}</div>
                    <Badge variant="outline" className="step-badge">
                      {state.showAnnualized ? t("lblShowAnnual") : t("presetLabel")}
                    </Badge>
                  </div>
                  <div className="step-subtitle">{displaySectionSub}</div>
                </div>
                <div className="step-summary">{`${displaySummary} · ${actionSummary}`}</div>
              </AccordionTrigger>
              <AccordionContent className="step-content">
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label={t("lblShowAnnual")} help={t("helpShowAnnual")}>
                      <div className="dr-panel flex items-center justify-between rounded-2xl px-3 py-3">
                        <span className="pr-2 text-sm leading-snug">{t("txtShowAnnual")}</span>
                        <Switch checked={state.showAnnualized} onCheckedChange={(checked) => setState((s) => ({ ...s, showAnnualized: checked }))} />
                      </div>
                    </Field>

                    <Field label={t("presetLabel")}>
                      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <Select value={presetId} onValueChange={setPresetId}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRESETS.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {state.lang === "en" ? p.labelEn || p.label : p.labelZh || p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="secondary" className="whitespace-nowrap px-3" onClick={applyPreset}>
                          {t("presetApply")}
                        </Button>
                      </div>
                    </Field>
                  </div>

                  <div className="step-actions">
                    <Button variant="secondary" onClick={resetToDemo}>
                      <RefreshCw className="h-4 w-4" />
                      {t("btnReset")}
                    </Button>
                    <Button variant="outline" onClick={handleCopy}>
                      <Copy className="h-4 w-4" />
                      {copyLabel || t("btnCopy")}
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                      {shareLabel || t("btnShare")}
                    </Button>
                  </div>

                  <div
                    className={`text-xs ${
                      state.simMode === "tradingDays" ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground"
                    }`}
                  >
                    {state.simMode === "tradingDays" ? t("btnShareTradeHint") : t("btnShareHint")}
                  </div>
                  {saveStatus ? <div className="text-xs text-muted-foreground">{saveStatus}</div> : null}
                </div>
              </AccordionContent>
            </AccordionItem>

            {isPro ? (
              <AccordionItem value="step-risk" className="step-shell">
                <AccordionTrigger className="step-trigger hover:no-underline">
                  <div className="step-copy">
                    <div className="step-eyebrow">{stepLabel} 4</div>
                    <div className="step-title-row">
                      <div className="step-title">{t("secDD")}</div>
                      <Badge variant="outline" className="step-badge">
                        {t("pillDD")}
                      </Badge>
                    </div>
                    <div className="step-subtitle">{proSectionSub}</div>
                  </div>
                  <div className="step-summary">{riskSummary}</div>
                </AccordionTrigger>
                <AccordionContent className="step-content">
                  <div className="grid gap-4">
                    <Field label={t("lblEnableDD")} help={t("helpEnableDD")}>
                      <div className="dr-panel flex items-center justify-between rounded-2xl px-3 py-3">
                        <span className="text-sm">{t("txtEnableDD")}</span>
                        <Switch checked={state.ddEnabled} onCheckedChange={(checked) => setState((s) => ({ ...s, ddEnabled: checked }))} />
                      </div>
                    </Field>

                    {state.ddEnabled ? (
                      <div className="grid gap-4">
                        <Field label={t("lblDDMode")} help={t("helpDDMode")}>
                          <Select value={state.ddMode} onValueChange={(value) => setState((s) => ({ ...s, ddMode: value as DdMode }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">{t("optDDSingle")}</SelectItem>
                              <SelectItem value="multi">{t("optDDMulti")}</SelectItem>
                              <SelectItem value="random">{t("optDDRandom")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>

                        {state.ddMode === "single" ? (
                          <>
                            <Field label={t("lblDDList")} help={t("helpDDList")}>
                              <Input type="text" value={state.ddList} onChange={(e) => setState((s) => ({ ...s, ddList: e.target.value }))} />
                            </Field>
                            {err("ddList") ? <div className="text-xs text-rose-500">{err("ddList")}</div> : null}

                            <Field label={t("lblDDWhen")} help={t("helpDDWhen")}>
                              <Select value={state.ddStrategy} onValueChange={(value) => setState((s) => ({ ...s, ddStrategy: value as "worst" | "fixed" }))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="worst">{t("optDDWorst")}</SelectItem>
                                  <SelectItem value="fixed">{t("optDDFixed")}</SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>

                            {state.ddStrategy === "fixed" ? (
                              <>
                                <Field label={t("lblDDMonth")} help={t("helpDDMonth")}>
                                  <Input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={state.ddMonth}
                                    onChange={(e) => setState((s) => ({ ...s, ddMonth: Number(e.target.value) }))}
                                  />
                                </Field>
                                {err("ddMonth") ? <div className="text-xs text-rose-500">{err("ddMonth")}</div> : null}
                              </>
                            ) : null}
                          </>
                        ) : null}

                        {state.ddMode === "multi" ? (
                          <>
                            <Field label={t("lblDDSeq")} help={t("helpDDSeq")}>
                              <Input type="text" value={state.ddSeq} onChange={(e) => setState((s) => ({ ...s, ddSeq: e.target.value }))} />
                            </Field>
                            {err("ddSeq") ? <div className="text-xs text-rose-500">{err("ddSeq")}</div> : null}
                          </>
                        ) : null}

                        {state.ddMode === "random" ? (
                          <>
                            <Field label={t("lblDDPool")} help={t("helpDDPool")}>
                              <Input type="text" value={state.ddPool} onChange={(e) => setState((s) => ({ ...s, ddPool: e.target.value }))} />
                            </Field>
                            {err("ddPool") ? <div className="text-xs text-rose-500">{err("ddPool")}</div> : null}

                            <Field label={t("lblRandMethod")} help={t("helpRandMethod")}>
                              <Select value={state.randMethod} onValueChange={(value) => setState((s) => ({ ...s, randMethod: value as RandMethod }))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="prob">{t("optRandProb")}</SelectItem>
                                  <SelectItem value="count">{t("optRandCount")}</SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>

                            {state.randMethod === "prob" ? (
                              <Field label={t("lblRandProb")} help={t("helpRandProb")} error={err("randProb")}>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={state.randProb}
                                  onChange={(e) => setState((s) => ({ ...s, randProb: Number(e.target.value) }))}
                                />
                              </Field>
                            ) : (
                              <Field label={t("lblRandCount")} help={t("helpRandCount")} error={err("randCount")}>
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={state.randCount}
                                  onChange={(e) => setState((s) => ({ ...s, randCount: Number(e.target.value) }))}
                                />
                              </Field>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                              <Field label={t("lblSimRuns")} help={t("helpSimRuns")}>
                                <Input
                                  type="number"
                                  min="100"
                                  step="100"
                                  value={state.simRuns}
                                  onChange={(e) => setState((s) => ({ ...s, simRuns: Number(e.target.value) }))}
                                />
                              </Field>
                              {err("simRuns") ? <div className="text-xs text-rose-500">{err("simRuns")}</div> : null}
                              <Field label={t("lblSimSeed")} help={t("helpSimSeed")}>
                                <Input type="text" value={state.simSeed} onChange={(e) => setState((s) => ({ ...s, simSeed: e.target.value }))} />
                              </Field>
                            </div>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ) : null}

            {isPro ? (
              <AccordionItem value="step-library" className="step-shell">
                <AccordionTrigger className="step-trigger hover:no-underline">
                  <div className="step-copy">
                    <div className="step-eyebrow">{stepLabel} 5</div>
                    <div className="step-title-row">
                      <div className="step-title">{state.lang === "zh" ? "方案与明细" : "Scenarios and Detail"}</div>
                      <Badge variant="outline" className="step-badge">
                        {state.lang === "zh" ? "高级工具" : "Advanced Tools"}
                      </Badge>
                    </div>
                    <div className="step-subtitle">
                      {state.lang === "zh"
                        ? "把方案保存、细表核对和快捷键提示集中在最后一步。"
                        : "Keep saved scenarios, detailed tables, and keyboard tips in the final step."}
                    </div>
                  </div>
                  <div className="step-summary">{librarySummary}</div>
                </AccordionTrigger>
                <AccordionContent className="step-content">
                  <div className="grid gap-4">
                    <div className="rounded-[24px] border border-border/60 bg-background/70 p-4 text-xs text-muted-foreground">
                      <div className="font-medium text-foreground">{t("kbTitle")}</div>
                      <div className="mt-2 grid gap-1">
                        <div>{t("kbAltL")}</div>
                        <div>{t("kbAltT")}</div>
                        <div>{t("kbAltR")}</div>
                        <div>{t("kbAltC")}</div>
                        <div>{t("kbAltS")}</div>
                      </div>
                    </div>

                    <ScenarioPanel
                      scenarios={scenarios}
                      baseResult={baseResult}
                      lang={state.lang}
                      currency={state.currency}
                      t={t}
                      onSave={onSaveScenario}
                      onRemove={onRemoveScenario}
                    />

                    <Accordion type="single" collapsible>
                      <AccordionItem value="details">
                        <AccordionTrigger>{t("detailsSummary")}</AccordionTrigger>
                        <AccordionContent>
                          <div className="table-scroll">
                            <DetailsTable baseResult={baseResult} lang={state.lang} t={t} currency={state.currency} />
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">{t("detailsHint")}</div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ) : null}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
