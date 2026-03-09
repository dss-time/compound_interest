const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DOCUMENT_META_KEY,
  parseDocumentMeta,
  readStoredDocumentMeta,
  sanitizeDocumentMeta,
} = require("../.tmp-test-build/src/lib/document-meta.js");

test("sanitizeDocumentMeta keeps only lang and theme", () => {
  const meta = sanitizeDocumentMeta({ lang: "en", theme: "light", principal: 100 });
  assert.deepEqual(meta, { lang: "en", theme: "light" });
});

test("parseDocumentMeta falls back to dark zh on invalid payload", () => {
  assert.equal(parseDocumentMeta("{"), null);
});

test("readStoredDocumentMeta prefers explicit meta key", () => {
  const storage = {
    getItem(key) {
      if (key === DOCUMENT_META_KEY) return JSON.stringify({ lang: "en", theme: "light" });
      if (key === "ci_settings_v1") return JSON.stringify({ lang: "zh", theme: "dark" });
      return null;
    },
  };

  assert.deepEqual(readStoredDocumentMeta(storage), { lang: "en", theme: "light" });
});

test("readStoredDocumentMeta falls back to full state storage", () => {
  const storage = {
    getItem(key) {
      if (key === DOCUMENT_META_KEY) return null;
      if (key === "ci_settings_v1") return JSON.stringify({ lang: "en", theme: "light", principal: 1000 });
      return null;
    },
  };

  assert.deepEqual(readStoredDocumentMeta(storage), { lang: "en", theme: "light" });
});
