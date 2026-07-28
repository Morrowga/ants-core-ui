import { AnimatePresence, motion } from "motion/react";
import { Home, LifeBuoy, LogIn, Mail, Tag, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import logo from "@/assets/logo.png";

/** Two mirrored vertical arcs -- like "(" on the left and ")" on the
 * right -- each bulging OUTWARD at the vertical middle and tucking back
 * toward center at top and bottom. Right arc uses `right` (not `left`)
 * so cards can never run off the right edge of the viewport regardless
 * of card width. Desktop only -- see MobileFeatureCard for the small-
 * screen equivalent. */
const LEFT_ARC = [
  { top: "8%", left: "18%", rotate: 12 },
  { top: "26%", left: "10%", rotate: 6 },
  { top: "50%", left: "5%", rotate: 0 },
  { top: "74%", left: "10%", rotate: -6 },
];
const RIGHT_ARC = [
  { top: "8%", right: "18%", rotate: -12 },
  { top: "26%", right: "10%", rotate: -6 },
  { top: "50%", right: "5%", rotate: 0 },
  { top: "74%", right: "10%", rotate: 6 },
];
const SLOT_POSITIONS = [...LEFT_ARC, ...RIGHT_ARC];

type SlotPosition = { top: string; left?: string; right?: string; rotate: number };

/** Chat-bubble-style avatar badge -- picked once per card instance (not
 * re-picked when the card's text cycles), so it reads as "one sender,"
 * not a new random person every 4 seconds. Shared between the desktop
 * scattered cards and the single mobile card below. */
const AVATAR_COLORS = [
  "bg-red-400", "bg-blue-400", "bg-green-400", "bg-yellow-400",
  "bg-purple-400", "bg-pink-400", "bg-indigo-400", "bg-teal-400", "bg-orange-400",
];
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomAvatar() {
  return {
    letter: ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
    color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  };
}

/** One background card slot (desktop) -- independently cycles through a
 * rotated slice of the translated feature-card text pool on its own
 * timer, offset by `startDelayMs` so slots never change in sync with
 * each other. */
function FeatureCardSlot({
  texts,
  startDelayMs,
  position,
}: {
  texts: string[];
  startDelayMs: number;
  position: SlotPosition;
}) {
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [avatar] = useState(randomAvatar);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), startDelayMs);
    return () => clearTimeout(startTimer);
  }, [startDelayMs]);

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % texts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [started, texts.length]);

  if (!started) return null;

  // Right-arc cards (positioned via `right`) get the badge on the
  // bottom-RIGHT instead of bottom-left -- mirrors like a chat bubble
  // pointing toward the side the card actually sits on.
  const badgeOnRight = position.right !== undefined;

  return (
    <div
      className="pointer-events-none absolute w-56 sm:w-64"
      style={{ top: position.top, left: position.left, right: position.right }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={texts[index]}
          initial={{ opacity: 0, y: 16, scale: 0.94, rotate: position.rotate }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: position.rotate }}
          exit={{ opacity: 0, y: -16, scale: 0.94, rotate: position.rotate }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="relative rounded-xl border bg-white p-4 text-sm font-medium text-espresso"
          style={{
            borderColor: "hsl(23 33% 32% / 0.1)",
            boxShadow: "0 4px 12px -4px hsla(23, 33%, 32%, 0.15)",
          }}
        >
          <div
            className={`absolute -bottom-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ${avatar.color} ${badgeOnRight ? "-right-4" : "-left-4"}`}
          >
            {avatar.letter}
          </div>
          {texts[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Mobile-only equivalent of the desktop scattered cards -- a single
 * card, in normal document flow (not absolutely positioned/scattered),
 * placed right after the scroll-down button. Cycles through the same
 * translated feature-card text pool and picks a new random avatar color
 * EVERY time the text changes (unlike the desktop version, which picks
 * one avatar per slot and keeps it fixed) -- with only one card on
 * screen there's no "multiple senders" concept to preserve, so
 * re-randomizing per message reads fine and adds a bit more variety in
 * a small space. */
function MobileFeatureCard({ featureCards }: { featureCards: string[] }) {
  const [index, setIndex] = useState(0);
  const [avatar, setAvatar] = useState(randomAvatar);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % featureCards.length);
      setAvatar(randomAvatar());
    }, 4000);
    return () => clearInterval(interval);
  }, [featureCards.length]);

  return (
    <div className="mt-6 w-full max-w-xs lg:hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={featureCards[index]}
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.94 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="relative rounded-xl border bg-white p-4 text-sm font-medium text-espresso"
          style={{
            borderColor: "hsl(23 33% 32% / 0.1)",
            boxShadow: "0 4px 12px -4px hsla(23, 33%, 32%, 0.15)",
          }}
        >
          <div
            className={`absolute -bottom-4 -left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ${avatar.color}`}
          >
            {avatar.letter}
          </div>
          {featureCards[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** One icon-only action button with a tooltip that fades/rises in on
 * hover (motion-driven, not a plain CSS transition, to stay consistent
 * with every other animation on this page). `to` renders a router Link
 * (Login/Register); `href` renders a plain in-page anchor (Pricing/
 * Support/Contact -- these scroll to sections already on this same
 * page, they don't need a route). */
function IconAction({
  icon: Icon,
  label,
  to,
  href,
}: {
  icon: typeof LogIn;
  label: string;
  to?: string;
  href?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const content = (
    <span
      className="flex h-12 w-12 items-center justify-center rounded-full border bg-white text-espresso shadow-lg shadow-espresso/10 transition-transform hover:scale-105"
      style={{ borderColor: "hsl(23 33% 32%)" }}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </span>
  );

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {to ? (
        <Link to={to} aria-label={label}>{content}</Link>
      ) : (
        <a href={href} aria-label={label}>{content}</a>
      )}
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium text-white shadow-md"
            style={{ backgroundColor: "hsl(23 33% 32%)" }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Public-landing-page language switcher -- distinct from the
 * authenticated app's sidebar LanguageSwitcher. Circular FAB, bottom-
 * left. Tapping it reveals one circle per available language stacked
 * upward above the main button. Reads available languages from i18n.ts's
 * registered `resources`, same as the sidebar version, so it grows
 * automatically as more locale files get added -- no change needed here. */
const LANGUAGE_FLAGS: Record<string, string> = {
  en: "🇺🇸", ja: "🇯🇵", ko: "🇰🇷", zh: "🇨🇳", hi: "🇮🇳",
};

export function FloatingLanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const available = Object.keys(i18n.options.resources ?? {});

  return (
    <div className="fixed bottom-6 left-6 z-30 flex flex-col-reverse items-center gap-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("features.landing.hero.changeLanguage")}
        aria-expanded={open}
        className="flex h-12 w-12 items-center justify-center rounded-full border bg-white text-lg shadow-lg shadow-espresso/10 transition-transform hover:scale-105"
        style={{ borderColor: "hsl(23 33% 32%)" }}
      >
        {LANGUAGE_FLAGS[i18n.language] ?? "🌐"}
      </button>
      <AnimatePresence>
        {open &&
          available
            .filter((code) => code !== i18n.language)
            .map((code, i) => (
              <motion.button
                key={code}
                type="button"
                onClick={() => {
                  i18n.changeLanguage(code);
                  setOpen(false);
                }}
                initial={{ opacity: 0, y: 12, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.7 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="flex h-11 w-11 items-center justify-center rounded-full border bg-white text-base shadow-md shadow-espresso/10 hover:scale-105"
                style={{ borderColor: "hsl(23 33% 32%)" }}
              >
                {LANGUAGE_FLAGS[code] ?? code}
              </motion.button>
            ))}
      </AnimatePresence>
    </div>
  );
}

/** Increments every time the tab becomes visible again after being
 * backgrounded. Browsers throttle/pause JS timers and
 * requestAnimationFrame-driven animations (which is what Motion's
 * `animate` with repeat: Infinity uses under the hood) while a tab is
 * hidden -- when the tab regains focus, those can glitch or briefly
 * "catch up" trying to resume from a drifted state. Using this as a
 * React `key` on the affected elements forces a full clean remount
 * instead, so everything restarts from scratch rather than trying to
 * resume mid-animation. */
function useVisibilityRemountKey() {
  const [key, setKey] = useState(0);
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setKey((k) => k + 1);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);
  return key;
}

export function HeroSection() {
  const { t } = useTranslation();
  const { claims } = useAuth();
  const remountKey = useVisibilityRemountKey();

  // First-person, in-the-moment messages -- written the way an employee
  // would actually type them, not narrator-voice marketing copy. Each
  // one still maps to a real, shipped feature -- just shown as the
  // moment itself, not a description of it. Sourced from i18n now
  // (features.landing.hero.featureCards, an array -- needs
  // returnObjects: true to come back as one instead of a joined string).
  const featureCards = t("features.landing.hero.featureCards", {
    returnObjects: true,
  }) as string[];

  // Each slot gets a rotated slice of the same feature list, so no two
  // slots ever show the same line at the same time even though they all
  // draw from the same pool -- plus a staggered start delay per slot.
  const slots = SLOT_POSITIONS.map((position, i) => {
    const rotated = [
      ...featureCards.slice(i * 2),
      ...featureCards.slice(0, i * 2),
    ];
    return { position, texts: rotated, startDelayMs: i * 700 };
  });

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Curved divider (fill set inline, not via a fill-espresso
          class -- see prior note: that utility isn't reliably
          generated for custom colors here). */}
      <svg
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0,0 L50,0 C42,25 58,75 50,100 L0,100 Z"
          style={{ fill: "hsl(210 20% 80%)", fillOpacity: 0.3 }}
        />
        <path
          d="M50,0 C42,25 58,75 50,100 L100,100 L100,0 Z"
          style={{ fill: "hsl(23 33% 32%)", fillOpacity: 0.7 }}
        />
      </svg>
      {/* Cinematic background layer -- DESKTOP ONLY now (hidden lg:block).
          key={remountKey} forces a full reset of every card's cycling
          state on tab refocus, instead of resuming from wherever a
          throttled setInterval had drifted to. */}
      <div key={remountKey} className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
        {slots.map((slot, i) => (
          <FeatureCardSlot key={i} {...slot} />
        ))}
      </div>

      {/* Foreground content -- headline + icon actions, above the cards. */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center sm:px-12 lg:px-20">
        <div className="flex w-full flex-col items-start gap-2 text-left">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-row items-center gap-1"
          >
            <img src={logo} alt="" className="h-[112px] w-[112px] object-contain" />
            {/* "ANTS" is the brand name, not translated. */}
            <span className="font-display text-6xl font-bold text-espresso">ANTS</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{
              textShadow:
                "1px 1.5px 5px rgba(0, 0, 0, 0.14), 2px 3px 10px rgba(0, 0, 0, 0.08)",
            }}
            className="text-4xl font-semibold tracking-tight text-espresso sm:text-6xl"
          >
            {t("features.landing.hero.headline")}
          </motion.h1>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {claims ? (
            <IconAction icon={Home} label={t("features.landing.hero.actions.home")} to="/companies" />
          ) : (
            <>
              <IconAction icon={LogIn} label={t("features.landing.hero.actions.login")} to="/login" />
              <IconAction icon={UserPlus} label={t("features.landing.hero.actions.register")} to="/register" />
            </>
          )}
          <IconAction icon={Tag} label={t("features.landing.hero.actions.pricing")} href="#pricing" />
          <IconAction icon={LifeBuoy} label={t("features.landing.hero.actions.support")} href="#support" />
          <IconAction icon={Mail} label={t("features.landing.hero.actions.contact")} href="#contact" />
        </motion.div>

        <div key={remountKey} className="relative mt-12 flex items-center justify-center">
          {/* Two staggered ripple rings, pulsing outward and fading --
              a "tap here" radar-ping affordance around the circle.
              Separate from the circle's own bounce animation; each
              ring runs its own independent scale+opacity loop. */}
          {[0, 1.5].map((delay) => (
            <motion.span
              key={delay}
              className="absolute h-9 w-9 rounded-full border-2"
              style={{ borderColor: "hsl(23 33% 32%)" }}
              animate={{ scale: [1, 1.4, 1.8], opacity: [0, 0.5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay }}
            />
          ))}
          <motion.button
            type="button"
            aria-label={t("features.landing.hero.scrollDown")}
            onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
            className="relative h-9 w-9 cursor-pointer rounded-full border-2 bg-transparent"
            style={{ borderColor: "hsl(23 33% 32%)" }}
          />
        </div>

        {/* Mobile-only single card, right after the scroll button --
            see MobileFeatureCard for why it re-randomizes its avatar
            per message instead of keeping one fixed like the desktop
            version does. */}
        <MobileFeatureCard featureCards={featureCards} />
      </div>

      <FloatingLanguageSwitcher />
    </section>
  );
}