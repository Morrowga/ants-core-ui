import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { SHOWCASE_MODULES, type ShowcaseModule } from "./showcase-data";

/**
 * Right-hand hero showcase: for each module, the icon + title fade in, then
 * feature "toast" cards cycle one at a time (fade in → hold → fade out),
 * then the whole module block fades out and the next module fades in.
 * Loops continuously. Built with Framer Motion because this needs real
 * sequencing/looping, not one-shot CSS animations.
 */

// One consistent timing system for every transition (spec: no arbitrary
// mixing of fast and slow).
const EASE = [0.32, 0.72, 0.24, 1] as const;
const FADE_S = 0.45; // every enter/exit uses this duration
const TITLE_LEAD_MS = 700; // title settles before the first feature card
const FEATURE_HOLD_MS = 2400; // visible time per feature card
const MODULE_REST_MS = 600; // pause after the last card before switching modules

// Fade in while rising slightly; fade out while sinking slightly.
const rise = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
  transition: { duration: FADE_S, ease: EASE },
};

function FeatureCard({
  module,
  featureIndex,
}: {
  module: ShowcaseModule;
  featureIndex: number;
}) {
  const feature = module.features[featureIndex];
  const Icon = feature.icon;
  return (
    <motion.div
      key={`${module.key}-${featureIndex}`}
      {...rise}
      className="flex w-full max-w-sm items-start gap-3 rounded-lg border bg-card p-4 shadow-sm"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div>
        <p className="font-medium">{feature.title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{feature.description}</p>
      </div>
    </motion.div>
  );
}

function ModuleBlock({ module, cycleKey }: { module: ShowcaseModule; cycleKey: string }) {
  // -1 = title only (feature stack empty during the lead-in)
  const [featureIndex, setFeatureIndex] = useState(-1);

  useEffect(() => {
    setFeatureIndex(-1);
    const lead = window.setTimeout(() => setFeatureIndex(0), TITLE_LEAD_MS);
    return () => window.clearTimeout(lead);
  }, [cycleKey]);

  useEffect(() => {
    if (featureIndex < 0 || featureIndex >= module.features.length - 1) return;
    const timer = window.setTimeout(
      () => setFeatureIndex((i) => i + 1),
      FEATURE_HOLD_MS + FADE_S * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [featureIndex, module.features.length]);

  const ModuleIcon = module.icon;

  return (
    <motion.div {...rise} className="flex w-full flex-col items-center gap-6">
      {/* Module image + title as one line */}
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-sidebar text-sidebar-foreground shadow-sm">
          <ModuleIcon className="h-6 w-6" aria-hidden />
        </span>
        <h2 className="text-2xl font-semibold">{module.title}</h2>
      </div>

      {/* Feature toast stack — one card visible at a time */}
      <div className="flex min-h-[104px] w-full items-start justify-center">
        <AnimatePresence mode="wait">
          {featureIndex >= 0 && (
            <FeatureCard module={module} featureIndex={featureIndex} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function ModuleShowcase() {
  const prefersReducedMotion = useReducedMotion();
  const [cycle, setCycle] = useState(0);
  const moduleIndex = cycle % SHOWCASE_MODULES.length;
  const module = SHOWCASE_MODULES[moduleIndex];

  // Advance to the next module once this one's cards have all been shown.
  useEffect(() => {
    if (prefersReducedMotion) return;
    const featureCount = SHOWCASE_MODULES[moduleIndex].features.length;
    const total =
      TITLE_LEAD_MS +
      featureCount * (FEATURE_HOLD_MS + FADE_S * 1000) +
      MODULE_REST_MS;
    const timer = window.setTimeout(() => setCycle((c) => c + 1), total);
    return () => window.clearTimeout(timer);
  }, [cycle, moduleIndex, prefersReducedMotion]);

  // Reduced motion: static display of the first module, no cycling at all.
  if (prefersReducedMotion) {
    const first = SHOWCASE_MODULES[0];
    const FirstIcon = first.icon;
    return (
      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-sidebar text-sidebar-foreground shadow-sm">
            <FirstIcon className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="text-2xl font-semibold">{first.title}</h2>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-3">
          {first.features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex items-start gap-3 rounded-lg border bg-card p-4 shadow-sm"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center">
      <AnimatePresence mode="wait">
        <ModuleBlock key={cycle} module={module} cycleKey={String(cycle)} />
      </AnimatePresence>
    </div>
  );
}
