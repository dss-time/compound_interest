"use client";

import { useMemo, useState } from "react";
import { DayFlowCalendar, ViewType, createAllDayEvent, createMonthView, useCalendarApp } from "@dayflow/core";
import { CalendarErrorBoundary } from "@/app/_components/CalendarErrorBoundary";
import { Button } from "@/components/ui/button";

export type CalendarEventInput = {
  id: string;
  title: string;
  start: Date;
  end?: Date;
};

export function ScenarioCalendar({
  title,
  subtitle,
  lang,
  events,
  initialDate,
  emptyText,
}: {
  title: string;
  subtitle?: string;
  lang: "zh" | "en";
  events: CalendarEventInput[];
  initialDate: Date;
  emptyText: string;
}) {
  const [calendarCollapsed, setCalendarCollapsed] = useState(false);
  const dayflowEvents = useMemo(
    () =>
      events.map((event) =>
        createAllDayEvent(event.id, event.title || "Event", event.start, {
          calendarId: "blue",
        })
      ),
    [events]
  );

  const calendar = useCalendarApp({
    views: [createMonthView()],
    events: dayflowEvents,
    defaultView: ViewType.MONTH,
    initialDate,
  });

  const timeline = useMemo(() => [...events].sort((a, b) => a.start.getTime() - b.start.getTime()), [events]);
  const locale = lang === "zh" ? "zh-CN" : "en-US";

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xs uppercase text-muted-foreground">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div> : null}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setCalendarCollapsed((v) => !v)}
          className="h-7 px-2 text-xs"
        >
          {calendarCollapsed ? (lang === "zh" ? "展开日历" : "Expand") : lang === "zh" ? "折叠日历" : "Collapse"}
        </Button>
      </div>
      {events.length ? (
        <div className="scenario-calendar-shell grid gap-3 rounded-xl border border-border/60 bg-background/80 p-2 md:p-3">
          {!calendarCollapsed ? (
            <div className="rounded-lg border border-border/60 bg-background/75 p-2">
              <CalendarErrorBoundary
                fallback={
                  <div className="rounded-md border border-border/60 bg-background/70 p-3 text-xs text-muted-foreground">
                    {lang === "zh" ? "日历渲染失败，已降级为时间线展示。" : "Calendar rendering failed. Timeline fallback is shown."}
                  </div>
                }
              >
                <DayFlowCalendar calendar={calendar} />
              </CalendarErrorBoundary>
            </div>
          ) : null}
          <div className="rounded-lg border border-border/60 bg-background/70 p-3">
            <div className="mb-2 text-xs font-medium text-foreground">
              {lang === "zh" ? "关键时间线（精确到秒）" : "Timeline (Exact Time)"}
            </div>
            <div className="grid gap-2">
              {timeline.map((item) => (
                <div
                  key={`timeline_${item.id}`}
                  className="grid grid-cols-[1fr_auto] gap-2 rounded-md border border-border/50 bg-background/80 px-3 py-2 text-xs"
                >
                  <div className="truncate text-muted-foreground">{item.title}</div>
                  <div className="font-medium text-foreground">
                    {new Intl.DateTimeFormat(locale, {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    }).format(item.start)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-background/70 p-3 text-xs text-muted-foreground">
          {emptyText}
        </div>
      )}
    </div>
  );
}
