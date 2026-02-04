import i18next from "i18next";

import { I18N } from "@/lib/i18n";

const resources = {
  zh: { translation: I18N.zh },
  en: { translation: I18N.en },
};

let initialized = false;

export function initI18n(lang: "zh" | "en") {
  if (initialized) {
    i18next.changeLanguage(lang);
    return;
  }
  i18next.init({
    resources,
    lng: lang,
    fallbackLng: "zh",
    interpolation: {
      escapeValue: false,
      prefix: "{",
      suffix: "}",
    },
  });
  initialized = true;
}

export function t(key: string, vars?: Record<string, string | number>) {
  return i18next.t(key, vars as any) as string;
}
