import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en.json";
import ja from "@/locales/ja.json";
import ko from "@/locales/ko.json";
import zh from "@/locales/zh.json";
import hi from "@/locales/hi.json";

/**
 * Core Dashboard's i18n setup -- this project has had NONE until now,
 * unlike the employee portal (which already has i18next wired in) or HR
 * Dashboard (which has its own LanguageSwitcher). Deliberately simpler
 * than the portal's: this is Owner/Admin-facing, registering
 * organizations and managing billing -- there's no "company assigns your
 * language" concept here the way there is for employees. Whoever's using
 * this picks their own language freely, same as HR Dashboard's pattern.
 *
 * Starting with just English wired in. Add more locale files
 * (@/locales/ja.json, ko.json, zh.json, hi.json, ...) and register them
 * in `resources` below the same way the portal's i18n.ts does, once
 * translations for this project actually exist -- don't invent them
 * speculatively.
 *
 * Persistence: the previous version hardcoded `lng: "en"` on every init,
 * with nothing reading from or writing to storage -- so any language
 * picked via the switcher (FloatingLanguageSwitcher, the sidebar one)
 * only ever lived in memory, and a page reload silently reset back to
 * English every time. Fixed below with a plain localStorage read on
 * init + an automatic save on every future change, no extra dependency
 * needed for this.
 */
const STORAGE_KEY = "ants.core.language";

function getStoredLanguage(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "en";
  } catch {
    // localStorage can throw in some locked-down browser contexts
    // (private browsing in older Safari, etc.) -- fall back to English
    // rather than crash the whole app over a persistence nicety.
    return "en";
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ja: { translation: ja },
    ko: { translation: ko },
    zh: { translation: zh },
    hi: { translation: hi },
  },
  lng: getStoredLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Persists every future change automatically -- this fires on every
// i18n.changeLanguage() call from anywhere (the floating switcher, the
// sidebar one), so neither of those call sites needs to remember to
// save anything themselves.
i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // Same reasoning as getStoredLanguage() above -- persistence is a
    // nicety, not worth crashing over if storage is unavailable.
  }
});

export default i18n;