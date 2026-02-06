import { Languages, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import SpotlightCard from "@/app/_components/reactbits/SpotlightCard";
import ShinyText from "@/app/_components/reactbits/ShinyText";

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
    <SpotlightCard
      className="float-in flex flex-col gap-4 rounded-2xl border border-white/40 bg-card/70 p-6 shadow-[0_18px_50px_rgba(12,20,34,0.14)] backdrop-blur-xl dark:border-white/10"
      spotlightColor={theme === "dark" ? "rgba(88,164,255,0.22)" : "rgba(255,149,62,0.20)"}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Compound Interest Lab</div>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
            <ShinyText>{t("pageTitle")}</ShinyText>
          </h1>
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
          <div className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs text-muted-foreground shadow-sm">
            {nowText}
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
