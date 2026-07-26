import { useTranslation } from "react-i18next";

/** Full names shown in the dropdown, keyed by i18next language code.
 * Only used for DISPLAY -- which languages actually WORK is entirely
 * driven by what's registered in src/lib/i18n.ts's `resources` (today,
 * just "en"). Add a real locale file + register it there, and it'll
 * show up here automatically with no further change to this component.
 * Add its display name (and flag, below) here too, once it exists --
 * these maps are purely cosmetic and never gate whether a language is
 * actually usable. */
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  ja: "日本語",
  ko: "한국어",
  zh: "中文",
  hi: "हिन्दी",
};

/** English is tied to no single country -- 🇺🇸 picked as the common
 * convention for language switchers; swap to 🇬🇧 if you'd rather. */
// const LANGUAGE_FLAGS: Record<string, string> = {
//   en: "🇺🇸",
//   ja: "🇯🇵",
//   ko: "🇰🇷",
//   zh: "🇨🇳",
//   hi: "🇮🇳",
// };

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const available = Object.keys(i18n.options.resources ?? {});

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      aria-label={t("features.sidebar.languageAriaLabel")}
      className="w-full rounded-md border border-sidebar-active/20 bg-transparent px-3 py-2 text-sm text-sidebar-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-active"
    >
      {available.map((code) => (
        <option key={code} value={code} className="text-foreground">
          {/* {LANGUAGE_FLAGS[code] ? `${LANGUAGE_FLAGS[code]} ` : ""} */}
          {LANGUAGE_NAMES[code] ?? code}
        </option>
      ))}
    </select>
  );
}