import Decimal from "decimal.js";
import {
  addMonths,
  clamp,
  daysDiff,
  isISODate,
  parsePctList,
  parseSeq,
  quantile,
  hashSeed,
  mulberry32,
  toISODate,
} from "./utils";

const normalizeKey = (k) => String(k || '').trim().toLowerCase();
const mapMarketKey = (k) => {
  const nk = normalizeKey(k);
  if (['cn', 'a股', 'ashare', 'china', 'sse', 'szse'].includes(nk)) return 'CN';
  if (['us', '美股', 'usa', 'nyse', 'nasdaq'].includes(nk)) return 'US';
  return null;
};

export function initCalendars() {
  return {
    CN: null,
    US: null,
    meta: { CN: null, US: null },
    yearCount: { CN: new Map(), US: new Map() },
  };
}

export function buildYearCountFromISOList(isoList) {
  const m = new Map();
  for (const iso of isoList) {
    const y = Number(String(iso).slice(0, 4));
    if (!isFinite(y)) continue;
    m.set(y, (m.get(y) || 0) + 1);
  }
  return m;
}

export function setCalendar(calendars, market, dates, source) {
  const arr = (dates || [])
    .map(String)
    .map((d) => d.trim())
    .filter((d) => isISODate(d));

  const uniq = Array.from(new Set(arr)).sort();
  const next = { ...calendars };
  next[market] = new Set(uniq);
  next.meta = {
    ...next.meta,
    [market]: {
      count: uniq.length,
      min: uniq[0] || null,
      max: uniq[uniq.length - 1] || null,
      source,
    },
  };
  next.yearCount = {
    ...next.yearCount,
    [market]: buildYearCountFromISOList(uniq),
  };
  return next;
}

export function parseCalendarJSON(raw, currentMarket, t) {
  const data = JSON.parse(raw);

  if (Array.isArray(data)) {
    return { ok: true, updates: [{ market: currentMarket, dates: data }] };
  }

  if (data && typeof data === 'object') {
    const updates = [];
    for (const [k, v] of Object.entries(data)) {
      const mk = mapMarketKey(k) || (k === 'CN' || k === 'US' ? k : null);
      if (!mk) continue;
      if (Array.isArray(v)) updates.push({ market: mk, dates: v });
    }
    if (updates.length) return { ok: true, updates };
  }

  return { ok: false, error: t('alertCalParseFail') };
}

export function calendarCoversRange(calendars, market, startISO, endISOExclusive, lang) {
  const meta = calendars.meta[market];
  if (!meta || !meta.min || !meta.max) {
    return { ok: false, reason: lang === 'zh' ? '未导入' : 'not imported' };
  }

  const endDate = new Date(endISOExclusive + 'T00:00:00');
  endDate.setDate(endDate.getDate() - 1);
  const lastNeeded = toISODate(endDate);

  if (startISO < meta.min) {
    return {
      ok: false,
      reason: lang === 'zh' ? `缺少起始段（最早只有 ${meta.min}）` : `missing beginning (earliest is ${meta.min})`,
    };
  }
  if (lastNeeded > meta.max) {
    return {
      ok: false,
      reason: lang === 'zh' ? `缺少末尾段（最晚只有 ${meta.max}）` : `missing ending (latest is ${meta.max})`,
    };
  }
  return { ok: true };
}

export function listTradingDatesStrict(calendars, start, endExclusive, market, t) {
  const set = calendars[market];
  if (!set) return { ok: false, error: t('errNeedCalendarHint') };

  const out = [];
  const d = new Date(start.getTime());
  while (d < endExclusive) {
    const iso = toISODate(d);
    if (set.has(iso)) out.push(new Date(d.getTime()));
    d.setDate(d.getDate() + 1);
  }
  return { ok: true, dates: out };
}

export function tradingDaysInYear(calendars, market, year) {
  const yc = calendars.yearCount[market];
  if (!yc || !yc.size) return null;
  const n = yc.get(year);
  return n || 0;
}

export function calcMonthlyTimeline({ principal, monthlyRate, months, mode, events }) {
  const principalD = new Decimal(principal);
  const r = new Decimal(monthlyRate || 0);
  let balance = principalD;
  let peak = principalD;

  const evMap = new Map();
  (events || []).forEach((e) => {
    const key = String(e.month);
    if (!evMap.has(key)) evMap.set(key, []);
    evMap.get(key).push({ dd: e.dd });
  });

  const rows = [];
  const appliedEvents = [];
  const gainPerMonth = principalD.mul(r);

  for (let i = 1; i <= months; i++) {
    const gain = mode === "compound" ? balance.mul(r) : gainPerMonth;
    balance = balance.add(gain);
    if (balance.gt(peak)) peak = balance;

    const list = evMap.get(String(i)) || [];
    for (const e of list) {
      const dd = new Decimal(clamp(e.dd / 100, 0, 0.999999));
      const peakBefore = peak;
      balance = peakBefore.mul(new Decimal(1).minus(dd));
      if (balance.gt(peak)) peak = balance;
      appliedEvents.push({
        month: i,
        dd: e.dd,
        peakBefore: peakBefore.toNumber(),
        balanceAfter: balance.toNumber(),
      });
    }

    const profit = balance.minus(principalD);
    rows.push({
      m: i,
      balance: balance.toNumber(),
      gain: gain.toNumber(),
      profit: profit.toNumber(),
      peak: peak.toNumber(),
    });
  }

  const profit = balance.minus(principalD);
  const totalReturn = principalD.gt(0) ? profit.div(principalD).toNumber() : 0;
  const annualized =
    principalD.gt(0) && months > 0
      ? balance.div(principalD).pow(new Decimal(12).div(months)).minus(1).toNumber()
      : 0;

  return {
    balance: balance.toNumber(),
    profit: profit.toNumber(),
    totalReturn,
    annualized,
    rows,
    appliedEvents,
    extra: { monthsElapsed: months },
  };
}

export function calcTradingDaysTimelineStrict({
  calendars,
  principal,
  startDate,
  months,
  mode,
  market,
  rateMode,
  dailyRateDecimal,
  annualRateDecimal,
  eventsByMonth,
  t,
  lang,
}) {
  const start = new Date(startDate.getTime());
  const endExclusive = addMonths(start, months);
  const startISO = toISODate(start);
  const endISO = toISODate(endExclusive);

  const cover = calendarCoversRange(calendars, market, startISO, endISO, lang);
  if (!cover.ok) {
    return {
      ok: false,
      error:
        lang === 'zh'
          ? `交易日历覆盖不足：${cover.reason}。需要覆盖区间 ${startISO} ~ ${toISODate(new Date(endExclusive.getTime() - 86400000))}。`
          : `Calendar coverage insufficient: ${cover.reason}. Need coverage ${startISO} ~ ${toISODate(new Date(endExclusive.getTime() - 86400000))}.`,
      extra: { startISO, endISO },
    };
  }

  const { ok, dates, error } = listTradingDatesStrict(calendars, start, endExclusive, market, t);
  if (!ok) {
    return { ok: false, error: error || t('errNeedCalendarHint'), extra: { startISO, endISO } };
  }

  const principalD = new Decimal(principal);
  let balance = principalD;
  let peak = principalD;

  const appliedEvents = [];
  const rows = [];

  let currentMonthIdx = 1;
  let monthEndExclusive = addMonths(start, 1);
  let monthGain = new Decimal(0);

  const gainPerDaySimpleFixed = principalD.mul(dailyRateDecimal || 0);

  const flushMonth = (monthIdx) => {
    const monthProfit = balance.minus(principalD);
    rows.push({
      m: monthIdx,
      balance: balance.toNumber(),
      gain: monthGain.toNumber(),
      profit: monthProfit.toNumber(),
      peak: peak.toNumber(),
    });
    monthGain = new Decimal(0);
  };

  const getDailyRateForDate = (d) => {
    if (rateMode === 'daily') return dailyRateDecimal || 0;

    const ann = annualRateDecimal || 0;
    const y = d.getFullYear();
    const n = tradingDaysInYear(calendars, market, y);
    if (!n || n <= 0) return null;

    return Math.pow(1 + ann, 1 / n) - 1;
  };

  for (const d of dates) {
    while (d >= monthEndExclusive && currentMonthIdx <= months) {
      const evs = eventsByMonth.get(String(currentMonthIdx)) || [];
      for (const e of evs) {
        const dd = new Decimal(clamp(e.dd / 100, 0, 0.999999));
        const peakBefore = peak;
        balance = peakBefore.mul(new Decimal(1).minus(dd));
        if (balance.gt(peak)) peak = balance;
        appliedEvents.push({
          month: currentMonthIdx,
          dd: e.dd,
          peakBefore: peakBefore.toNumber(),
          balanceAfter: balance.toNumber(),
        });
      }
      flushMonth(currentMonthIdx);
      currentMonthIdx++;
      monthEndExclusive = addMonths(start, currentMonthIdx);
    }

    if (currentMonthIdx > months) break;

    const rDay = getDailyRateForDate(d);
    if (rDay === null) {
      return {
        ok: false,
        error:
          lang === 'zh'
            ? `年化折算失败：交易日历缺少年份 ${d.getFullYear()} 的完整交易日统计（请导入该年完整日历）。`
            : `Annualized conversion failed: missing full-year trading-day stats for ${d.getFullYear()} (please import the full calendar for that year).`,
        extra: { startISO, endISO },
      };
    }

    const gain =
      mode === "compound"
        ? balance.mul(rDay)
        : rateMode === "daily"
        ? gainPerDaySimpleFixed
        : principalD.mul(rDay);
    balance = balance.add(gain);
    monthGain = monthGain.add(gain);
    if (balance.gt(peak)) peak = balance;
  }

  while (currentMonthIdx <= months) {
    const evs = eventsByMonth.get(String(currentMonthIdx)) || [];
    for (const e of evs) {
      const dd = new Decimal(clamp(e.dd / 100, 0, 0.999999));
      const peakBefore = peak;
      balance = peakBefore.mul(new Decimal(1).minus(dd));
      if (balance.gt(peak)) peak = balance;
      appliedEvents.push({
        month: currentMonthIdx,
        dd: e.dd,
        peakBefore: peakBefore.toNumber(),
        balanceAfter: balance.toNumber(),
      });
    }
    flushMonth(currentMonthIdx);
    currentMonthIdx++;
  }

  const profit = balance.minus(principalD);
  const totalReturn = principalD.gt(0) ? profit.div(principalD).toNumber() : 0;

  const calDays = Math.max(1, daysDiff(start, endExclusive));
  const years = calDays / 365.25;
  const annualized =
    principalD.gt(0) && years > 0 ? balance.div(principalD).pow(new Decimal(1).div(years)).minus(1).toNumber() : 0;

  return {
    ok: true,
    balance: balance.toNumber(),
    profit: profit.toNumber(),
    totalReturn,
    annualized,
    rows,
    appliedEvents,
    extra: {
      startISO,
      endISO,
      tradingDays: dates.length,
      calendarDays: calDays,
    },
  };
}

export function buildEventsMapFromSingle(month, dd) {
  const map = new Map();
  map.set(String(month), [{ dd }]);
  return map;
}

export function buildEventsMapFromSeq(seq) {
  const map = new Map();
  seq.forEach((e) => {
    const k = String(e.month);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push({ dd: e.dd });
  });
  return map;
}

export function calcSingleDrawdown(params) {
  if (params.simMode === 'monthly') {
    const tl = calcMonthlyTimeline({
      principal: params.principal,
      monthlyRate: params.monthlyRate,
      months: params.months,
      mode: params.mode,
      events: [{ dd: params.drawdownPct, month: params.drawdownMonth }],
    });
    const ev = tl.appliedEvents[0] || null;
    return {
      ok: true,
      dd: params.drawdownPct,
      month: params.drawdownMonth,
      finalBalance: tl.balance,
      finalProfit: tl.profit,
      peakBefore: ev ? ev.peakBefore : NaN,
    };
  }

  const eventsByMonth = buildEventsMapFromSingle(params.drawdownMonth, params.drawdownPct);
  const tl = calcTradingDaysTimelineStrict({
    calendars: params.calendars,
    principal: params.principal,
    startDate: params.startDate,
    months: params.months,
    mode: params.mode,
    market: params.market,
    rateMode: params.rateMode,
    dailyRateDecimal: params.dailyRateDecimal,
    annualRateDecimal: params.annualRateDecimal,
    eventsByMonth,
    t: params.t,
    lang: params.lang,
  });

  if (!tl.ok) return { ok: false, error: tl.error };

  const ev = tl.appliedEvents.find((e) => e.month === params.drawdownMonth) || null;
  return {
    ok: true,
    dd: params.drawdownPct,
    month: params.drawdownMonth,
    finalBalance: tl.balance,
    finalProfit: tl.profit,
    peakBefore: ev ? ev.peakBefore : NaN,
  };
}

export function calcWorstSingle(params) {
  let best = null;
  for (let m = 1; m <= params.months; m++) {
    const r = calcSingleDrawdown({ ...params, drawdownMonth: m });
    if (!r.ok) return r;
    if (!best || r.finalBalance < best.finalBalance) best = r;
  }
  return (
    best || {
      ok: true,
      dd: params.drawdownPct,
      month: 0,
      finalBalance: params.principal,
      finalProfit: 0,
      peakBefore: NaN,
    }
  );
}

export function sampleUniqueMonths(rng, months, count) {
  const n = clamp(Math.floor(count), 0, months);
  const idx = Array.from({ length: months }, (_, i) => i + 1);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, n).sort((a, b) => a - b);
}

export function simulateRandom(params) {
  const pool = params.ddPool.length ? params.ddPool : [10];
  const runsN = clamp(Math.floor(params.runs), 10, 200000);

  const seedFinal = (params.seedStr || 'auto').trim().toLowerCase() === 'auto' ? String(Date.now()) + Math.random() : params.seedStr;

  const seedFn = hashSeed(seedFinal);
  const rng = mulberry32(seedFn());

  const finalsBalance = [];
  const finalsProfit = [];

  const prob = clamp((Number(params.probPct) || 0) / 100, 0, 1);
  const cnt = clamp(Math.floor(Number(params.count) || 0), 0, params.months);

  for (let i = 0; i < runsN; i++) {
    const events = [];
    if (params.method === 'count') {
      const monthsSel = sampleUniqueMonths(rng, params.months, cnt);
      monthsSel.forEach((m) => {
        const dd = pool[Math.floor(rng() * pool.length)];
        events.push({ dd, month: m });
      });
    } else {
      for (let m = 1; m <= params.months; m++) {
        if (rng() < prob) {
          const dd = pool[Math.floor(rng() * pool.length)];
          events.push({ dd, month: m });
        }
      }
    }

    let tl;
    if (params.simMode === 'monthly') {
      tl = calcMonthlyTimeline({
        principal: params.principal,
        monthlyRate: params.monthlyRate,
        months: params.months,
        mode: params.mode,
        events,
      });
    } else {
      tl = calcTradingDaysTimelineStrict({
        calendars: params.calendars,
        principal: params.principal,
        startDate: params.startDate,
        months: params.months,
        mode: params.mode,
        market: params.market,
        rateMode: params.rateMode,
        dailyRateDecimal: params.dailyRateDecimal,
        annualRateDecimal: params.annualRateDecimal,
        eventsByMonth: buildEventsMapFromSeq(events),
        t: params.t,
        lang: params.lang,
      });
      if (!tl.ok) return { ok: false, error: tl.error };
    }

    finalsBalance.push(tl.balance);
    finalsProfit.push(tl.profit);
  }

  finalsBalance.sort((a, b) => a - b);
  finalsProfit.sort((a, b) => a - b);

  return {
    ok: true,
    seedUsed: seedFinal,
    runs: runsN,
    balance: {
      p50: quantile(finalsBalance, 0.5),
      p90Worst: quantile(finalsBalance, 0.1),
      min: finalsBalance[0],
      max: finalsBalance[finalsBalance.length - 1],
    },
    profit: {
      p50: quantile(finalsProfit, 0.5),
      p90Worst: quantile(finalsProfit, 0.1),
      min: finalsProfit[0],
      max: finalsProfit[finalsProfit.length - 1],
    },
  };
}

export { parsePctList, parseSeq };
