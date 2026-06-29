type Stat = {
  value: string;
  label: string;
};

type Feature = {
  title: string;
  description: string;
};

type EditorialPageProps = {
  eyebrow: string;
  title: string;
  italicTitle?: string;
  description: string;
  stats?: Stat[];
  features: Feature[];
  actionLabel?: string;
};

export function EditorialPage({
  eyebrow,
  title,
  italicTitle,
  description,
  stats = [],
  features,
  actionLabel,
}: EditorialPageProps) {
  return (
    <div>
      <section className="px-6 pb-14 pt-16 text-center md:px-10 md:pb-16 md:pt-20">
        <p className="eyebrow">{eyebrow}</p>

        <h1 className="font-display mx-auto mt-3 max-w-3xl text-5xl leading-[0.92] text-[var(--espresso)] md:text-7xl">
          {title}
          {italicTitle ? (
            <>
              <br />
              <span className="italic text-[var(--coffee)]">
                {italicTitle}
              </span>
            </>
          ) : null}
        </h1>

        <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[var(--ink-soft)] md:text-base">
          {description}
        </p>
      </section>

      {stats.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 md:px-10">
          <hr className="hairline" />

          <div className="grid grid-cols-1 md:grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={[
                  "py-8 text-center md:py-9",
                  index > 0 ? "md:stat-divider" : "",
                ].join(" ")}
              >
                <p className="font-display text-5xl leading-none text-[var(--espresso)]">
                  {stat.value}
                </p>
                <p className="mt-3 text-[0.68rem] font-medium uppercase tracking-[0.34em] text-[var(--caramel)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <hr className="hairline" />
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-11 md:px-10 md:pb-20">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="font-display text-4xl text-[var(--espresso)]">
            The edit
          </h2>

          {actionLabel ? (
            <button className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-[var(--caramel)]">
              {actionLabel}
            </button>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="lift rounded-xl border border-[var(--line)] bg-[var(--paper-2)] p-6 shadow-soft"
            >
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-[var(--caramel)]">
                {feature.title}
              </p>
              <p className="mt-5 text-sm leading-7 text-[var(--ink-soft)]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
