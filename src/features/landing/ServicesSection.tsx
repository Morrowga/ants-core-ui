import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import hrImage from "@/assets/hr.png";
import whImage from "@/assets/wh.png";
import posImage from "@/assets/pos.png";
import aiOcrImage from "@/assets/ai-ocr.png";
import { SectionDivider } from "./SectionDivider";

const ROTATE_INTERVAL_MS = 5000;

export function ServicesSection() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  /**
   * The 4 rotating services. HR and Warehouse use real product images;
   * POS and AI OCR have no real image anywhere in the project yet --
   * neither module exists beyond a name mention, so these fall back to
   * a plain placeholder square instead of pretending a real asset
   * exists. Swap in a real `image` for each the moment actual product
   * icons exist for them. Built inside the component now (not a
   * module-level const) since names come from i18n's `t`, only
   * available via the hook.
   */
  const SERVICES = [
    { key: "hr", name: t("features.landing.services.names.hr"), image: hrImage },
    { key: "warehouse", name: t("features.landing.services.names.warehouse"), image: whImage },
    { key: "pos", name: t("features.landing.services.names.pos"), image: posImage },
    { key: "ai-ocr", name: t("features.landing.services.names.aiOcr"), image: aiOcrImage },
  ] as const;

  /** Same bullet list for every service on purpose -- these are
   * platform-wide value props (true regardless of which module is
   * showing), not per-service feature lists. Only the title/image above
   * them changes as the rotation cycles. Array from i18n now -- needs
   * returnObjects: true to come back as one instead of a joined string. */
  const bulletsRaw = t("features.landing.services.bullets", { returnObjects: true });
  const SHARED_BULLETS = Array.isArray(bulletsRaw) ? bulletsRaw : [];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % SERVICES.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [SERVICES.length]);

  const active = SERVICES[index];

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <h2 className="text-left text-3xl font-semibold text-espresso">
        {t("features.landing.services.title")}
      </h2>
      <SectionDivider />
      <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        {/* Left: service image, centered, "dice roll" flip transition
            (rotateX through a real 3D tumble, via perspective on the
            wrapper) -- same technique as the earlier module-display
            popover, top-to-bottom instead of a flat fade. */}
        <div className="flex items-center justify-center" style={{ perspective: 800 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active.key}
              initial={{ opacity: 0, rotateX: -90 }}
              animate={{ opacity: 1, rotateX: 0 }}
              exit={{ opacity: 0, rotateX: 90 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{
                transformStyle: "preserve-3d",
                boxShadow: "-20px 10px 40px -5px hsla(23, 33%, 32%, 0.1)",
              }}
              className="flex h-64 w-64 items-center justify-center rounded-2xl bg-white"
            >
              {active.image ? (
                <img src={active.image} alt={active.name} className="h-48 w-48 object-contain" />
              ) : (
                // TODO: placeholder until a real image exists for this
                // service -- POS and AI OCR have no asset yet.
                <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
                  {active.name}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: title + bullets, fading in from the left as the
            active service changes. Bullet CONTENT is fixed (SHARED_
            BULLETS) -- only re-keyed so the fade-in re-triggers in sync
            with the title/image, not because the bullets themselves
            are different per service. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.key}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <h2 className="text-3xl font-semibold text-espresso">{active.name}</h2>
            <ul className="mt-4 space-y-2.5">
              {SHARED_BULLETS.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: "hsl(23 33% 32%)" }}
                  />
                  {bullet}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}