import { DEFAULTS, STORAGE_KEY, type Lang, type Theme, sanitizeState } from "./app-state";
import { safeJsonParse } from "./utils";

export const DOCUMENT_META_KEY = "ci_document_meta_v1";

export type DocumentMeta = {
  lang: Lang;
  theme: Theme;
};

export function sanitizeDocumentMeta(raw: unknown): DocumentMeta {
  const next = sanitizeState(raw);
  return {
    lang: next.lang,
    theme: next.theme,
  };
}

export function parseDocumentMeta(raw: string | null | undefined): DocumentMeta | null {
  if (!raw) return null;
  const parsed = safeJsonParse(raw);
  if (!parsed.ok) return null;
  return sanitizeDocumentMeta(parsed.data);
}

export function readStoredDocumentMeta(
  storage: Pick<Storage, "getItem"> | null | undefined
): DocumentMeta {
  if (!storage) return { lang: DEFAULTS.lang, theme: DEFAULTS.theme };

  const explicit = parseDocumentMeta(storage.getItem(DOCUMENT_META_KEY));
  if (explicit) return explicit;

  const fromState = parseDocumentMeta(storage.getItem(STORAGE_KEY));
  if (fromState) return fromState;

  return { lang: DEFAULTS.lang, theme: DEFAULTS.theme };
}
