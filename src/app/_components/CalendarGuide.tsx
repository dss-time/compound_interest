import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function CalendarGuide({
  show,
  t,
  marketLabel,
}: {
  show: boolean;
  t: any;
  marketLabel: string;
}) {
  if (!show) return null;
  return (
    <div className="rounded-xl border border-destructive/35 bg-destructive/8 p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-foreground">{t("calendarGuideTitle")}</div>
          <div className="mt-2 text-xs leading-relaxed text-muted-foreground">{t("calendarGuideSub")}</div>
        </div>
        <div className="rounded-full border border-destructive/25 bg-background/70 px-3 py-1 text-[11px] font-medium text-destructive">
          {marketLabel}
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        {t("calendarGuideCurrentTpl", { market: marketLabel })}
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <div className="rounded-lg border border-border/60 bg-background/70 p-3 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">1. {t("calendarGuideStep1")}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/70 p-3 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">2. {t("calendarGuideStep2")}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/70 p-3 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">3. {t("calendarGuideStep3")}</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">{t("calendarGuideReadyHint")}</div>
      <Accordion type="single" collapsible>
        <AccordionItem value="calendarFormat">
          <AccordionTrigger className="text-foreground">{t("calendarGuideFormat")}</AccordionTrigger>
          <AccordionContent>
            <div className="rounded-md border border-destructive/30 bg-background/80 p-3 text-xs text-muted-foreground">
              <div className="mono">{t("calendarGuideExample")}</div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
