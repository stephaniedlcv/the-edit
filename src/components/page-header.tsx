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
  "border-b border-[var(--line)] pb-9 pt-9 md:pb-14 md:pt-14";

const containedShellClass = `mx-auto max-w-6xl px-6 md:px-10 ${shellBase}`;

const uncontainedShellClass = shellBase;

const headerGridClass =
  "grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end";

const titleClass =
  "font-display text-[2.8rem] leading-[0.96] text-[var(--espresso)] md:text-5xl lg:text-6xl";

const descriptionClass =
  "mt-5 max-w-2xl text-[1.02rem] leading-8 text-[var(--ink-soft)]";

const childrenClass = "mt-8 border-t border-[var(--line)] pt-7";

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
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-[var(--gold)]">
                {asideEyebrow}
              </p>
            ) : null}
            {asideText ? (
              <p className="font-display mt-3 text-[1.28rem] italic leading-[1.4] text-[var(--coffee)]">
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
