import { I18N } from "@/lib/i18n";

type Lang = "zh" | "en";
type TranslationVars = Record<string, string | number>;

let currentLang: Lang = "zh";

function interpolate(template: string, vars?: TranslationVars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = vars[key];
    return value === undefined || value === null ? `{${key}}` : String(value);
  });
}

export function translateFor(lang: Lang, key: string, vars?: TranslationVars) {
  const primary = I18N[lang] as Record<string, string>;
  const fallback = I18N.zh as Record<string, string>;
  const template = primary[key] ?? fallback[key] ?? key;
  return interpolate(String(template), vars);
}

export function createTranslator(lang: Lang) {
  return (key: string, vars?: TranslationVars) => translateFor(lang, key, vars);
}

export function initI18n(lang: Lang) {
  currentLang = lang;
}

export function t(key: string, vars?: TranslationVars) {
  return translateFor(currentLang, key, vars);
}

export function getLang() {
  return currentLang;
}
