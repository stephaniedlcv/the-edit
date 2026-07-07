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
    <div className="page-hero-shell">
      <div className={contained ? "mx-auto max-w-6xl" : ""}>
        <div className="page-hero-grid">
          <div>
            <p className="eyebrow mb-4">{eyebrow}</p>
            <h1 className="page-hero-title">{title}</h1>
            {description ? (
              <p className="page-hero-desc">{description}</p>
            ) : null}
          </div>

          {asideEyebrow || asideText ? (
            <div className="page-hero-aside">
              {asideEyebrow ? (
                <p className="page-hero-aside-eyebrow">{asideEyebrow}</p>
              ) : null}
              {asideText ? (
                <p className="page-hero-aside-text">{asideText}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        {children ? (
          <div className="page-hero-children">{children}</div>
        ) : null}
      </div>
    </div>
  );
}
