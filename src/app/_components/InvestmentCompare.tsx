import { BarChart3, Coins, House, PiggyBank } from "lucide-react";

type CompareCard = {
  id: string;
  titleZh: string;
  titleEn: string;
  rateZh: string;
  rateEn: string;
  noteZh: string;
  noteEn: string;
  tone: "blue" | "green" | "cyan" | "orange";
  icon: typeof BarChart3;
};

const CARDS: CompareCard[] = [
  {
    id: "equity",
    titleZh: "股票",
    titleEn: "Equity",
    rateZh: "8% 左右",
    rateEn: "~8%",
    noteZh: "波动高，但长期收益潜力通常更强。",
    noteEn: "Higher volatility, stronger long-term upside potential.",
    tone: "blue",
    icon: BarChart3,
  },
  {
    id: "gold",
    titleZh: "黄金",
    titleEn: "Gold",
    rateZh: "6% 左右",
    rateEn: "~6%",
    noteZh: "更适合作为防御性配置和风险对冲。",
    noteEn: "Useful as a defensive allocation and risk hedge.",
    tone: "green",
    icon: Coins,
  },
  {
    id: "real_estate",
    titleZh: "房产",
    titleEn: "Real Estate",
    rateZh: "5-7%",
    rateEn: "5-7%",
    noteZh: "现金流和升值并存，但流动性较弱。",
    noteEn: "Mix of cash flow and appreciation with lower liquidity.",
    tone: "cyan",
    icon: House,
  },
  {
    id: "savings",
    titleZh: "存款",
    titleEn: "Savings",
    rateZh: "2-3%",
    rateEn: "2-3%",
    noteZh: "稳定但增长有限，适合作为安全垫。",
    noteEn: "Stable but limited growth, useful as a safety buffer.",
    tone: "orange",
    icon: PiggyBank,
  },
];

export function InvestmentCompare({
  lang,
}: {
  lang: "zh" | "en";
}) {
  return (
    <div className="compare-grid">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.id} className={`compare-card compare-card-${card.tone}`}>
            <div className="compare-card-media">
              <Icon className="h-10 w-10" />
            </div>
            <div className="compare-card-body">
              <div className="compare-card-title">{lang === "zh" ? card.titleZh : card.titleEn}</div>
              <div className="compare-card-rate-label">
                {lang === "zh" ? "平均年化收益参考" : "Typical annual return"}
              </div>
              <div className="compare-card-rate">{lang === "zh" ? card.rateZh : card.rateEn}</div>
              <div className="compare-card-note">{lang === "zh" ? card.noteZh : card.noteEn}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
