import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  asideEyebrow?: string;
  asideText?: string;
  children?: ReactNode;
  contained?: boolean;
};

const shellBase =
  "border-b border-[var(--line)] pb-10 pt-10 md:pb-12 md:pt-12";

const containedShellClass = `mx-auto max-w-6xl px-6 md:px-10 ${shellBase}`;

const uncontainedShellClass = shellBase;

const headerGridClass =
  "grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end";

const titleClass =
  "font-display max-w-4xl text-5xl leading-[0.98] text-[var(--espresso)] md:text-6xl";

const descriptionClass =
  "mt-6 max-w-2xl text-[1.04rem] leading-8 text-[var(--ink-soft)]";

const childrenClass = "mt-9 border-t border-[var(--line)] pt-7";

export function PageHeader({
  eyebrow,
  title,
  description,
  asideEyebrow,
  asideText,
  children,
  contained = true,
}: PageHeaderProps) {
  return (
    <section className={contained ? containedShellClass : uncontainedShellClass}>
      <div className={headerGridClass}>
        <div>
          <p className="eyebrow mb-4">{eyebrow}</p>

          <h1 className={titleClass}>{title}</h1>

          {description ? (
            <p className={descriptionClass}>{description}</p>
          ) : null}
        </div>

        {asideEyebrow || asideText ? (
          <div className="lg:text-right">
            {asideEyebrow ? (
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-[var(--caramel)]">
                {asideEyebrow}
              </p>
            ) : null}

            {asideText ? (
              <p className="font-display mt-4 text-[1.35rem] italic leading-[1.35] text-[var(--coffee)]">
                {asideText}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {children ? <div className={childrenClass}>{children}</div> : null}
    </section>
  );
}
