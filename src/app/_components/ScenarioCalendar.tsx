"use client";

import { useMemo, useState } from "react";
import { DayFlowCalendar, ViewType, createAllDayEvent, createDragPlugin, createMonthView, useCalendarApp } from "@dayflow/core";
import { CalendarErrorBoundary } from "@/app/_components/CalendarErrorBoundary";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronDown, ChevronUp, Clock3, Flag, Sparkles } from "lucide-react";

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
  theme,
  events,
  initialDate,
  emptyText,
}: {
  title: string;
  subtitle?: string;
  lang: "zh" | "en";
  theme: "dark" | "light";
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
    views: [
      createMonthView({
        enableDrag: false,
        enableResize: false,
        enableCreate: false,
      }),
    ],
    plugins: [createDragPlugin()],
    events: dayflowEvents,
    defaultView: ViewType.MONTH,
    initialDate,
    theme: {
      mode: theme,
    },
  });

  const timeline = useMemo(() => [...events].sort((a, b) => a.start.getTime() - b.start.getTime()), [events]);
  const locale = lang === "zh" ? "zh-CN" : "en-US";
  const firstEvent = timeline[0];
  const lastEvent = timeline[timeline.length - 1];
  const timelineTitle = lang === "zh" ? "关键日期时间线" : "Key Date Timeline";
  const timelineSub =
    lang === "zh" ? "按发生顺序展示开始、结束、回撤与快照节点。" : "Events ordered by when they happen: start, end, drawdown, and snapshot checkpoints.";
  const toggleLabel = calendarCollapsed ? (lang === "zh" ? "展开月历" : "Expand Calendar") : lang === "zh" ? "折叠月历" : "Collapse Calendar";
  const hoverHint = lang === "zh" ? "悬停今天日期可查看提示" : "Hover today's date to see the label";
  const formatEventDate = (date: Date) =>
    new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      weekday: "short",
    }).format(date);

  return (
    <div className="calendar-card grid gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-border/60 bg-background/70 text-primary">
              <CalendarDays className="h-4 w-4" />
            </span>
            <div className="text-sm font-semibold text-foreground">{title}</div>
          </div>
          {subtitle ? <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div> : null}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setCalendarCollapsed((v) => !v)}
          className="h-8 gap-1.5 rounded-full px-3 text-xs"
        >
          {calendarCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          {toggleLabel}
        </Button>
      </div>
      {events.length ? (
        <div className="scenario-calendar-shell calendar-shell grid gap-3 rounded-xl border border-border/60 bg-background/80 p-2 md:p-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="calendar-stat-tile">
              <div className="calendar-stat-label">
                <CalendarDays className="h-3.5 w-3.5" />
                {lang === "zh" ? "关键节点" : "Key Events"}
              </div>
              <div className="calendar-stat-value">{events.length}</div>
            </div>
            <div className="calendar-stat-tile">
              <div className="calendar-stat-label">
                <Flag className="h-3.5 w-3.5" />
                {lang === "zh" ? "起始日期" : "Start Date"}
              </div>
              <div className="calendar-stat-value text-xs">
                {firstEvent
                  ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit" }).format(firstEvent.start)
                  : "-"}
              </div>
            </div>
            <div className="calendar-stat-tile">
              <div className="calendar-stat-label">
                <Clock3 className="h-3.5 w-3.5" />
                {lang === "zh" ? "结束日期" : "End Date"}
              </div>
              <div className="calendar-stat-value text-xs">
                {lastEvent
                  ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit" }).format(lastEvent.start)
                  : "-"}
              </div>
            </div>
          </div>
          {!calendarCollapsed ? (
            <div className="calendar-surface rounded-lg border border-border/60 bg-background/75 p-2">
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
          <div className="calendar-timeline rounded-lg border border-border/60 bg-background/70 p-3">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-xs font-medium text-foreground">{timelineTitle}</div>
                <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{timelineSub}</div>
              </div>
              <div className="grid gap-2">
                <div className="rounded-full border border-border/60 bg-background/75 px-3 py-1 text-[11px] text-muted-foreground">
                  {events.length} {lang === "zh" ? "个节点" : "events"}
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/75 px-3 py-1 text-[11px] text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  {hoverHint}
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              {timeline.map((item, index) => (
                <div
                  key={`timeline_${item.id}`}
                  className="calendar-timeline-item"
                >
                  <div className="calendar-timeline-index">{String(index + 1).padStart(2, "0")}</div>
                  <div className="min-w-0">
                    <div className="calendar-timeline-title">{item.title}</div>
                    <div className="calendar-timeline-date">{formatEventDate(item.start)}</div>
                  </div>
                  <div className="calendar-timeline-chip">
                    {item.start.toLocaleDateString(locale, { month: "2-digit", day: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="calendar-empty rounded-xl border border-border/60 bg-background/70 p-4 text-xs text-muted-foreground">
          <div className="calendar-empty-icon">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="calendar-empty-title">{emptyText}</div>
          <div className="calendar-empty-sub">
            {lang === "zh" ? "生成结果后，这里会展示开始/结束/回撤和快照日期。" : "Once results are generated, start/end/drawdown/snapshot dates will appear here."}
          </div>
          <div className="calendar-empty-note">
            {lang === "zh" ? "交易日模式下还会同步展示关键日期节点。" : "Trading-day mode will also surface key date checkpoints here."}
          </div>
        </div>
      )}
    </div>
  );
}
