export const PRESETS = [
  {
    id: 'monthly_2_12',
    label: '示例：月收益 2% / 12个月',
    values: {
      simMode: 'monthly',
      monthlyRate: 2,
      duration: 12,
      durationUnit: 'months',
      mode: 'compound',
    },
  },
  {
    id: 'monthly_1_36',
    label: '稳健：月收益 1% / 36个月',
    values: {
      simMode: 'monthly',
      monthlyRate: 1,
      duration: 36,
      durationUnit: 'months',
      mode: 'compound',
    },
  },
  {
    id: 'trading_daily',
    label: '交易日：日收益 0.1% / 24个月',
    values: {
      simMode: 'tradingDays',
      rateMode: 'daily',
      dailyRate: 0.1,
      duration: 24,
      durationUnit: 'months',
      mode: 'compound',
    },
  },
  {
    id: 'trading_annual',
    label: '交易日：年化 15% / 60个月',
    values: {
      simMode: 'tradingDays',
      rateMode: 'annual',
      annualRate: 15,
      duration: 60,
      durationUnit: 'months',
      mode: 'compound',
    },
  },
];
