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
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { Field } from "@/app/_components/Field";
import { QuickStart } from "@/app/_components/QuickStart";
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
  handleCopy,
  handleShare,
  copyLabel,
  shareLabel,
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
  handleCopy: () => void;
  handleShare: () => void;
  copyLabel: string | null;
  shareLabel: string | null;
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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{t("secParams")}</CardTitle>
          <Badge variant="secondary">{t("pillInputUpdate")}</Badge>
        </div>
        <CardDescription>{saveStatus || t("presetLabel")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <QuickStart presets={PRESETS} onApply={applyQuickPreset} t={t} />

        <div className="grid gap-4 rounded-xl border border-dashed border-border/70 bg-muted/40 p-4">
          <Field label={t("lblSimMode")} help={t("helpSimMode")}>
            <Tabs value={state.simMode} onValueChange={(value) => setState((s) => ({ ...s, simMode: value as any }))}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">{t("optSimMonthly")}</TabsTrigger>
                <TabsTrigger value="tradingDays">{t("optSimTradingDays")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </Field>

          {state.simMode === "tradingDays" && (
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

              <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
                {calendarStatus}
              </div>
              {calendarBanner ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                  {calendarBanner}
                </div>
              ) : null}
            </div>
          )}
        </div>

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

          {state.simMode === "monthly" && (
            <Field label={t("lblMonthlyRate")} help={t("helpMonthlyRate")} error={err("monthlyRate")}>
              <Input
                type="number"
                step="0.01"
                value={state.monthlyRate}
                onChange={(e) => setState((s) => ({ ...s, monthlyRate: Number(e.target.value) }))}
              />
            </Field>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("lblDuration")} help={t("helpDuration")} error={err("duration")}>
            <div className="grid grid-cols-[1fr_auto] gap-2">
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

        <div className="grid gap-4 md:grid-cols-2">
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
          <Field
            label={state.lang === "zh" ? "汇率假设 (USD/CNY)" : "FX Assumption (USD/CNY)"}
            error={err("fxRate")}
          >
            <Input
              type="number"
              step="0.0001"
              value={state.fxRate}
              onChange={(e) => setState((s) => ({ ...s, fxRate: Number(e.target.value) }))}
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("lblShowAnnual")} help={t("helpShowAnnual")}>
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2">
              <span className="text-sm">{t("txtShowAnnual")}</span>
              <Switch checked={state.showAnnualized} onCheckedChange={(checked) => setState((s) => ({ ...s, showAnnualized: checked }))} />
            </div>
          </Field>

          <Field label={t("presetLabel")}>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Select value={presetId} onValueChange={setPresetId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRESETS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="secondary" onClick={applyPreset}>
                {t("presetApply")}
              </Button>
            </div>
          </Field>
        </div>

        {saveStatus ? <div className="text-xs text-muted-foreground">{saveStatus}</div> : null}

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{t("secDD")}</div>
            <div className="text-sm text-muted-foreground">{t("pillDD")}</div>
          </div>
          <Badge variant="outline">{t("pillDD")}</Badge>
        </div>

        <Field label={t("lblEnableDD")} help={t("helpEnableDD")}>
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2">
            <span className="text-sm">{t("txtEnableDD")}</span>
            <Switch checked={state.ddEnabled} onCheckedChange={(checked) => setState((s) => ({ ...s, ddEnabled: checked }))} />
          </div>
        </Field>

        {state.ddEnabled && (
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

            {state.ddMode === "single" && (
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

                {state.ddStrategy === "fixed" && (
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
                )}
              </>
            )}

            {state.ddMode === "multi" && (
              <Field label={t("lblDDSeq")} help={t("helpDDSeq")}>
                <Input type="text" value={state.ddSeq} onChange={(e) => setState((s) => ({ ...s, ddSeq: e.target.value }))} />
              </Field>
            )}
            {state.ddMode === "multi" && err("ddSeq") ? <div className="text-xs text-rose-500">{err("ddSeq")}</div> : null}

            {state.ddMode === "random" && (
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
            )}
          </div>
        )}

        <Separator />

        <div className="flex flex-wrap gap-2">
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
        <div className="text-xs text-muted-foreground">{t("btnShareHint")}</div>

        <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-xs text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}
