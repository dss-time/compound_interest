import { Languages, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  nowText: string;
  lang: "zh" | "en";
  theme: "dark" | "light";
  t: (key: string, vars?: Record<string, string | number>) => string;
  onToggleTheme: () => void;
  onToggleLang: () => void;
};

export function AppHeader({ nowText, lang, theme, t, onToggleTheme, onToggleLang }: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Compound Interest Lab</div>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{t("pageTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">{t("pageSub")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onToggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? t("themeLight") : t("themeDark")}
          </Button>
          <Button variant="outline" size="sm" onClick={onToggleLang}>
            <Languages className="h-4 w-4" />
            {lang === "zh" ? "EN" : "中"}
          </Button>
          <div className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs text-muted-foreground">
            {nowText}
          </div>
        </div>
      </div>
    </header>
  );
}
