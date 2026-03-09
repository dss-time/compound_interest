const test = require("node:test");
const assert = require("node:assert/strict");

const { DEFAULTS } = require("../.tmp-test-build/src/lib/app-state.js");
const { buildHydratedStatePatch } = require("../.tmp-test-build/src/lib/persistence.js");

test("buildHydratedStatePatch returns null for empty sources", () => {
  assert.equal(buildHydratedStatePatch(null, null), null);
});

test("buildHydratedStatePatch hydrates from storage", () => {
  const patch = buildHydratedStatePatch({ theme: "light", lang: "en" }, null);
  assert.equal(patch.theme, undefined);
  assert.equal(patch.lang, undefined);
  assert.equal(patch.currency, DEFAULTS.currency);
});

test("buildHydratedStatePatch never lets storage or share override lang/theme", () => {
  const patch = buildHydratedStatePatch({ theme: "light", lang: "zh" }, { theme: "dark", lang: "en" });
  assert.equal(patch.theme, undefined);
  assert.equal(patch.lang, undefined);
});

test("buildHydratedStatePatch sanitizes non-meta source values", () => {
  const patch = buildHydratedStatePatch({ theme: "invalid", currency: "EUR" }, null);
  assert.equal(patch.theme, undefined);
  assert.equal(patch.currency, "CNY");
});
