export const dynamic = "force-dynamic";

import Link from "next/link";
import { OutfitBuilder } from "@/components/outfit-builder";
import { getWardrobeItems, getWardrobeItemById } from "@/lib/wardrobe/data";

// ─── Styles ────────────────────────────────────────────────────────────────────

const OF_STYLES = `
  .of-wrap {
    padding-bottom: calc(9rem + env(safe-area-inset-bottom, 0px));
  }

  .of-header {
    padding: 2.5rem 1.5rem 0;
  }
  @media (min-width: 640px) {
    .of-header { padding: 3rem 2.5rem 0; }
  }

  .of-eyebrow {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: var(--caramel);
    margin-bottom: 0.75rem;
  }

  .of-title {
    font-family: var(--font-serif);
    font-size: clamp(3.2rem, 11vw, 5.5rem);
    font-weight: 600;
    line-height: 0.92;
    letter-spacing: -0.02em;
    color: var(--espresso);
    margin-bottom: 1rem;
  }

  .of-subcopy {
    font-size: 0.78rem;
    line-height: 1.8;
    color: var(--ink-soft);
    max-width: 42ch;
    margin-bottom: 0;
  }

  /* Intro card */
  .of-intro-card {
    margin: 2rem 1.5rem 0;
    padding: 1.1rem 1.25rem;
    border: 1px solid var(--line);
    background: var(--paper-2);
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.25rem;
    flex-wrap: wrap;
  }
  @media (min-width: 640px) {
    .of-intro-card { margin-left: 2.5rem; margin-right: 2.5rem; }
  }

  .of-intro-text {
    font-size: 0.72rem;
    color: var(--ink-soft);
    line-height: 1.6;
  }
  .of-intro-text strong {
    display: block;
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--espresso);
    margin-bottom: 0.2rem;
  }

  .of-saved-link {
    flex-shrink: 0;
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--espresso);
    text-decoration: none;
    border-bottom: 1px solid var(--espresso);
    padding-bottom: 1px;
    transition: opacity 0.15s;
    white-space: nowrap;
  }
  .of-saved-link:hover { opacity: 0.55; }
`;

// ─── Page ──────────────────────────────────────────────────────────────────────

type Props = {
  searchParams: Promise<{ pieceId?: string }>;
};

export default async function OutfitsPage({ searchParams }: Props) {
  const [items, params] = await Promise.all([
    getWardrobeItems(),
    searchParams,
  ]);

  const selectedPiece = params.pieceId
    ? await getWardrobeItemById(params.pieceId)
    : null;

  return (
    <>
      <style href="of-cromatica" precedence="component">{OF_STYLES}</style>

      <div className="of-wrap">

        {/* ── Editorial header ──────────────────────────────────────────────── */}
        <div className="of-header">
          <p className="of-eyebrow">Estilo · Cromática</p>
          <h1 className="of-title">El Styling.</h1>
          <p className="of-subcopy">
            Construye combinaciones reales desde tu clóset, con intención de color, silueta y ocasión.
          </p>
        </div>

        {/* ── Mesa de styling card ──────────────────────────────────────────── */}
        <div className="of-intro-card">
          <div className="of-intro-text">
            <strong>Mesa de styling</strong>
            Usa tus piezas reales para probar combinaciones. Guarda solo los looks que sí te pondrías.
          </div>
          <Link href="/outfits/saved" className="of-saved-link">
            Ver looks guardados →
          </Link>
        </div>

        {/* ── OutfitBuilder — intacto ───────────────────────────────────────── */}
        <OutfitBuilder items={items} selectedPiece={selectedPiece ?? undefined} />

      </div>
    </>
  );
}
