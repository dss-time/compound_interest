"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ReactJsonView = dynamic(() => import("@microlink/react-json-view"), { ssr: false });

type JsonPanel = {
  id: string;
  title: string;
  subtitle?: string;
  data: unknown;
};

export function JsonInspector({
  title,
  theme,
  panels,
}: {
  title: string;
  theme: "light" | "dark";
  panels: JsonPanel[];
}) {
  const defaultTab = panels[0]?.id ?? "data";
  const displayPanels = useMemo(
    () => panels.filter((panel) => panel && panel.data !== undefined),
    [panels]
  );

  return (
    <div className="grid gap-3">
      <div className="text-xs uppercase text-muted-foreground">{title}</div>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="flex flex-wrap">
          {displayPanels.map((panel) => (
            <TabsTrigger key={panel.id} value={panel.id}>
              {panel.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {displayPanels.map((panel) => (
          <TabsContent key={panel.id} value={panel.id}>
            {panel.subtitle ? <div className="mb-2 text-xs text-muted-foreground">{panel.subtitle}</div> : null}
            <div className="rounded-xl border border-border/60 bg-background/80 p-3">
              <ReactJsonView
                src={
                  panel.data && typeof panel.data === "object"
                    ? (panel.data as Record<string, unknown>)
                    : { value: panel.data }
                }
                displayDataTypes={false}
                displayObjectSize={false}
                collapsed={2}
                enableClipboard={true}
                name={false}
                theme={theme === "dark" ? "ocean" : "rjv-default"}
                style={{ backgroundColor: "transparent" }}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
