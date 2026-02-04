export type OptionType = "call" | "put";
export type OptionSide = "long" | "short";

export type OptionLeg = {
  label: string;
  optionType: OptionType;
  side: OptionSide;
  strike: number;
  premium: number;
  qty: number;
};

export type StockLeg = {
  shares: number;
  entry: number;
};

export type StrategyTemplate = {
  id: string;
  name: string;
  outlook: "bullish" | "bearish" | "neutral" | "volatile";
  description: string;
  legs: OptionLeg[];
  stock?: StockLeg;
  maxProfitHint: string;
  maxLossHint: string;
};

const CONTRACT_SIZE = 100;

export const STRATEGIES: StrategyTemplate[] = [
  {
    id: "long_call",
    name: "Long Call",
    outlook: "bullish",
    description: "看涨、风险有限、收益理论无限。",
    legs: [{ label: "Buy Call", optionType: "call", side: "long", strike: 105, premium: 3.2, qty: 1 }],
    maxProfitHint: "Unlimited",
    maxLossHint: "Premium paid",
  },
  {
    id: "long_put",
    name: "Long Put",
    outlook: "bearish",
    description: "看跌保护，收益有限（到0），损失有限。",
    legs: [{ label: "Buy Put", optionType: "put", side: "long", strike: 95, premium: 2.8, qty: 1 }],
    maxProfitHint: "Strike - Premium",
    maxLossHint: "Premium paid",
  },
  {
    id: "bull_call_spread",
    name: "Bull Call Spread",
    outlook: "bullish",
    description: "买低卖高的看涨价差，成本低于裸买Call。",
    legs: [
      { label: "Buy Call", optionType: "call", side: "long", strike: 100, premium: 5.2, qty: 1 },
      { label: "Sell Call", optionType: "call", side: "short", strike: 110, premium: 2.1, qty: 1 },
    ],
    maxProfitHint: "Strike diff - net debit",
    maxLossHint: "Net debit",
  },
  {
    id: "bear_put_spread",
    name: "Bear Put Spread",
    outlook: "bearish",
    description: "买高卖低的看跌价差，适合温和看跌。",
    legs: [
      { label: "Buy Put", optionType: "put", side: "long", strike: 110, premium: 6, qty: 1 },
      { label: "Sell Put", optionType: "put", side: "short", strike: 100, premium: 2.5, qty: 1 },
    ],
    maxProfitHint: "Strike diff - net debit",
    maxLossHint: "Net debit",
  },
  {
    id: "bull_put_spread",
    name: "Bull Put Spread",
    outlook: "bullish",
    description: "卖高买低Put信用价差，赚时间价值。",
    legs: [
      { label: "Sell Put", optionType: "put", side: "short", strike: 100, premium: 3.6, qty: 1 },
      { label: "Buy Put", optionType: "put", side: "long", strike: 90, premium: 1.4, qty: 1 },
    ],
    maxProfitHint: "Net credit",
    maxLossHint: "Strike diff - net credit",
  },
  {
    id: "bear_call_spread",
    name: "Bear Call Spread",
    outlook: "bearish",
    description: "卖低买高Call信用价差，适合温和看跌。",
    legs: [
      { label: "Sell Call", optionType: "call", side: "short", strike: 100, premium: 4.1, qty: 1 },
      { label: "Buy Call", optionType: "call", side: "long", strike: 110, premium: 1.8, qty: 1 },
    ],
    maxProfitHint: "Net credit",
    maxLossHint: "Strike diff - net credit",
  },
  {
    id: "long_straddle",
    name: "Long Straddle",
    outlook: "volatile",
    description: "同K买Call+Put，押注大波动。",
    legs: [
      { label: "Buy Call", optionType: "call", side: "long", strike: 100, premium: 4.5, qty: 1 },
      { label: "Buy Put", optionType: "put", side: "long", strike: 100, premium: 4.1, qty: 1 },
    ],
    maxProfitHint: "Large move both sides",
    maxLossHint: "Total premium paid",
  },
  {
    id: "short_straddle",
    name: "Short Straddle",
    outlook: "neutral",
    description: "同K卖Call+Put，赚时间价值，风险大。",
    legs: [
      { label: "Sell Call", optionType: "call", side: "short", strike: 100, premium: 4.5, qty: 1 },
      { label: "Sell Put", optionType: "put", side: "short", strike: 100, premium: 4.1, qty: 1 },
    ],
    maxProfitHint: "Total premium received",
    maxLossHint: "Potentially very large",
  },
  {
    id: "long_strangle",
    name: "Long Strangle",
    outlook: "volatile",
    description: "买OTM Put + 买OTM Call，成本低于Straddle。",
    legs: [
      { label: "Buy Put", optionType: "put", side: "long", strike: 92, premium: 2.1, qty: 1 },
      { label: "Buy Call", optionType: "call", side: "long", strike: 108, premium: 2.3, qty: 1 },
    ],
    maxProfitHint: "Large move both sides",
    maxLossHint: "Total premium paid",
  },
  {
    id: "short_strangle",
    name: "Short Strangle",
    outlook: "neutral",
    description: "卖OTM Put + 卖OTM Call，风险比信用价差更大。",
    legs: [
      { label: "Sell Put", optionType: "put", side: "short", strike: 92, premium: 2.1, qty: 1 },
      { label: "Sell Call", optionType: "call", side: "short", strike: 108, premium: 2.3, qty: 1 },
    ],
    maxProfitHint: "Total premium received",
    maxLossHint: "Potentially very large",
  },
  {
    id: "iron_condor",
    name: "Iron Condor",
    outlook: "neutral",
    description: "双信用价差组合，押注区间震荡。",
    legs: [
      { label: "Buy Put", optionType: "put", side: "long", strike: 88, premium: 0.9, qty: 1 },
      { label: "Sell Put", optionType: "put", side: "short", strike: 94, premium: 2, qty: 1 },
      { label: "Sell Call", optionType: "call", side: "short", strike: 106, premium: 2.1, qty: 1 },
      { label: "Buy Call", optionType: "call", side: "long", strike: 112, premium: 0.9, qty: 1 },
    ],
    maxProfitHint: "Net credit",
    maxLossHint: "Wing width - net credit",
  },
  {
    id: "iron_butterfly",
    name: "Iron Butterfly",
    outlook: "neutral",
    description: "中心点高收益，偏离后损失受限。",
    legs: [
      { label: "Buy Put", optionType: "put", side: "long", strike: 90, premium: 1.2, qty: 1 },
      { label: "Sell Put", optionType: "put", side: "short", strike: 100, premium: 4.8, qty: 1 },
      { label: "Sell Call", optionType: "call", side: "short", strike: 100, premium: 4.5, qty: 1 },
      { label: "Buy Call", optionType: "call", side: "long", strike: 110, premium: 1.1, qty: 1 },
    ],
    maxProfitHint: "Net credit",
    maxLossHint: "Wing width - net credit",
  },
  {
    id: "covered_call",
    name: "Covered Call",
    outlook: "neutral",
    description: "持股卖Call，增强收益但上行封顶。",
    legs: [{ label: "Sell Call", optionType: "call", side: "short", strike: 108, premium: 2.2, qty: 1 }],
    stock: { shares: 100, entry: 100 },
    maxProfitHint: "(Strike - stock entry) + premium",
    maxLossHint: "Stock downside - premium",
  },
  {
    id: "protective_put",
    name: "Protective Put",
    outlook: "bullish",
    description: "持股买Put，限制下跌风险。",
    legs: [{ label: "Buy Put", optionType: "put", side: "long", strike: 95, premium: 2.3, qty: 1 }],
    stock: { shares: 100, entry: 100 },
    maxProfitHint: "Stock upside - premium",
    maxLossHint: "(Stock entry - strike) + premium",
  },
];

function legPayoffPerShare(leg: OptionLeg, expiryPrice: number) {
  const intrinsic =
    leg.optionType === "call"
      ? Math.max(expiryPrice - leg.strike, 0)
      : Math.max(leg.strike - expiryPrice, 0);
  return leg.side === "long" ? intrinsic - leg.premium : leg.premium - intrinsic;
}

export function calcStrategyPayoffAtExpiry(strategy: StrategyTemplate, expiryPrice: number) {
  const optionsPnl = strategy.legs.reduce(
    (sum, leg) => sum + legPayoffPerShare(leg, expiryPrice) * leg.qty * CONTRACT_SIZE,
    0
  );
  const stockPnl = strategy.stock ? (expiryPrice - strategy.stock.entry) * strategy.stock.shares : 0;
  return optionsPnl + stockPnl;
}

export function buildPayoffSeries(strategy: StrategyTemplate, centerPrice: number) {
  const min = Math.max(1, centerPrice * 0.5);
  const max = centerPrice * 1.5;
  const step = (max - min) / 48;
  const rows: Array<{ price: number; pnl: number }> = [];

  for (let i = 0; i <= 48; i++) {
    const price = Number((min + step * i).toFixed(2));
    rows.push({ price, pnl: calcStrategyPayoffAtExpiry(strategy, price) });
  }

  return rows;
}

export function findBreakevens(series: Array<{ price: number; pnl: number }>) {
  const out: number[] = [];
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1];
    const curr = series[i];
    if (prev.pnl === 0) out.push(prev.price);
    if (prev.pnl * curr.pnl < 0) {
      const ratio = Math.abs(prev.pnl) / (Math.abs(prev.pnl) + Math.abs(curr.pnl));
      const hit = prev.price + (curr.price - prev.price) * ratio;
      out.push(Number(hit.toFixed(2)));
    }
  }
  return Array.from(new Set(out));
}

export function estimateRangeRisk(series: Array<{ price: number; pnl: number }>) {
  const pnls = series.map((r) => r.pnl);
  return {
    maxProfit: Math.max(...pnls),
    maxLoss: Math.min(...pnls),
  };
}
