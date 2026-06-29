export type OutfitLogStatus = "planned" | "worn" | "skipped" | "open";

export type OutfitLogDay = {
  id: string;
  day: string;
  date: string;
  status: OutfitLogStatus;
  title: string;
  outfitNeed: string;
  formula: string[];
  weatherNote: string;
  repeatSignal: string;
  notes: string;
};

export const outfitLogWeek: OutfitLogDay[] = [
  {
    id: "mon-2026-06-22",
    day: "Monday",
    date: "Jun 22",
    status: "planned",
    title: "Open Blazer Vest Office Formula",
    outfitNeed: "Polished, breathable, structured but not heavy.",
    formula: [
      "Warm brown blazer vest",
      "Cream top",
      "Brown wide-leg pants",
      "Dark brown loafers",
      "Structured bag",
    ],
    weatherNote: "PR humidity: keep the layer sleeveless and open.",
    repeatSignal: "Good repeat. This formula uses high-value basics.",
    notes:
      "Strong workday formula because it defines the waist visually without adding heat.",
  },
  {
    id: "tue-2026-06-23",
    day: "Tuesday",
    date: "Jun 23",
    status: "open",
    title: "Needs outfit",
    outfitNeed: "Office-ready with color, but still easy.",
    formula: ["Color top", "Tailored bottom", "Loafers", "Gold jewelry"],
    weatherNote: "Choose breathable fabric and avoid heavy outerwear.",
    repeatSignal: "Opportunity: use burgundy, olive, or camel.",
    notes:
      "Good day to test a color-building formula instead of repeating black and cream.",
  },
  {
    id: "wed-2026-06-24",
    day: "Wednesday",
    date: "Jun 24",
    status: "worn",
    title: "Friday Dark Denim Formula",
    outfitNeed: "Casual polish, comfortable shoes, easy bag.",
    formula: ["Blazer", "Elevated top", "Dark denim", "Loafers", "Work tote"],
    weatherNote: "Dark denim works if the top stays light and breathable.",
    repeatSignal: "Logged as worn. Avoid repeating exact denim formula tomorrow.",
    notes:
      "A good polished casual look. Works best when the accessories finish the outfit.",
  },
  {
    id: "thu-2026-06-25",
    day: "Thursday",
    date: "Jun 25",
    status: "planned",
    title: "Warm Neutral Work Formula",
    outfitNeed: "Soft office polish, warm neutral story.",
    formula: [
      "Beige blazer",
      "Cream top",
      "Brown trousers",
      "Dark brown loafers",
      "Gold jewelry",
    ],
    weatherNote: "Use blazer only indoors or as an open layer.",
    repeatSignal: "Safe repeat, but add accessory variation.",
    notes:
      "Classic and reliable. Add a belt or earrings so it does not feel too plain.",
  },
  {
    id: "fri-2026-06-26",
    day: "Friday",
    date: "Jun 26",
    status: "open",
    title: "Needs Friday look",
    outfitNeed: "Denim-friendly but intentional.",
    formula: ["Dark denim", "Fitted top", "Belt", "Loafers or sneakers"],
    weatherNote: "Keep it light and practical for errands after work.",
    repeatSignal: "Avoid same denim + blazer combination from Wednesday.",
    notes:
      "Good day to use a fun shoe, statement earring, or warmer color accent.",
  },
  {
    id: "sat-2026-06-27",
    day: "Saturday",
    date: "Jun 27",
    status: "open",
    title: "Weekend tropical polish",
    outfitNeed: "Fun, easy, colorful, and PR-friendly.",
    formula: ["Simple top", "Relaxed bottom", "Sandals", "Color bag"],
    weatherNote: "Prioritize sandals, breathable fabric, and no heavy layers.",
    repeatSignal: "Opportunity: test tropical accessory styling.",
    notes:
      "This is where statement sandals, color bags, and gold jewelry can make basics feel fun.",
  },
  {
    id: "sun-2026-06-28",
    day: "Sunday",
    date: "Jun 28",
    status: "skipped",
    title: "Rest / no plannerged",
    outfitNeed: "Comfort only.",
    formula: ["Lounge", "Errands", "Low effort"],
    weatherNote: "No styling pressure.",
    repeatSignal: "Skipped days should not affect outfit repeat score.",
    notes:
      "Useful to log because it keeps the calendar honest without forcing outfits every day.",
  },
];

export const outfitLogStats = {
  planned: outfitLogWeek.filter((entry) => entry.status === "planned").length,
  worn: outfitLogWeek.filter((entry) => entry.status === "worn").length,
  open: outfitLogWeek.filter((entry) => entry.status === "open").length,
  skipped: outfitLogWeek.filter((entry) => entry.status === "skipped").length,
};
