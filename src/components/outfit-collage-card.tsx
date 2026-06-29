import type { OutfitLook, OutfitPiece } from "@/lib/mock-outfits";
import { AtelierPlaceholder } from "@/components/atelier-placeholder";

type OutfitCollageCardProps = {
  look: OutfitLook;
};

const defaultPositions = [
  { left: "7%", top: "10%", width: "44%", rotate: "-5deg" },
  { left: "46%", top: "7%", width: "42%", rotate: "6deg" },
  { left: "16%", top: "43%", width: "38%", rotate: "4deg" },
  { left: "54%", top: "44%", width: "34%", rotate: "-7deg" },
  { left: "34%", top: "66%", width: "32%", rotate: "2deg" },
];

function formatSlot(slot?: string) {
  return slot?.replace("-", " ") ?? "piece";
}

function renderPiece(piece: OutfitPiece, index: number) {
  const fallback = defaultPositions[index % defaultPositions.length];

  const style = {
    left: piece.x ?? fallback.left,
    top: piece.y ?? fallback.top,
    width: piece.width ?? fallback.width,
    transform: `rotate(${piece.rotate ?? fallback.rotate})`,
  };

  if (piece.imageUrl) {
    return (
      <div
        key={piece.id}
        className="absolute aspect-[3/4] rounded-[3px] bg-contain bg-center bg-no-repeat drop-shadow-[0_18px_24px_rgba(74,47,34,0.16)]"
        style={{ ...style, backgroundImage: `url(${piece.imageUrl})` }}
        aria-label={piece.name}
      />
    );
  }

  return (
    <div
      key={piece.id}
      className="absolute aspect-[3/4] drop-shadow-[0_18px_24px_rgba(74,47,34,0.16)]"
      style={style}
    >
      <AtelierPlaceholder
        name={piece.name}
        colorName={piece.colorName}
        colorFamily={piece.colorFamily}
        category={formatSlot(piece.slot)}
        className="h-full"
        compact
      />
    </div>
  );
}

export function OutfitCollageCard({ look }: OutfitCollageCardProps) {
  return (
    <article className="overflow-hidden rounded-[4px] border border-[var(--line)] bg-[var(--paper)] shadow-[0_18px_60px_rgba(74,47,34,0.06)]">
      <div className="relative h-[25rem] overflow-hidden bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.9),transparent_26%),linear-gradient(135deg,var(--paper-2),#ead8c0)]">
        <div className="absolute inset-6 border border-white/55" />
        <div className="absolute left-6 top-6 z-10">
          <p className="text-[0.52rem] font-semibold uppercase tracking-[0.24em] text-[var(--caramel)]">
            {look.occasion}
          </p>
        </div>
        {look.pieces.map((piece, index) => renderPiece(piece, index))}
      </div>

      <div className="px-6 pb-6 pt-5">
        <p className="text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
          {look.vibe}
        </p>
        <h3 className="font-display mt-2 text-[2rem] leading-none text-[var(--espresso)]">
          {look.title}
        </h3>
        <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
          {look.notes}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="rounded-full border border-[var(--espresso)] px-4 py-2 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[var(--espresso)]">
            Open look
          </button>
          <button className="rounded-full border border-[var(--line)] px-4 py-2 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)]">
            Add to log
          </button>
        </div>
      </div>
    </article>
  );
}
