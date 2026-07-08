"use client";

import Link from "next/link";
import { useState } from "react";

// ─── Serializable look data passed from server ────────────────────────────────

export interface LookCandidate {
  outfitId: string;
  editorialTitle: string;
  pieceCount: number;
  colorScore: number;
  pieceIds: string[];
  swatchHexes: string[];
  coverBg: string;
  textColor: string;
  btnBg: string;
  btnText: string;
}

interface DailyLookCoverProps {
  candidates: LookCandidate[];
  editionNumber: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DailyLookCover({ candidates, editionNumber }: DailyLookCoverProps) {
  const [offset, setOffset] = useState(0);

  if (candidates.length === 0) return null;

  const look = candidates[offset % candidates.length];
  const hasNext = candidates.length > 1;
  const scoreLabel = look.colorScore > 0 ? `armonía ${look.colorScore}` : null;

  return (
    <div
      className="relative overflow-hidden rounded-[var(--r-panel)] p-7 md:p-9"
      style={{ background: look.coverBg }}
    >
      {/* Color swatches — top-right stack */}
      {look.swatchHexes.length > 0 && (
        <div className="absolute right-7 top-7 flex flex-col gap-[0.35rem]">
          {look.swatchHexes.slice(0, 4).map((hex, i) => (
            <span
              key={i}
              className="h-[1.15rem] w-[1.15rem] rounded-full ring-1 ring-inset ring-white/25"
              style={{ backgroundColor: hex }}
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      {/* Eyebrow */}
      <p
        className="text-[0.58rem] font-bold uppercase tracking-[0.22em] opacity-70 pr-12"
        style={{ color: look.textColor, fontFamily: "var(--font-sans)" }}
      >
        El look de hoy · Nº {editionNumber}
      </p>

      {/* Editorial title */}
      <p
        role="heading"
        aria-level={1}
        className="mt-5 max-w-[14rem] text-[2.2rem] leading-[1.05] font-light sm:text-[2.7rem] sm:max-w-[17rem] pr-8"
        style={{ color: look.textColor, fontFamily: "var(--font-serif)" }}
      >
        {look.editorialTitle}
      </p>

      {/* Subline */}
      <p
        className="mt-4 text-[0.82rem] leading-[1.5] opacity-75 pr-12"
        style={{ color: look.textColor, fontFamily: "var(--font-sans)" }}
      >
        {look.pieceCount} piezas{scoreLabel ? ` · ${scoreLabel}` : ""}
      </p>

      {/* CTAs */}
      <div className="mt-7 flex flex-wrap items-center gap-4">
        {look.pieceIds[0] && (
          <Link
            href={`/outfits?pieceId=${look.pieceIds[0]}`}
            className="inline-flex h-10 items-center justify-center rounded-[var(--r-chip)] px-5 text-[0.65rem] font-bold uppercase tracking-[0.14em] no-underline transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: look.btnBg,
              color: look.btnText,
              fontFamily: "var(--font-sans)",
            }}
          >
            Vestir este look
          </Link>
        )}
        {hasNext && (
          <button
            type="button"
            onClick={() => setOffset((o) => o + 1)}
            className="text-[0.62rem] font-bold uppercase tracking-[0.14em] opacity-60 transition-opacity hover:opacity-100"
            style={{ color: look.textColor, fontFamily: "var(--font-sans)" }}
          >
            Ver otro →
          </button>
        )}
      </div>
    </div>
  );
}
