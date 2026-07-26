import { BellRing, Brain, ScanFace, Sheet, type LucideIcon } from "lucide-react";

export interface ShowcaseFeature {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface ShowcaseModule {
  key: string;
  title: string;
  icon: LucideIcon;
  features: ShowcaseFeature[];
}

/**
 * Data-driven: when Warehouse / POS ship, add an entry here and the hero
 * showcase picks it up with zero new code.
 */
export const SHOWCASE_MODULES: ShowcaseModule[] = [
  {
    key: "hr",
    title: "Office HR",
    icon: ScanFace,
    features: [
      {
        title: "Shift Reminder",
        description: "Everyone gets a nudge before their shift starts — no more silent no-shows.",
        icon: BellRing,
      },
      {
        title: "Presence Check",
        description: "See who's in, who's late, and who's off, live, on one screen.",
        icon: ScanFace,
      },
      {
        title: "AI Workload Insights",
        description: "Spot overloaded teams and quiet weeks before they become problems.",
        icon: Brain,
      },
      {
        title: "One-click Reports",
        description: "Attendance and hours, exported the way payroll wants them.",
        icon: Sheet,
      },
    ],
  },
];
