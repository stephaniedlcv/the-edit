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
    <article className="rounded-[2px] bg-[var(--paper)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(36,26,18,0.05),0_16px_44px_rgba(36,26,18,0.08)]">
      <h3 className="font-display text-2xl leading-none text-[var(--espresso)]">
        {title}
      </h3>
      <p className="mt-4 text-[0.88rem] leading-[1.75] text-[var(--ink-soft)]">{body}</p>
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
        <div className="grid gap-4 md:gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[2px] bg-[var(--paper-2)] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(36,26,18,0.05),0_16px_44px_rgba(36,26,18,0.08)] md:p-8">
            <p className="eyebrow mb-5">Identity</p>
            <h2 className="font-display text-[2.8rem] leading-none text-[var(--espresso)] md:text-5xl">
              {styleProfile.identity.styleSystem}
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Palette", value: styleProfile.identity.palette },
                { label: "Silhouette", value: styleProfile.identity.silhouette },
                { label: "Climate", value: styleProfile.identity.location },
                { label: "Aesthetic", value: styleProfile.identity.aesthetic },
              ].map((item) => (
                <div key={item.label}>
                  <p className="eyebrow mb-2">{item.label}</p>
                  <p className="font-display mt-2 text-2xl text-[var(--espresso)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2px] bg-[var(--paper)] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(36,26,18,0.05),0_16px_44px_rgba(36,26,18,0.08)] md:p-8">
            <p className="eyebrow mb-5">Measurements</p>
            <div className="grid grid-cols-2 gap-4">
              {styleProfile.measurements.map((measurement) => (
                <div
                  key={measurement.label}
                  className="border-b border-[var(--line)] pb-4"
                >
                  <p className="eyebrow mb-2">{measurement.label}</p>
                  <p className="font-display mt-2 text-[2.4rem] leading-none text-[var(--espresso)]">
                    {measurement.value}
                  </p>
                  <p className="mt-3 text-[0.8rem] leading-[1.6] text-[var(--ink-soft)]">
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
                  className="group overflow-hidden rounded-[2px] bg-[var(--paper)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(36,26,18,0.05),0_16px_44px_rgba(36,26,18,0.08)]"
                >
                  <div
                    className="relative h-36 overflow-hidden"
                    style={{
                      background: `radial-gradient(circle at 20% 18%, rgba(255,255,255,0.38), transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.26), ${tone} 48%, rgba(26,16,8,0.55))`,
                    }}
                  >
                    <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:22px_22px]" />
                    <div className="absolute -left-8 top-5 h-28 w-28 rounded-full border border-white/35" />
                    <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full border border-black/10" />
                    <div className="absolute bottom-4 left-5 h-px w-14 bg-white/50" />
                  </div>

                  <div className="p-5">
                    <p className="eyebrow mb-2">{color.role}</p>
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
          <article className="rounded-[2px] bg-[var(--paper-2)] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(36,26,18,0.05),0_16px_44px_rgba(36,26,18,0.08)] md:p-8">
            <p className="eyebrow mb-5">Capsule Goals</p>
            <ul className="space-y-4">
              {styleProfile.capsuleGoals.map((goal) => (
                <li
                  key={goal}
                  className="border-b border-[var(--line)] pb-4 text-[0.88rem] leading-[1.75] text-[var(--ink-soft)] last:border-0 last:pb-0"
                >
                  {goal}
                </li>
              ))}
            </ul>
          </article>

          <article
            className="rounded-[2px] p-7 md:p-8"
            style={{
              background: "linear-gradient(150deg, #FBF7EE 0%, #F6EFE0 60%, #F1E8D5 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(161,122,53,0.18), 0 24px 60px rgba(36,26,18,0.10)"
            }}
          >
            <p className="mb-5 eyebrow">
              AI Instruction Layer
            </p>
            <h2 className="font-display text-[2.4rem] leading-none text-[var(--espresso)] md:text-4xl">
              The rules every recommendation should follow.
            </h2>
            <div className="mt-7 grid gap-4">
              {styleProfile.aiRules.map((rule, index) => (
                <div
                  key={rule}
                  className="grid grid-cols-[2rem_1fr] gap-4 border-t pt-4"
                  style={{ borderColor: "rgba(200,151,58,0.15)" }}
                >
                  <p className="font-display text-2xl text-[var(--gold-soft)]" style={{ opacity: 0.5 }}>
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="text-[0.88rem] leading-[1.75] text-[var(--coffee)]">{rule}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
