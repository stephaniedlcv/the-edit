type AtelierPlaceholderProps = {
  name: string;
  colorName?: string;
  colorFamily?: string;
  category?: string;
  className?: string;
  compact?: boolean;
};

const toneByFamily: Record<string, { base: string; soft: string; ink: string }> = {
  black: { base: "#2b241f", soft: "#8a7766", ink: "#f7efe4" },
  brown: { base: "#4b2f22", soft: "#b1845d", ink: "#fff5ea" },
  cream: { base: "#ead9c3", soft: "#fff8ec", ink: "#4b2f22" },
  beige: { base: "#d5b895", soft: "#f6ead9", ink: "#4b2f22" },
  white: { base: "#f3eadf", soft: "#fffaf2", ink: "#4b2f22" },
  burgundy: { base: "#6b2d2f", soft: "#b8766b", ink: "#fff1ea" },
  olive: { base: "#586143", soft: "#a69f78", ink: "#fff8ea" },
  camel: { base: "#b7814f", soft: "#efd1a8", ink: "#3c2618" },
  plum: { base: "#604052", soft: "#b28a9b", ink: "#fff1f5" },
  mustard: { base: "#b8892f", soft: "#edd08a", ink: "#3a2714" },
  denim: { base: "#30455b", soft: "#9aa8b6", ink: "#f3f7fb" },
  blue: { base: "#344f6f", soft: "#9fb1c7", ink: "#f3f7fb" },
  statement: { base: "#8d4f35", soft: "#e2ae83", ink: "#fff5ec" },
};

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function AtelierPlaceholder({
  name,
  colorName,
  colorFamily = "brown",
  category,
  className = "",
  compact = false,
}: AtelierPlaceholderProps) {
  const tone = toneByFamily[colorFamily] ?? toneByFamily.brown;
  const initials = initialsFromName(name);

  return (
    <div
      className={`relative isolate overflow-hidden rounded-[3px] border border-white/35 shadow-[inset_0_0_0_1px_rgba(74,47,34,0.08)] ${className}`}
      style={
        {
          "--atelier-base": tone.base,
          "--atelier-soft": tone.soft,
          "--atelier-ink": tone.ink,
        } as React.CSSProperties
      }
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.36),transparent_28%),linear-gradient(135deg,var(--atelier-soft),var(--atelier-base)_52%,rgba(43,36,31,0.92))]" />
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:26px_26px]" />
      <div className="absolute -left-10 top-6 h-40 w-40 rounded-full border border-white/30" />
      <div className="absolute -bottom-12 -right-10 h-44 w-44 rounded-full border border-black/10" />

      {compact ? (
        <div className="relative flex h-full min-h-full flex-col justify-between p-3">
          <div className="flex items-start justify-between gap-2">
            <span
              className="rounded-full border border-white/35 bg-white/20 px-2 py-1 text-[0.44rem] font-semibold uppercase tracking-[0.16em] backdrop-blur"
              style={{ color: tone.ink }}
            >
              {category ?? "Piece"}
            </span>
            <span
              className="font-display text-2xl leading-none opacity-80"
              style={{ color: tone.ink }}
            >
              {initials}
            </span>
          </div>

          <div>
            <div className="mb-2 h-px w-10 bg-white/45" />
            {colorName ? (
              <p
                className="text-[0.48rem] font-semibold uppercase tracking-[0.16em] opacity-85"
                style={{ color: tone.ink }}
              >
                {colorName}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="relative flex h-full min-h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-4">
            <span
              className="rounded-full border border-white/35 bg-white/20 px-3 py-1 text-[0.52rem] font-semibold uppercase tracking-[0.2em] backdrop-blur"
              style={{ color: tone.ink }}
            >
              {category ?? "Piece"}
            </span>
            <span
              className="font-display text-3xl leading-none opacity-80"
              style={{ color: tone.ink }}
            >
              {initials}
            </span>
          </div>

          <div>
            <div className="mb-4 h-px w-16 bg-white/45" />
            <p className="font-display text-4xl leading-[0.95]" style={{ color: tone.ink }}>
              {name}
            </p>
            {colorName ? (
              <p
                className="mt-3 text-[0.58rem] font-semibold uppercase tracking-[0.22em] opacity-85"
                style={{ color: tone.ink }}
              >
                {colorName}
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
