import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function CalendarGuide({ show, t }: { show: boolean; t: any }) {
  if (!show) return null;
  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
      <div className="text-sm font-semibold">{t("calendarGuideTitle")}</div>
      <div className="mt-2 text-xs">{t("calendarGuideSub")}</div>
      <div className="mt-3 grid gap-1 text-xs text-destructive/80">
        <div>1. {t("calendarGuideStep1")}</div>
        <div>2. {t("calendarGuideStep2")}</div>
        <div>3. {t("calendarGuideStep3")}</div>
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="calendarFormat">
          <AccordionTrigger className="text-destructive">{t("calendarGuideFormat")}</AccordionTrigger>
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
