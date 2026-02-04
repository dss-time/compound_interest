export type OptionType = "call" | "put";
export type OptionSide = "long" | "short";

export type OptionParams = {
  optionType: OptionType;
  side: OptionSide;
  spot: number;
  strike: number;
  premium: number;
  contracts: number;
};

const CONTRACT_SIZE = 100;

export function calcPayoffAtExpiry(params: OptionParams, expiryPrice: number) {
  const intrinsic =
    params.optionType === "call"
      ? Math.max(expiryPrice - params.strike, 0)
      : Math.max(params.strike - expiryPrice, 0);

  const perShare = params.side === "long" ? intrinsic - params.premium : params.premium - intrinsic;
  return perShare * params.contracts * CONTRACT_SIZE;
}

export function buildPayoffSeries(params: OptionParams) {
  const center = params.strike > 0 ? params.strike : params.spot || 100;
  const min = Math.max(1, center * 0.5);
  const max = center * 1.5;
  const step = (max - min) / 24;

  const rows: Array<{ price: number; pnl: number }> = [];
  for (let i = 0; i <= 24; i++) {
    const price = Number((min + step * i).toFixed(2));
    rows.push({ price, pnl: calcPayoffAtExpiry(params, price) });
  }
  return rows;
}

export function calcBreakeven(params: OptionParams) {
  if (params.optionType === "call") {
    return params.side === "long" ? params.strike + params.premium : params.strike + params.premium;
  }
  return params.side === "long" ? params.strike - params.premium : params.strike - params.premium;
}

export function calcRiskProfile(params: OptionParams) {
  const multiplier = params.contracts * CONTRACT_SIZE;
  if (params.optionType === "call" && params.side === "long") {
    return {
      maxProfit: Infinity,
      maxLoss: params.premium * multiplier,
    };
  }
  if (params.optionType === "put" && params.side === "long") {
    return {
      maxProfit: Math.max(params.strike - params.premium, 0) * multiplier,
      maxLoss: params.premium * multiplier,
    };
  }
  if (params.optionType === "call" && params.side === "short") {
    return {
      maxProfit: params.premium * multiplier,
      maxLoss: Infinity,
    };
  }
  return {
    maxProfit: params.premium * multiplier,
    maxLoss: Math.max(params.strike - params.premium, 0) * multiplier,
  };
}
