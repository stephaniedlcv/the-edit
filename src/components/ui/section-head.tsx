/**
 * SectionHead — UI primitive (Cromática, Fase 3C)
 *
 * Section-level heading with optional eyebrow, description, and action.
 * Does NOT replace PageHeader — used for section headings within pages.
 * All colors use Cromática tokens.
 */

import Link from "next/link";
import type { ReactNode } from "react";

export interface SectionHeadProps {
  /** All-caps label above the title. */
  eyebrow?: string;
  /** Primary heading text. Accepts ReactNode for bold/italic spans. */
  title: ReactNode;
  /** Secondary body copy below the title. */
  description?: string;
  /** Text label for a trailing link action. Requires actionHref. */
  actionLabel?: string;
  /** Href for the trailing link action. */
  actionHref?: string;
  /** Custom action node — overrides actionLabel + actionHref when provided. */
  action?: ReactNode;
  className?: string;
}

export function SectionHead({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  action,
  className = "",
}: SectionHeadProps) {
  const trailingAction =
    action ??
    (actionLabel && actionHref ? (
      <Link
        href={actionHref}
        className={[
          "shrink-0 text-[0.64rem] font-semibold uppercase tracking-[0.18em]",
          "text-[var(--tinta-tenue)] underline-offset-4",
          "transition-colors duration-100",
          "hover:text-[var(--tinta)] hover:underline",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          "focus-visible:outline-[var(--tinta)] rounded-sm",
        ].join(" ")}
      >
        {actionLabel}
      </Link>
    ) : null);

  return (
    <div
      className={[
        "flex items-end justify-between gap-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="eyebrow mb-3">{eyebrow}</p>
        ) : null}

        <h2 className="font-display text-[2rem] leading-[0.95] text-[var(--tinta)]">
          {title}
        </h2>

        {description ? (
          <p className="mt-3 max-w-prose text-[0.88rem] leading-[1.65] text-[var(--tinta-suave)]">
            {description}
          </p>
        ) : null}
      </div>

      {trailingAction ? (
        <div className="shrink-0">{trailingAction}</div>
      ) : null}
    </div>
  );
}
