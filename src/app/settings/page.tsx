import { PageHeader } from "@/components/page-header";
import { getStyleProfile } from "@/lib/profile/data";

const paletteTone: Record<string, string> = {
  black: "#2b241f",
  brown: "#4b2f22",
  cream: "#ead9c3",
  beige: "#d5b895",
  white: "#f3eadf",
  burgundy: "#6b2d2f",
  olive: "#586143",
  camel: "#b7814f",
  plum: "#604052",
  mustard: "#b8892f",
  denim: "#30455b",
  blue: "#344f6f",
  statement: "#a65f3f",
};

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-7">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="font-display text-4xl leading-none text-[var(--espresso)]">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function RuleCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-[4px] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[0_18px_60px_rgba(74,47,34,0.04)]">
      <h3 className="font-display text-2xl leading-none text-[var(--espresso)]">
        {title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">{body}</p>
    </article>
  );
}

export default async function SettingsPage() {
  const styleProfile = await getStyleProfile();
  return (
    <main className="pb-16 md:pb-20">
      <PageHeader
        eyebrow="Style Profile"
        title={
          <>
            Your rules,{" "}
            <em className="text-[var(--coffee)]">your edit.</em>
          </>
        }
        description="The foundation for every outfit, wishlist decision, color choice, fit note, and shopping recommendation."
        asideEyebrow="Profile Signal"
        asideText="Personal style rules for the AI layer."
      />

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] p-8">
            <p className="eyebrow mb-5">Identity</p>
            <h2 className="font-display text-5xl leading-none text-[var(--espresso)]">
              {styleProfile.identity.styleSystem}
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[var(--caramel)]">
                  Palette
                </p>
                <p className="mt-2 font-display text-2xl text-[var(--espresso)]">
                  {styleProfile.identity.palette}
                </p>
              </div>
              <div>
                <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[var(--caramel)]">
                  Silhouette
                </p>
                <p className="mt-2 font-display text-2xl text-[var(--espresso)]">
                  {styleProfile.identity.silhouette}
                </p>
              </div>
              <div>
                <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[var(--caramel)]">
                  Climate
                </p>
                <p className="mt-2 font-display text-2xl text-[var(--espresso)]">
                  {styleProfile.identity.location}
                </p>
              </div>
              <div>
                <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[var(--caramel)]">
                  Aesthetic
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  {styleProfile.identity.aesthetic}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[4px] border border-[var(--line)] bg-[var(--paper)] p-8">
            <p className="eyebrow mb-5">Measurements</p>
            <div className="grid grid-cols-2 gap-4">
              {styleProfile.measurements.map((measurement) => (
                <div
                  key={measurement.label}
                  className="border-b border-[var(--line)] pb-4"
                >
                  <p className="text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[var(--caramel)]">
                    {measurement.label}
                  </p>
                  <p className="font-display mt-2 text-4xl leading-none text-[var(--espresso)]">
                    {measurement.value}
                  </p>
                  <p className="mt-3 text-xs leading-5 text-[var(--ink-soft)]">
                    {measurement.note}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <section className="mt-12">
          <SectionTitle
            eyebrow="Color System"
            title="Dark Autumn palette"
            description="Core colors and intentional pops that should guide wishlist scoring, outfit formulas, and styling recommendations."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {styleProfile.palette.map((color) => {
              const tone = paletteTone[color.family] ?? paletteTone.brown;

              return (
                <article
                  key={color.name}
                  className="group overflow-hidden rounded-[4px] border border-[var(--line)] bg-[var(--paper)] shadow-[0_18px_60px_rgba(74,47,34,0.04)]"
                >
                  <div
                    className="relative h-36 overflow-hidden"
                    style={{
                      background: `radial-gradient(circle at 20% 18%, rgba(255,255,255,0.38), transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.26), ${tone} 48%, rgba(43,36,31,0.55))`,
                    }}
                  >
                    <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:22px_22px]" />
                    <div className="absolute -left-8 top-5 h-28 w-28 rounded-full border border-white/35" />
                    <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full border border-black/10" />
                    <div className="absolute bottom-4 left-5 h-px w-14 bg-white/50" />
                  </div>

                  <div className="p-5">
                    <p className="text-[0.52rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
                      {color.role}
                    </p>
                    <h3 className="font-display mt-2 text-2xl leading-none text-[var(--espresso)]">
                      {color.name}
                    </h3>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <SectionTitle
            eyebrow="Fit Logic"
            title="Bottom Hourglass rules"
            description="These rules should shape outfit recommendations, wishlist verdicts, and fit warnings."
          />

          <div className="grid gap-5 md:grid-cols-2">
            {styleProfile.fitRules.map((rule) => (
              <RuleCard key={rule.title} {...rule} />
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <div>
            <SectionTitle
              eyebrow="Shopping Discipline"
              title="Wishlist rules"
              description="The decision layer that keeps the closet intentional instead of impulse-driven."
            />
            <div className="grid gap-5">
              {styleProfile.shoppingRules.map((rule) => (
                <RuleCard key={rule.title} {...rule} />
              ))}
            </div>
          </div>

          <div>
            <SectionTitle
              eyebrow="Climate Logic"
              title="Puerto Rico styling rules"
              description="Warm-weather and humidity rules for daily outfit recommendations."
            />
            <div className="grid gap-5">
              {styleProfile.climateRules.map((rule) => (
                <RuleCard key={rule.title} {...rule} />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] p-8">
            <p className="eyebrow mb-5">Capsule Goals</p>
            <ul className="space-y-4">
              {styleProfile.capsuleGoals.map((goal) => (
                <li
                  key={goal}
                  className="border-b border-[var(--line)] pb-4 text-sm leading-7 text-[var(--ink-soft)] last:border-0 last:pb-0"
                >
                  {goal}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[4px] border border-[var(--line)] bg-[var(--espresso)] p-8 text-[var(--paper)]">
            <p className="mb-5 text-[0.6rem] font-semibold uppercase tracking-[0.26em] text-[var(--sand)]">
              AI Instruction Layer
            </p>
            <h2 className="font-display text-4xl leading-none">
              The rules every recommendation should follow.
            </h2>
            <div className="mt-7 grid gap-4">
              {styleProfile.aiRules.map((rule, index) => (
                <div
                  key={rule}
                  className="grid grid-cols-[2rem_1fr] gap-4 border-t border-white/15 pt-4"
                >
                  <p className="font-display text-2xl text-[var(--sand)]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="text-sm leading-7 text-white/75">{rule}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
