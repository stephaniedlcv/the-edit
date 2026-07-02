type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  statLabel?: string;
  statValue?: string | number;
  chips?: string[];
};

export function PageHero({
  eyebrow,
  title,
  description,
  statLabel,
  statValue,
  chips = [],
}: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="page-hero-main">
        <p className="eyebrow page-hero-eyebrow">{eyebrow}</p>
        <h1 className="page-hero-title">{title}</h1>
        <p className="page-hero-description">{description}</p>

        {chips.length > 0 ? (
          <div className="page-hero-chips">
            {chips.map((chip, index) => (
              <span
                key={chip}
                className={index === 0 ? "edit-chip edit-chip-active" : "edit-chip"}
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {statLabel && statValue !== undefined ? (
        <div className="page-hero-stat">
          <p className="eyebrow">{statLabel}</p>
          <p className="page-hero-stat-value">{statValue}</p>
        </div>
      ) : null}
    </section>
  );
}
