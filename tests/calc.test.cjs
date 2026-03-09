const test = require("node:test");
const assert = require("node:assert/strict");

const {
  initCalendars,
  setCalendar,
  parseCalendarJSON,
  calendarCoversRange,
  calcMonthlyTimeline,
  sampleUniqueMonths,
  calcTradingDaysTimelineStrict,
} = require("../.tmp-test-build/src/lib/calc.js");

test("parseCalendarJSON maps market aliases and object payload", () => {
  const t = (k) => k;
  const raw = JSON.stringify({
    cn: ["2026-01-02"],
    usa: ["2026-01-05"],
    other: ["2026-01-01"],
  });
  const res = parseCalendarJSON(raw, "CN", t);
  assert.equal(res.ok, true);
  assert.equal(res.updates.length, 2);
  assert.equal(res.updates[0].market, "CN");
  assert.equal(res.updates[1].market, "US");
});

test("calendarCoversRange reports missing beginning and ending", () => {
  let calendars = initCalendars();
  calendars = setCalendar(calendars, "CN", ["2026-01-05", "2026-01-06", "2026-01-07"], "local");

  const missStart = calendarCoversRange(calendars, "CN", "2026-01-03", "2026-01-08", "zh");
  assert.equal(missStart.ok, false);
  assert.equal(String(missStart.reason).includes("起始"), true);

  const missEnd = calendarCoversRange(calendars, "CN", "2026-01-05", "2026-01-10", "en");
  assert.equal(missEnd.ok, false);
  assert.equal(String(missEnd.reason).includes("ending"), true);
});

test("calcMonthlyTimeline handles zero months safely", () => {
  const tl = calcMonthlyTimeline({
    principal: 1000,
    monthlyRate: 0.02,
    months: 0,
    mode: "compound",
    events: [],
  });

  assert.equal(tl.balance, 1000);
  assert.equal(tl.profit, 0);
  assert.equal(tl.totalReturn, 0);
  assert.equal(tl.annualized, 0);
  assert.equal(Array.isArray(tl.rows), true);
  assert.equal(tl.rows.length, 0);
});

test("sampleUniqueMonths clamps and returns sorted unique months", () => {
  const rng = () => 0.3;
  const out = sampleUniqueMonths(rng, 6, 99);
  assert.equal(out.length, 6);
  assert.deepEqual([...new Set(out)], out);
  const sorted = [...out].sort((a, b) => a - b);
  assert.deepEqual(out, sorted);
});

test("calcTradingDaysTimelineStrict returns clear error when calendar is missing", () => {
  const t = (k) => k;
  const calendars = initCalendars();
  const res = calcTradingDaysTimelineStrict({
    calendars,
    principal: 1000,
    startDate: new Date("2026-01-01T00:00:00"),
    months: 1,
    mode: "compound",
    market: "CN",
    rateMode: "daily",
    dailyRateDecimal: 0.001,
    annualRateDecimal: 0.1,
    eventsByMonth: new Map(),
    t,
    lang: "zh",
  });
  assert.equal(res.ok, false);
  assert.equal(String(res.error).includes("交易日历覆盖不足"), true);
});
