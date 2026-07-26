import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

/**
 * ⚠️ RECONSTRUCTED CONFIG — flagged per the build spec's "Open gap".
 *
 * The real web `tailwind.config.ts` from the HR Dashboard repo was not
 * available when this project was generated. This file is a reconstruction
 * that maps exactly the CSS variables present in `src/index.css` (the
 * verified theme block) to Tailwind color/font utility names.
 *
 * When you get access to the HR Dashboard repo, diff this file against its
 * real `tailwind.config.ts` and replace anything that differs — especially
 * the `fontFamily` stacks. The font pairing below (Space Grotesk display +
 * IBM Plex Sans body + IBM Plex Mono for tabular data) follows the spec's
 * own hint; the faces are loaded via <link> tags in `index.html`.
 *
 * Do NOT use the NativeWind config from the mobile app here — it is React
 * Native only (SpaceGrotesk_600SemiBold-style literals, nativewind/preset)
 * and does not apply to this Vite/web project.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          muted: "hsl(var(--sidebar-muted))",
          active: "hsl(var(--sidebar-active))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // TODO: verify against HR Dashboard's real web tailwind.config.ts
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animatePlugin],
};

export default config;
