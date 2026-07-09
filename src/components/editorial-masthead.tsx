/**
 * editorial-masthead.tsx — Cromática shared editorial header  (Fase 6D.2C)
 *
 * Single component for the masthead + ChromaSpine histogram + caption block
 * used by every Cromática-migrated route (Home, El Archivo, …).
 *
 * DESIGN RULE (enforced by API):
 *   The right side of the masthead row is ALWAYS "EDICIÓN DIARIA · Nº {N}".
 *   There is no prop to override this. Edition number is the magazine's
 *   permanent signature; contextual counts live in captionLeft/captionRight,
 *   never in the masthead line.
 *
 * Props:
 *   editionNumber  — from getEditionNumber() in src/lib/edition.ts
 *   entries        — SpectrumEntry[] for the ChromaSpine histogram
 *   captionLeft    — left caption below the histogram  (default "TU ESPECTRO")
 *   captionRight   — right caption below the histogram (default "{N} PIEZAS")
 *   className      — forwarded to the outer wrapper
 */

import { ChromaSpineBlock } from "@/components/chroma-spine";
import type { SpectrumEntry } from "@/lib/wardrobe/spectrum";

export interface EditorialMastheadProps {
  editionNumber: number;
  entries: SpectrumEntry[];
  captionLeft?:  string;
  captionRight?: string;
  className?: string;
}

/**
 * Shared editorial header for Cromática-migrated pages.
 *
 * Renders: masthead row → ChromaSpine histogram → baseline → caption row.
 * The masthead right label is sealed as "EDICIÓN DIARIA · Nº {editionNumber}"
 * and cannot be overridden by callers.
 */
export function EditorialMasthead({
  editionNumber,
  entries,
  captionLeft,
  captionRight,
  className,
}: EditorialMastheadProps) {
  return (
    <ChromaSpineBlock
      entries={entries}
      editionNumber={editionNumber}
      showMasthead={true}
      captionLeft={captionLeft}
      captionRight={captionRight}
      className={className}
    />
  );
}
