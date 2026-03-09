const test = require("node:test");
const assert = require("node:assert/strict");

const { DEFAULTS, sanitizeState, hydrateCalendars } = require("../.tmp-test-build/src/lib/app-state.js");

test("sanitizeState falls back to defaults on invalid enum values", () => {
  const state = sanitizeState({
    theme: "blue",
    lang: "jp",
    simMode: "weekly",
    rateMode: "hourly",
    currency: "EUR",
  });

  assert.equal(state.theme, DEFAULTS.theme);
  assert.equal(state.lang, DEFAULTS.lang);
  assert.equal(state.simMode, DEFAULTS.simMode);
  assert.equal(state.rateMode, DEFAULTS.rateMode);
  assert.equal(state.currency, DEFAULTS.currency);
});

test("sanitizeState keeps valid values and numeric fields", () => {
  const state = sanitizeState({
    theme: "light",
    lang: "en",
    simMode: "tradingDays",
    dailyRate: "0.25",
    annualRate: "12.5",
  });

  assert.equal(state.theme, "light");
  assert.equal(state.lang, "en");
  assert.equal(state.simMode, "tradingDays");
  assert.equal(state.dailyRate, 0.25);
  assert.equal(state.annualRate, 12.5);
});

test("hydrateCalendars builds set/meta/yearCount for valid date arrays", () => {
  const base = {
    CN: null,
    US: null,
    meta: { CN: null, US: null },
    yearCount: { CN: new Map(), US: new Map() },
  };

  const hydrated = hydrateCalendars(base, {
    CN: ["2025-01-02", "2025-01-03", "2025-01-03"],
    US: ["2026-01-05"],
  });

  assert.equal(hydrated.CN instanceof Set, true);
  assert.equal(hydrated.CN.size, 2);
  assert.equal(hydrated.meta.CN.count, 2);
  assert.equal(hydrated.meta.CN.min, "2025-01-02");
  assert.equal(hydrated.meta.CN.max, "2025-01-03");
  assert.equal(hydrated.yearCount.CN.get(2025), 2);

  assert.equal(hydrated.US instanceof Set, true);
  assert.equal(hydrated.US.size, 1);
  assert.equal(hydrated.meta.US.count, 1);
  assert.equal(hydrated.yearCount.US.get(2026), 1);
});
