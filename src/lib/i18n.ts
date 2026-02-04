export const I18N = {
  zh: {
    pageTitle: '投资收益计算器（月/交易日精确）',
    pageSub:
      '✅ A股/美股可切换｜✅ 必须导入交易日历 JSON 才能“精确计算”交易日收益',

    secParams: '参数设置',
    pillInputUpdate: '输入即更新',
    quickStartTitle: '快速上手',
    quickStartSub: '一键套用典型场景，快速查看结果',
    quickStartBadge: '新手',
    lblSimMode: '模拟方式',
    optSimMonthly: '按月（输入月收益率）',
    optSimTradingDays: '按交易日（精确：A股/美股）',
    helpSimMode:
      '说明 按月：每月结算一次收益；按交易日：仅在“交易日历”中的日期滚动收益，严格剔除节假日/休市日（必须导入交易日历 JSON）。',

    lblMarket: '市场',
    optMarketCN: 'A股',
    optMarketUS: '美股',
    helpMarket:
      '说明 手动切换 A股/美股。每个市场可导入各自交易日历（支持一次导入两套）。',

    lblStartDate: '开始日期',
    helpStartDate:
      '说明 交易日模拟从该日期开始（含），到“开始日期 + 投资时长（月/年）”结束（不含结束日）。收益只在交易日滚动。',

    lblRateMode: '收益率输入',
    optRateDaily: '日收益率（%/交易日）',
    optRateAnnual: '年化收益率（%）',
    helpRateMode:
      '说明 日收益率：每个交易日固定收益率；年化：按“每个自然年交易日数”精确折算到交易日（不同年份交易日数不同，会导致每年的日收益率不同）。',

    lblDailyRate: '日收益率（%）',
    helpDailyRate: '说明 例如 0.1 表示每个交易日 +0.1%（复投则按当日余额滚动）。',

    lblAnnualRate: '年化收益率（%）',
    helpAnnualRate:
      '说明 精确折算：对每一天，取该自然年的交易日总数 N，日收益率 r_day=(1+年化)^(1/N)-1，确保“该年交易日全部滚动后≈年化”。',

    lblCalendar: '交易日历 JSON',
    calFmtTitle: '支持格式（日期必须为 YYYY-MM-DD）：',
    calFmt1Prefix: '1)',
    calFmt1Suffix: '（导入到当前选择的市场）',
    calFmt2Prefix: '2)',
    calFmt2Mid: '或',
    calSuggest: '建议：导入覆盖你模拟区间的完整日历（跨年需包含所有年份）。',
    helpCalendar:
      '说明 为保证“精确统计”，交易日模式下未导入或日历覆盖不足将直接停止计算并提示缺失范围（不再用周一~周五近似）。',
    calStatusNotImported: '未导入交易日历：交易日精确模式将无法计算',

    lblPrincipal: '本金（元）',
    helpPrincipal: '说明 初始投入金额。',

    lblMonthlyRate: '月收益率（%）',
    helpMonthlyRate: '说明 每月收益率，例如 2 表示每月 +2%。',

    lblDuration: '投资时长',
    optUnitMonths: '月',
    optUnitYears: '年',
    helpDuration:
      '说明 输入年会自动折算为月数（例如 30 年=360 个月）。交易日模拟会用该月数生成结束日期。',

    lblCalcMode: '计算方式',
    optCompound: '复投（复利）',
    optSimple: '不复投（单利）',
    helpCalcMode: '说明 复投：收益计入本金继续滚动；不复投：收益按初始本金计算。',

    lblShowAnnual: '显示年化',
    txtShowAnnual: '显示年化收益率（折算）',
    helpShowAnnual:
      '说明 按月：年化=(期末/本金)^(12/月数)-1；按交易日：年化=(期末/本金)^(1/年数)-1（年数=实际日历天/365.25）。',

    secDD: '回撤控制',
    pillDD: '单次 / 多次 / 随机',

    lblEnableDD: '启用回撤',
    txtEnableDD: '开启回撤控制与统计',
    helpEnableDD: '说明 回撤：账户从历史峰值一次性回落 X%（一次性），之后继续运行。',

    lblDDMode: '回撤模式',
    optDDSingle: '单次回撤（对比不同回撤幅度）',
    optDDMulti: '多次回撤（手动序列）',
    optDDRandom: '随机回撤序列（蒙特卡洛）',
    helpDDMode:
      '说明 单次：对不同回撤幅度分别计算；多次：按序列发生多次回撤；随机：按概率/次数生成序列并输出分位数（P50 / P90最差）。',

    lblDDList: '回撤列表（%）',
    helpDDList:
      '说明 逗号分隔，如 5,10,15,20；逐个计算净收益/期末余额/回撤前峰值 Peak。',

    lblDDWhen: '回撤发生',
    optDDWorst: '最差情况（任意月份发生一次）',
    optDDFixed: '指定月份发生一次',
    helpDDWhen: '说明 最差：枚举 1..月数取最差期末；指定：仅在某个月（按“月序号”）触发一次回撤。',

    lblDDMonth: '指定月份',
    helpDDMonth: '说明 例如 6 表示第 6 个月结束后触发回撤（交易日模式同样按“月序号”）。',

    lblDDSeq: '回撤序列',
    helpDDSeq:
      '说明 格式：回撤%@月份（按月序号），逗号分隔；如 10@6,20@18。可同月多个事件，按输入顺序执行。',

    lblDDPool: '回撤幅度池（%）',
    helpDDPool: '说明 随机回撤幅度从该列表等概率抽取（重复某个数字可“加权”）。',

    lblRandMethod: '随机方式',
    optRandProb: '按月概率',
    optRandCount: '固定次数',
    helpRandMethod: '说明 随机回撤仍以“月”为粒度：按月概率或在周期内随机挑 N 个月发生。',

    lblRandProb: '月回撤概率（%）',
    helpRandProb: '说明 例如 2 表示每个月有 2% 概率触发一次随机回撤。',

    lblRandCount: '回撤次数（次）',
    helpRandCount: '说明 例如 6 表示整个周期随机选 6 个月触发回撤。',

    lblSimRuns: '模拟次数',
    helpSimRuns: '说明 模拟次数越高分位数越稳定；建议 1000~10000。',

    lblSimSeed: '随机种子',
    helpSimSeed: '说明 auto 表示每次不同；填写固定字符串可复现实验结果。',

    btnReset: '重置为示例',
    btnCopy: '复制结果',
    btnShare: '复制分享链接',
    btnShareHint: '分享链接不包含交易日历，仅包含参数。',

    detailsSummary: '展开查看每月明细（余额、当月收益、累计收益）',
    detailsHint: '提示：明细区已启用滚动条。交易日模式按“月汇总”展示，避免表格过长。',

    secResult: '结果',
    pillRealtime: '实时更新',
    summaryTitle: '结论摘要',
    summaryMonthlyTpl: '{months} 个月后总金额约 {balance}，净收益 {profit}，年化约 {annual}（按月折算）',
    summaryTradingTpl: '区间 {start} ~ {end} 总金额约 {balance}，净收益 {profit}，年化约 {annual}',

    kpiFinal: '周期末总金额',
    kpiFinalHint: '= 本金 + 累计收益',
    kpiProfit: '净收益',
    kpiProfitHint: '不含任何手续费/税费',
    kpiTotalReturn: '累计收益率',
    kpiTotalReturnHint: '（净收益 ÷ 本金）',
    kpiAnnualized: '年化收益率（折算）',
    chartTitle: '收益曲线',
    chartSub: '余额与净收益随时间变化趋势',
    chartBalance: '余额',
    chartProfit: '净收益',
    chartGain: '当月收益',
    chartModeBoth: '余额+净收益',

    ddBoxTitleDefault: '回撤控制下的收益',

    calendarGuideTitle: '交易日历未导入',
    calendarGuideSub: '交易日模式需要覆盖完整区间的日历数据才能计算。',
    calendarGuideStep1: '准备包含交易日期的 JSON 文件',
    calendarGuideStep2: '在左侧「导入交易日历」上传',
    calendarGuideStep3: '确认覆盖区间与市场匹配',
    calendarGuideFormat: '查看示例格式',
    calendarGuideExample: '{ \"market\": \"CN\", \"dates\": [\"2024-01-02\", \"2024-01-03\"] }',

    scenarioTitle: '方案对比',
    scenarioSub: '保存当前方案，快速对比不同参数',
    scenarioSave: '保存方案',
    scenarioEmpty: '暂无保存的方案',
    scenarioRemove: '移除',
    scenarioBalance: '余额',
    scenarioProfit: '净收益',
    scenarioDiff: '与当前差值',
    scenarioLabelTpl: '方案 {n}',

    footTitle: '说明：',
    footLine1: '• “交易日精确模式”只在交易日滚动收益，且需要交易日历覆盖整个模拟区间。',
    footLine2: '• 该页面仅用于数学计算演示，不构成投资建议。',

    assumeTitle: '假设说明',
    assumeItem1: '收益率为固定值，不考虑波动或滑点。',
    assumeItem2: '不含手续费、税费与申购赎回成本。',
    assumeItem3: '回撤为模型化的固定事件，非真实市场路径。',

    tipTitle: '说明',

    errNeedCalendar: '需要交易日历',
    errNeedCalendarHint: '交易日精确计算需要导入覆盖区间的交易日历。',
    bannerNeedImport: '⚠️ 你选择了“按交易日精确模式”，但当前市场未导入交易日历。请导入覆盖区间的日历后再计算。',
    calImportedPrefix: '已导入',
    calImportedCN: 'A股',
    calImportedUS: '美股',
    calImportedMid: '交易日历：',
    calImportedSuffix: '个交易日',
    calCoverNotEnoughPrefix: '⚠️ 当前日历覆盖不足：',
    calCoverNeed: '。需要覆盖 ',
    annualHintMonthly: '按月折算：年化=(期末/本金)^(12/月数)-1',
    annualHintTradingTpl: '按交易日精确：区间 {start} ~ {end}（交易日 {td} 天）',

    ddTitleSingle: '回撤控制下的收益（单次回撤，对比不同幅度）',
    ddHintSingle: '不同回撤幅度下的净收益/期末余额/回撤前峰值 Peak；可切换最差情况或指定月份。',
    ddTitleMulti: '回撤控制下的收益（多次回撤，手动序列）',
    ddHintMulti: '按回撤序列触发多次回撤后继续运行；同时列出每次回撤对应的 Peak 与回撤后余额。',
    ddTitleRandom: '回撤控制下的收益（随机回撤序列，分位数）',
    ddHintRandom: '随机生成回撤事件序列并重复模拟，输出收益分位数：P50（中位）与 P90最差（10分位）。',

    thMonth: '月份',
    thGain: '当月收益',
    thProfit: '累计收益',
    thBalance: '期末余额',

    thDd: '回撤',
    thNetProfit: '净收益',
    thFinalBalance: '期末余额',
    thPeak: 'Peak（回撤前峰值）',
    thWorstMonth: '最差月份',
    thFixedMonth: '发生月份',

    thMetric: '指标',
    thP50: 'P50（中位）',
    thP90Worst: 'P90最差（10分位）',
    thMin: '最小',
    thMax: '最大',

    rndMetaRuns: '模拟次数：',
    rndMetaSeed: '｜ 随机种子：',
    rndExplain: '解释：P90最差=第10分位（有 90% 的模拟结果不低于该值）。',

    copyBtnCopied: '已复制 ✓',
    copyBtnDefault: '复制结果',
    shareBtnCopied: '分享链接已复制 ✓',
    shareBtnDefault: '复制分享链接',
    copyFail: '复制失败：你的浏览器可能不支持剪贴板权限。\n你可以手动选中并复制。',

    copySimMonthlyTpl: '模拟: 按月（月收益率 {mr}%）',
    copySimTradingTpl: '模拟: 按交易日精确（{mkt}，{start} ~ {end}，交易日 {td}）',
    copyDailyRateTpl: '日收益率: {dr}%',
    copyAnnualRateTpl: '年化收益率: {ar}%（按每年交易日数逐日折算）',
    copyPrincipalTpl: '本金: {p} 元',
    copyDurationTpl: '时长: {m} 个月',
    copyModeCompound: '方式: 复投（复利）',
    copyModeSimple: '方式: 不复投（单利）',
    copyTotalTpl: '总金额: {v}',
    copyProfitTpl: '净收益: {v}',
    copyTotalReturnTpl: '累计收益率: {v}',
    copyAnnualizedTpl: '年化(折算): {v}',

    alertCalParseFail: '交易日历解析失败',
    alertCalReadFail: '读取/解析交易日历失败，请检查 JSON 文件。',

    mktCN: 'A股',
    mktUS: '美股',

    presetLabel: '快捷预设',
    presetApply: '应用预设',
    presetSaved: '本地保存已开启',
    presetSaveFailed: '本地保存失败（可能是日历过大）',

    themeDark: '深色',
    themeLight: '浅色',

    kbTitle: '键盘快捷键',
    kbAltL: 'Alt+L：中英文切换',
    kbAltT: 'Alt+T：主题切换',
    kbAltR: 'Alt+R：重置为示例',
    kbAltC: 'Alt+C：复制结果',
    kbAltS: 'Alt+S：复制分享链接',
  },

  en: {
    pageTitle: 'Investment Return Calculator (Monthly / Trading-Day Precision)',
    pageSub: '✅ Switch A-share / U.S. market | ✅ Import trading calendar JSON for precise trading-day returns',

    secParams: 'Parameters',
    pillInputUpdate: 'Live update',
    quickStartTitle: 'Quick Start',
    quickStartSub: 'Apply a typical scenario in one click',
    quickStartBadge: 'Starter',
    lblSimMode: 'Simulation',
    optSimMonthly: 'Monthly (input monthly return)',
    optSimTradingDays: 'Trading days (precise: CN/US)',
    helpSimMode:
      'Note: Monthly = settle once per month. Trading days = apply returns only on dates inside the imported trading calendar (holidays/halts excluded).',

    lblMarket: 'Market',
    optMarketCN: 'China A-share',
    optMarketUS: 'U.S. stocks',
    helpMarket: 'Note: Manually switch CN/US. Each market can import its own trading calendar (supports importing both).',

    lblStartDate: 'Start date',
    helpStartDate: 'Note: Trading-day simulation runs from this date (inclusive) to (start + duration) (end date exclusive). Returns accrue only on trading days.',

    lblRateMode: 'Return input',
    optRateDaily: 'Daily return (% per trading day)',
    optRateAnnual: 'Annualized return (%)',
    helpRateMode: 'Note: Daily = fixed return each trading day. Annualized = convert precisely by trading days per calendar year (varies by year).',

    lblDailyRate: 'Daily return (%)',
    helpDailyRate: 'Note: e.g. 0.1 means +0.1% per trading day (compound uses rolling balance).',

    lblAnnualRate: 'Annualized return (%)',
    helpAnnualRate:
      'Note: Precise conversion: for each day, use trading days N in that calendar year. r_day=(1+annual)^(1/N)-1 so full-year trading days ≈ annualized.',

    lblCalendar: 'Trading calendar JSON',
    calFmtTitle: 'Supported formats (date must be YYYY-MM-DD):',
    calFmt1Prefix: '1)',
    calFmt1Suffix: '(import into current market)',
    calFmt2Prefix: '2)',
    calFmt2Mid: 'or',
    calSuggest: 'Tip: Import a full calendar covering your whole simulation range (include all years if crossing years).',
    helpCalendar:
      'Note: For precise stats, trading-day mode will stop and show missing range if calendar is not imported or coverage is insufficient (no Mon–Fri approximation).',
    calStatusNotImported: 'Trading calendar not imported: precise trading-day mode cannot run',

    lblPrincipal: 'Principal (CNY)',
    helpPrincipal: 'Note: Initial invested amount.',

    lblMonthlyRate: 'Monthly return (%)',
    helpMonthlyRate: 'Note: e.g. 2 means +2% per month.',

    lblDuration: 'Duration',
    optUnitMonths: 'Months',
    optUnitYears: 'Years',
    helpDuration: 'Note: Years will be converted to months (e.g. 30 years = 360 months). Trading-day simulation uses this to compute end date.',

    lblCalcMode: 'Mode',
    optCompound: 'Compound (reinvest)',
    optSimple: 'Simple (no reinvest)',
    helpCalcMode: 'Note: Compound = gains added to balance and keep rolling. Simple = gains computed on initial principal.',

    lblShowAnnual: 'Show annualized',
    txtShowAnnual: 'Show annualized return (converted)',
    helpShowAnnual: 'Note: Monthly: (final/principal)^(12/months)-1. Trading days: (final/principal)^(1/years)-1 where years = calendarDays/365.25.',

    secDD: 'Drawdown control',
    pillDD: 'Single / Multi / Random',

    lblEnableDD: 'Enable drawdown',
    txtEnableDD: 'Enable drawdown control & stats',
    helpEnableDD: 'Note: Drawdown = one-time drop of X% from historical peak, then continue simulation.',

    lblDDMode: 'Drawdown mode',
    optDDSingle: 'Single drawdown (compare magnitudes)',
    optDDMulti: 'Multiple drawdowns (manual sequence)',
    optDDRandom: 'Random drawdowns (Monte Carlo)',
    helpDDMode:
      'Note: Single = evaluate different magnitudes. Multi = apply a sequence. Random = generate by probability/count and show quantiles (P50 / P90 worst).',

    lblDDList: 'Drawdown list (%)',
    helpDDList: 'Note: Comma-separated, e.g. 5,10,15,20. Compute net profit/final balance/Peak-before-DD for each.',

    lblDDWhen: 'When to drawdown',
    optDDWorst: 'Worst-case (once in any month)',
    optDDFixed: 'Fixed month (once)',
    helpDDWhen: 'Note: Worst = enumerate month 1..N and take worst final. Fixed = trigger once at the chosen month index.',

    lblDDMonth: 'Fixed month',
    helpDDMonth: 'Note: e.g. 6 means trigger after month 6 ends (same month index in trading-day mode).',

    lblDDSeq: 'Drawdown sequence',
    helpDDSeq: 'Note: Format: dd%@monthIndex, comma-separated; e.g. 10@6,20@18. Multiple events in same month allowed (applied in input order).',

    lblDDPool: 'Drawdown pool (%)',
    helpDDPool: 'Note: Random drawdown magnitudes are sampled uniformly from the list (repeat a number to weight it).',

    lblRandMethod: 'Random method',
    optRandProb: 'Monthly probability',
    optRandCount: 'Fixed count',
    helpRandMethod: 'Note: Random drawdown uses month as granularity: by monthly probability or randomly pick N months in the whole period.',

    lblRandProb: 'Monthly DD probability (%)',
    helpRandProb: 'Note: e.g. 2 means 2% chance each month to trigger one random drawdown.',

    lblRandCount: 'Drawdown count',
    helpRandCount: 'Note: e.g. 6 means randomly select 6 months in the whole period.',

    lblSimRuns: 'Simulation runs',
    helpSimRuns: 'Note: More runs = stabler quantiles. Recommended 1000–10000.',

    lblSimSeed: 'Random seed',
    helpSimSeed: 'Note: auto = different each run. Enter a fixed string to reproduce results.',

    btnReset: 'Reset (demo)',
    btnCopy: 'Copy result',
    btnShare: 'Copy share link',
    btnShareHint: 'Share link does not include trading calendar, only parameters.',

    detailsSummary: 'Show monthly breakdown (balance, monthly gain, cumulative profit)',
    detailsHint: 'Tip: The table is scrollable. Trading-day mode shows monthly aggregates to avoid huge tables.',

    secResult: 'Results',
    pillRealtime: 'Live',
    summaryTitle: 'Summary',
    summaryMonthlyTpl: 'After {months} months, balance ≈ {balance}, profit {profit}, annualized ≈ {annual} (monthly)',
    summaryTradingTpl: '{start} ~ {end} balance ≈ {balance}, profit {profit}, annualized ≈ {annual}',

    kpiFinal: 'Final amount',
    kpiFinalHint: '= Principal + Cumulative profit',
    kpiProfit: 'Net profit',
    kpiProfitHint: 'Fees/taxes not included',
    kpiTotalReturn: 'Total return',
    kpiTotalReturnHint: '(Net profit ÷ Principal)',
    kpiAnnualized: 'Annualized (converted)',
    chartTitle: 'Performance Curve',
    chartSub: 'Balance and profit over time',
    chartBalance: 'Balance',
    chartProfit: 'Profit',
    chartGain: 'Monthly gain',
    chartModeBoth: 'Balance + Profit',

    ddBoxTitleDefault: 'Return under drawdown control',

    calendarGuideTitle: 'Trading calendar missing',
    calendarGuideSub: 'Trading-day mode needs a calendar covering the full range.',
    calendarGuideStep1: 'Prepare a JSON with trading dates',
    calendarGuideStep2: 'Upload in “Import calendar” on the left',
    calendarGuideStep3: 'Make sure market and coverage match',
    calendarGuideFormat: 'See example format',
    calendarGuideExample: '{ \"market\": \"US\", \"dates\": [\"2024-01-02\", \"2024-01-03\"] }',

    scenarioTitle: 'Scenario Compare',
    scenarioSub: 'Save the current setup and compare quickly',
    scenarioSave: 'Save scenario',
    scenarioEmpty: 'No saved scenarios yet',
    scenarioRemove: 'Remove',
    scenarioBalance: 'Balance',
    scenarioProfit: 'Profit',
    scenarioDiff: 'Delta vs current',
    scenarioLabelTpl: 'Scenario {n}',

    footTitle: 'Notes:',
    footLine1: '• Precise trading-day mode accrues returns only on trading days and requires a calendar covering the full range.',
    footLine2: '• This page is for mathematical demonstration only and is not investment advice.',

    assumeTitle: 'Assumptions',
    assumeItem1: 'Fixed rates; no volatility or slippage.',
    assumeItem2: 'Fees, taxes, and transaction costs are excluded.',
    assumeItem3: 'Drawdowns are modeled events, not real market paths.',

    tipTitle: 'Info',

    errNeedCalendar: 'Trading calendar required',
    errNeedCalendarHint: 'Precise trading-day calculation requires importing a calendar that covers the whole range.',
    bannerNeedImport: '⚠️ You selected trading-day precision, but the calendar for this market is not imported. Please import a calendar that covers the range.',
    calImportedPrefix: 'Imported',
    calImportedCN: 'CN',
    calImportedUS: 'US',
    calImportedMid: 'calendar:',
    calImportedSuffix: 'trading days',
    calCoverNotEnoughPrefix: '⚠️ Calendar coverage insufficient: ',
    calCoverNeed: '. Need coverage ',
    annualHintMonthly: 'Monthly conversion: (final/principal)^(12/months)-1',
    annualHintTradingTpl: 'Precise trading-day: {start} ~ {end} (trading days: {td})',

    ddTitleSingle: 'Return under drawdown control (single DD, compare magnitudes)',
    ddHintSingle: 'Compare net profit/final balance/Peak-before-DD across magnitudes; switch worst-case or fixed month.',
    ddTitleMulti: 'Return under drawdown control (multiple DDs, manual sequence)',
    ddHintMulti: 'Apply multiple drawdowns in sequence; list Peak and post-DD balance for each event.',
    ddTitleRandom: 'Return under drawdown control (random DDs, quantiles)',
    ddHintRandom: 'Generate random drawdown sequences and repeat simulations; report P50 (median) and P90 worst (10th percentile).',

    thMonth: 'Month',
    thGain: 'Monthly gain',
    thProfit: 'Cumulative profit',
    thBalance: 'End balance',

    thDd: 'Drawdown',
    thNetProfit: 'Net profit',
    thFinalBalance: 'End balance',
    thPeak: 'Peak (before DD)',
    thWorstMonth: 'Worst month',
    thFixedMonth: 'Month',

    thMetric: 'Metric',
    thP50: 'P50 (median)',
    thP90Worst: 'P90 worst (p10)',
    thMin: 'Min',
    thMax: 'Max',

    rndMetaRuns: 'Runs: ',
    rndMetaSeed: ' | Seed: ',
    rndExplain: 'Explanation: P90 worst = 10th percentile (90% of results are not below this).',

    copyBtnCopied: 'Copied ✓',
    copyBtnDefault: 'Copy result',
    shareBtnCopied: 'Share link copied ✓',
    shareBtnDefault: 'Copy share link',
    copyFail: 'Copy failed: Clipboard access may be blocked by your browser.\nPlease copy manually.',

    copySimMonthlyTpl: 'Sim: Monthly (monthly return {mr}%)',
    copySimTradingTpl: 'Sim: Trading-day precision ({mkt}, {start} ~ {end}, trading days {td})',
    copyDailyRateTpl: 'Daily return: {dr}%',
    copyAnnualRateTpl: 'Annualized return: {ar}% (converted day-by-day by trading days per year)',
    copyPrincipalTpl: 'Principal: {p} CNY',
    copyDurationTpl: 'Duration: {m} months',
    copyModeCompound: 'Mode: Compound (reinvest)',
    copyModeSimple: 'Mode: Simple (no reinvest)',
    copyTotalTpl: 'Final amount: {v}',
    copyProfitTpl: 'Net profit: {v}',
    copyTotalReturnTpl: 'Total return: {v}',
    copyAnnualizedTpl: 'Annualized: {v}',

    alertCalParseFail: 'Trading calendar parsing failed',
    alertCalReadFail: 'Failed to read/parse calendar JSON. Please check the file.',

    mktCN: 'CN',
    mktUS: 'US',

    presetLabel: 'Quick presets',
    presetApply: 'Apply preset',
    presetSaved: 'Local save enabled',
    presetSaveFailed: 'Local save failed (calendar too large?)',

    themeDark: 'Dark',
    themeLight: 'Light',

    kbTitle: 'Keyboard shortcuts',
    kbAltL: 'Alt+L: Language toggle',
    kbAltT: 'Alt+T: Theme toggle',
    kbAltR: 'Alt+R: Reset demo',
    kbAltC: 'Alt+C: Copy result',
    kbAltS: 'Alt+S: Copy share link',
  },
};

export function t(lang, key, vars) {
  const dict = I18N[lang] || I18N.zh;
  const raw = dict[key] || '';
  if (!vars) return raw;
  return String(raw).replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] === undefined ? `{${k}}` : String(vars[k]),
  );
}
