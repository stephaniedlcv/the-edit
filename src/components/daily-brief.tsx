"use client";

import { useEffect, useState } from "react";

type BriefEvent = { category: string; start: string; title: string };

type BriefData = {
  affirmation: string;
  headline: string;
  recommended: string;
  avoid: string;
  logNote: string;
};

const AFFIRMATIONS = [
  "You dress for the woman you're becoming.",
  "Every outfit is a decision — make it intentional.",
  "Style is what you say before you even speak.",
  "The right outfit is armor and invitation in one.",
  "Dress for the day you want, not the one you're dreading.",
  "Your closet is your editorial, and today is a new page.",
  "Confidence is the best thing you can wear.",
  "Intentional dressing is a form of self-respect.",
  "You already have everything you need to look extraordinary.",
  "Getting dressed is the first creative act of the day.",
  "When you feel good in what you're wearing, everything else follows.",
  "A great outfit doesn't ask for permission.",
  "Dress like you already have everything figured out.",
  "Your style is a love letter to yourself.",
  "Every day is an opportunity to reintroduce yourself.",
  "You are the curator. Make it a good exhibition.",
  "The woman who knows her style knows her power.",
  "Elegance is refusal — and also confidence.",
  "Small details, big impression. Always.",
  "Today's look sets the tone. Set it high.",
];

const WORK_HEADLINES = [
  "Structure meets summer. Office ready.",
  "Berlitz day. Dress like you mean it.",
  "Work the room before you enter it.",
  "Professional polish. Breathable everywhere.",
  "Office energy, island heat — balance both.",
  "Sharp from the first impression to the last.",
  "Today calls for intention. Start with the outfit.",
  "Command the room. Start from the closet.",
  "Berlitz calls for your best version.",
  "Professional. Polished. Unafraid of the heat.",
];

const WORK_GYM_HEADLINES = [
  "Berlitz first, then lift. Two looks, one day.",
  "Work it. Then work out.",
  "Office to gym — pack smart, dress smarter.",
  "Double duty day. Lead with the blazer.",
  "Power suit to power set. Today has two acts.",
  "Professional AM, active PM. Own both chapters.",
];

const GYM_FIRST_HEADLINES = [
  "Gym first, Berlitz after. Start strong.",
  "Morning lift, then the office. Two acts, one day.",
  "Workout done before most people wake up. Then work.",
  "Active start, professional finish. Pack accordingly.",
  "Morning moves, then the meeting. Two looks — both count.",
  "Sweat first, structure after. The best kind of day.",
];

const GYM_ONLY_HEADLINES = [
  "Move day. Comfort meets confidence.",
  "Active day — dress to perform.",
  "Today's outfit: built for motion.",
  "Workout day. Your athleisure has standards.",
  "Sweat with style. It's not optional.",
  "Gym day is still a style day.",
];

const FREE_HEADLINES = [
  "No agenda, pure intention.",
  "Open schedule. Own the look.",
  "Today is yours — so is the aesthetic.",
  "Unscheduled beauty. The best kind.",
  "A free day deserves a considered outfit.",
  "Edit your look like you edit your time.",
  "Nothing planned means everything is possible.",
  "Free day, full effort. You still get dressed.",
];

const HOLIDAY_HEADLINES = [
  "Holiday energy. Dress for the occasion.",
  "Festive day. Let the outfit celebrate too.",
  "A holiday is no excuse not to be chic.",
  "Rest day, elevated.",
  "Holiday dressing: relaxed but never careless.",
];

const WORK_RECOMMENDED = [
  "Structured linen or a breathable blazer — worn open — over a clean base.",
  "Tailored wide-leg trousers with a fitted blouse. Light layers, intentional silhouette.",
  "A pressed midi or structured dress. Cool fabric, confident shape.",
  "Blazer-vest formula: open over a camisole for the San Juan heat.",
  "Monochromatic tone with one intentional accessory. Minimal, not plain.",
  "Crisp button-down left open over a slip dress. Layered and breezy.",
  "Clean trousers, tucked blouse, kitten heel or loafer. The classic that always works.",
  "A structured jumpsuit in a breathable fabric. One piece, zero decisions.",
];

const WORK_GYM_RECOMMENDED = [
  "Two-bag system: office bag + gym bag packed the night before. Each look complete.",
  "Blazer over your gym base for the commute, swap at arrival. Seamless transition.",
  "Structured AM look with easy swap pieces. Keep the gym bag in the car.",
  "Office-to-gym: choose a neutral base that bridges both. Change only what's necessary.",
];

const GYM_FIRST_RECOMMENDED = [
  "Gym look for the morning, full office look ready to change into. Don't overlap the two.",
  "Active set in the AM — change completely before Berlitz. Two distinct identities.",
  "Pack your office look the night before. Post-gym change should be fast and complete.",
  "Matching athletic set for the gym block, then a full reset for the work look. No mixing.",
];

const GYM_RECOMMENDED = [
  "Matching set with clean sneakers — gym looks should be as considered as any other.",
  "High-waist leggings, fitted top, lightweight crossbody for the transition home.",
  "Coordinated activewear. Color-blocked or tone-on-tone — both are editorial.",
  "Your best athletic set. Effort shows even at the gym.",
];

const FREE_RECOMMENDED = [
  "Effortless wide-leg with a clean tee — intentional casual.",
  "A well-cut sundress with strappy flats. Easy but edited.",
  "Your most comfortable elevated piece. This is a test-wear day.",
  "Linen, sandals, minimal jewelry. The San Juan uniform, perfected.",
  "That piece you've been meaning to try — now's the day.",
];

const WORK_AVOID = [
  "Heavy fabrics, closed blazers, anything with no airflow in this PR heat.",
  "Wrinkle-prone fabrics without a plan. Humidity is relentless here.",
  "Too-casual shoes — they speak louder than the outfit.",
  "Overly complex layering for an office setting. Sharp always wins over complicated.",
  "Anything that needs constant adjusting. Confidence has no time for that.",
];

const GYM_AVOID = [
  "Forgetting the transition bag — pack your work shoes separately tonight.",
  "Wearing the gym look into a professional setting without a planned swap.",
  "Going full casual when part of the day is still professional. Sequence matters.",
];

const FREE_AVOID = [
  "Treating 'free day' as an excuse for zero effort. Your style has no days off.",
  "The same default look you always reach for. Today, try something new.",
  "Overdressing for the occasion — elegant casual is its own skill.",
];

const HOLIDAY_AVOID = [
  "Defaulting to the most comfortable thing without intention. Effortless has a standard.",
  "Over-planning the look for a rest day. Keep it simple, keep it you.",
];

const WORK_LOG_NOTES = [
  "Note how the office look performs in PR heat — comfort score is data.",
  "If it felt great, log the formula. Repeatability is the whole point.",
  "Check the silhouette before leaving. The AI needs accurate data.",
  "Log the outfit even if imperfect — that's how the system learns your preferences.",
  "How did you feel at 3pm? Still great? That's worth noting.",
];

const GYM_LOG_NOTES = [
  "Log both looks separately — the office outfit and the gym outfit are distinct entries.",
  "Note the transition time and what you changed. That's closet intelligence.",
  "Gym outfits count too. Log the activewear set before you forget.",
];

const FREE_LOG_NOTES = [
  "Use today to test a piece you haven't logged yet.",
  "A free day is the best time to experiment. If it works, log it immediately.",
  "How did the effortless look actually feel? That's real data.",
  "No meeting pressure means honest feedback — log what you notice.",
];

const HOLIDAY_LOG_NOTES = [
  "Even on holidays, note what you wore. Patterns emerge over time.",
  "Rest day comfort has a style standard too. Log it.",
];

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[Math.abs(seed + offset) % arr.length];
}

function getDailySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function isSameCalendarDay(isoStr: string): boolean {
  const now = new Date();
  // All-day events come as "YYYY-MM-DD" (no time component).
  // Parsing that with `new Date()` gives UTC midnight, which in PR (UTC-4)
  // lands on the *previous* day — so we parse the components directly.
  if (!isoStr.includes("T")) {
    const [y, m, d] = isoStr.split("-").map(Number);
    return (
      y === now.getFullYear() &&
      m === now.getMonth() + 1 &&
      d === now.getDate()
    );
  }
  const d = new Date(isoStr);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function generateBrief(events: BriefEvent[]): BriefData {
  const seed = getDailySeed();
  const todayEvents = events
    .filter((e) => isSameCalendarDay(e.start))
    .sort((a, b) => a.start.localeCompare(b.start));

  const hasWork = todayEvents.some((e) => e.category === "personal");
  const hasGym = todayEvents.some((e) => e.category === "workout");
  const hasHoliday = todayEvents.some((e) => e.category === "holiday");

  const firstWork = todayEvents.find((e) => e.category === "personal");
  const firstGym = todayEvents.find((e) => e.category === "workout");

  // Default: gym AM before work (user's established pattern).
  // Only override if work has a clear timed start that is earlier than gym.
  const workClearlyFirst =
    hasGym &&
    hasWork &&
    firstGym &&
    firstWork &&
    firstWork.start.includes("T") &&
    firstGym.start.includes("T") &&
    firstWork.start < firstGym.start;
  const gymBeforeWork = hasGym && hasWork && !workClearlyFirst;

  let headline: string;
  let recommended: string;
  let avoid: string;
  let logNote: string;

  if (hasWork && hasGym && gymBeforeWork) {
    headline = pick(GYM_FIRST_HEADLINES, seed);
    recommended = pick(GYM_FIRST_RECOMMENDED, seed, 1);
    avoid = pick(GYM_AVOID, seed, 2);
    logNote = pick(GYM_LOG_NOTES, seed, 1);
  } else if (hasWork && hasGym) {
    headline = pick(WORK_GYM_HEADLINES, seed);
    recommended = pick(WORK_GYM_RECOMMENDED, seed, 1);
    avoid = pick(GYM_AVOID, seed, 2);
    logNote = pick(GYM_LOG_NOTES, seed, 1);
  } else if (hasWork) {
    headline = pick(WORK_HEADLINES, seed);
    recommended = pick(WORK_RECOMMENDED, seed, 3);
    avoid = pick(WORK_AVOID, seed, 2);
    logNote = pick(WORK_LOG_NOTES, seed, 1);
  } else if (hasGym) {
    headline = pick(GYM_ONLY_HEADLINES, seed);
    recommended = pick(GYM_RECOMMENDED, seed, 2);
    avoid = pick(GYM_AVOID, seed, 3);
    logNote = pick(GYM_LOG_NOTES, seed, 2);
  } else if (hasHoliday) {
    headline = pick(HOLIDAY_HEADLINES, seed);
    recommended = pick(FREE_RECOMMENDED, seed, 4);
    avoid = pick(HOLIDAY_AVOID, seed, 1);
    logNote = pick(HOLIDAY_LOG_NOTES, seed);
  } else {
    headline = pick(FREE_HEADLINES, seed);
    recommended = pick(FREE_RECOMMENDED, seed, 2);
    avoid = pick(FREE_AVOID, seed, 3);
    logNote = pick(FREE_LOG_NOTES, seed, 2);
  }

  return {
    affirmation: pick(AFFIRMATIONS, seed, 7),
    headline,
    recommended,
    avoid,
    logNote,
  };
}

export function DailyBrief() {
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    fetch(`/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`)
      .then((r) => (r.ok ? r.json() : { configured: false, events: [] }))
      .then((data: { configured: boolean; events: BriefEvent[] }) => {
        setBrief(generateBrief(data.events ?? []));
        setLoading(false);
      })
      .catch(() => {
        setBrief(generateBrief([]));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <>
        <p className="eyebrow mb-5">Daily Styling Brief</p>
        <div className="border-y border-[var(--line)] py-7">
          <div className="h-10 w-3/4 animate-pulse rounded bg-[var(--line)]" />
        </div>
        <div className="mt-7 grid gap-6 md:grid-cols-3">
          {["Recommended", "Avoid", "Log note"].map((l) => (
            <div key={l}>
              <p className="eyebrow mb-3">{l}</p>
              <div className="h-4 w-full animate-pulse rounded bg-[var(--line)]" />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (!brief) return null;

  return (
    <>
      <p className="eyebrow mb-4">Daily Styling Brief</p>

      <p className="font-display mb-5 text-[0.9rem] italic leading-[1.7] text-[var(--coffee)]">
        &ldquo;{brief.affirmation}&rdquo;
      </p>

      <div className="border-y border-[var(--line)] py-7">
        <h2 className="font-display text-[2.4rem] leading-[1.0] text-[var(--espresso)] md:text-[3.2rem]">
          {brief.headline}
        </h2>
      </div>

      <div className="mt-7 grid gap-6 md:grid-cols-3">
        {[
          { label: "Recommended", text: brief.recommended },
          { label: "Avoid", text: brief.avoid },
          { label: "Log note", text: brief.logNote },
        ].map((item) => (
          <div key={item.label}>
            <p className="eyebrow mb-3">{item.label}</p>
            <p className="text-[0.9rem] leading-[1.8] text-[var(--ink-soft)]">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
