import { Calculator, Languages, LineChart, Moon, PieChart, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import SpotlightCard from "@/app/_components/reactbits/SpotlightCard";

type AppHeaderProps = {
  nowText: string;
  lang: "zh" | "en";
  theme: "dark" | "light";
  t: (key: string, vars?: Record<string, string | number>) => string;
  onToggleTheme: () => void;
  onToggleLang: () => void;
  onJumpCalc: () => void;
  onJumpTrend: () => void;
  onJumpCompare: () => void;
};

export function AppHeader({
  nowText,
  lang,
  theme,
  t,
  onToggleTheme,
  onToggleLang,
  onJumpCalc,
  onJumpTrend,
  onJumpCompare,
}: AppHeaderProps) {
  const brand = lang === "zh" ? "复利收益规划器" : "Compound Interest Planner";
  const liveLabel = lang === "zh" ? "简单清晰的收益测算" : "Clean, calm return planning";
  const heroTitle = lang === "zh" ? "投资收益计算器" : "Investment Return Calculator";
  const heroDescriptor = lang === "zh" ? "月度估算 / 交易日精确 / 场景对比" : "Monthly estimates / Trading-day precision / Scenario compare";
  const helperText =
    lang === "zh"
      ? "输入参数后结果会实时更新。高级功能仍然保留，但默认收在后面的分析区。"
      : "Results update live as you edit. Advanced tools stay available, but remain tucked into the analysis area by default.";
  const shortcuts =
    lang === "zh"
      ? [
          { id: "calc", label: "参数计算", sub: "查看输入区", icon: Calculator, onClick: onJumpCalc },
          { id: "trend", label: "收益趋势", sub: "查看图表", icon: LineChart, onClick: onJumpTrend },
          { id: "compare", label: "投资对比", sub: "查看参考卡片", icon: PieChart, onClick: onJumpCompare },
        ]
      : [
          { id: "calc", label: "Calculator", sub: "Open inputs", icon: Calculator, onClick: onJumpCalc },
          { id: "trend", label: "Trend", sub: "Open chart", icon: LineChart, onClick: onJumpTrend },
          { id: "compare", label: "Compare", sub: "Open reference cards", icon: PieChart, onClick: onJumpCompare },
        ];

  return (
    <SpotlightCard
      className="hero-card finance-hero-simple float-in rounded-[30px] p-5 backdrop-blur-xl md:p-7"
      spotlightColor={theme === "dark" ? "rgba(88,164,255,0.18)" : "rgba(76,132,255,0.18)"}
    >
      <div className="finance-hero-top">
        <div className="finance-brand-mark">
          <div className="finance-brand-name">{brand}</div>
          <div className="finance-hero-live">{heroDescriptor}</div>
        </div>
        <div className="hero-control-dock">
          <Button variant="outline" size="sm" className="bg-background/78" onClick={onToggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? t("themeLight") : t("themeDark")}
          </Button>
          <Button variant="outline" size="sm" className="bg-background/78" onClick={onToggleLang}>
            <Languages className="h-4 w-4" />
            {lang === "zh" ? "EN" : "中"}
          </Button>
          <div className="rounded-2xl border border-border/60 bg-background/78 px-4 py-2 text-xs text-muted-foreground shadow-sm">
            {nowText}
          </div>
        </div>
      </div>

      <div className="finance-hero-main-simple">
        <div className="finance-hero-badge-simple">{liveLabel}</div>
        <h1 className="finance-hero-title-simple">{heroTitle}</h1>
        <p className="finance-hero-sub-simple">{helperText}</p>
        <div className="finance-shortcut-row">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <button
                key={shortcut.id}
                type="button"
                onClick={shortcut.onClick}
                className="finance-shortcut"
              >
                <span className="finance-shortcut-icon">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="finance-shortcut-copy">
                  <span className="finance-shortcut-title">{shortcut.label}</span>
                  <span className="finance-shortcut-sub">{shortcut.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </SpotlightCard>
  );
}
