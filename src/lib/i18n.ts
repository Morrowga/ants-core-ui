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
 */
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ja: { translation: ja },
    ko: { translation: ko },
    zh: { translation: zh },
    hi: { translation: hi },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;