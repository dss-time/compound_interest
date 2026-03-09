const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeTheme,
  nextThemeFromCurrent,
  nextThemeFromDomHasDark,
} = require("../.tmp-test-build/src/lib/theme.js");

test("normalizeTheme defaults to dark for invalid values", () => {
  assert.equal(normalizeTheme("foo"), "dark");
  assert.equal(normalizeTheme(undefined), "dark");
});

test("normalizeTheme keeps light/dark", () => {
  assert.equal(normalizeTheme("light"), "light");
  assert.equal(normalizeTheme("dark"), "dark");
});

test("nextThemeFromCurrent toggles correctly", () => {
  assert.equal(nextThemeFromCurrent("dark"), "light");
  assert.equal(nextThemeFromCurrent("light"), "dark");
});

test("nextThemeFromDomHasDark toggles from class state", () => {
  assert.equal(nextThemeFromDomHasDark(true), "light");
  assert.equal(nextThemeFromDomHasDark(false), "dark");
});
