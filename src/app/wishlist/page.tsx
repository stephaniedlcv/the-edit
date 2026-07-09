export const dynamic = "force-dynamic";

import Link from "next/link";
import { getWishlistItems } from "@/lib/wishlist/data";
import { buildSpectrumEntriesFromItems } from "@/lib/wardrobe/spectrum-data";
import { EditorialMasthead } from "@/components/editorial-masthead";
import { getEditionNumber } from "@/lib/edition";
import { WishlistPriorityBoard } from "@/components/wishlist-priority-board";

// ─── Styles ────────────────────────────────────────────────────────────────────

const WL_STYLES = `
  /* ── WISHLIST · CROMÁTICA — wl-* namespace ──────────────────────────────── */

  .wl-wrap {
    padding-bottom: calc(9rem + env(safe-area-inset-bottom, 0px));
  }

  /* ── Header ──────────────────────────────────────────────────────────────── */
  .wl-header {
    padding: 2.5rem 1.5rem 0;
  }
  @media (min-width: 640px) {
    .wl-header { padding: 3rem 2.5rem 0; }
  }

  .wl-eyebrow {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: var(--caramel);
    margin-bottom: 0.75rem;
  }

  .wl-title {
    font-family: var(--font-serif);
    font-size: clamp(3.2rem, 11vw, 5.5rem);
    font-weight: 600;
    line-height: 0.92;
    letter-spacing: -0.02em;
    color: var(--espresso);
    margin-bottom: 1rem;
  }

  .wl-subcopy {
    font-size: 0.78rem;
    line-height: 1.8;
    color: var(--ink-soft);
    max-width: 36ch;
    margin-bottom: 0;
  }

  /* ── Stats strip ─────────────────────────────────────────────────────────── */
  .wl-stats {
    display: flex;
    flex-wrap: wrap;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    margin-top: 2rem;
  }

  .wl-stat {
    flex: 1 1 0;
    min-width: 68px;
    padding: 0.8rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    border-right: 1px solid var(--line);
  }
  .wl-stat:last-child { border-right: none; }

  .wl-stat-n {
    font-family: var(--font-serif);
    font-size: 1.6rem;
    font-weight: 600;
    line-height: 1;
    color: var(--espresso);
  }
  .wl-stat-label {
    font-size: 0.52rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--caramel);
  }

  /* ── El Archivo card ─────────────────────────────────────────────────────── */
  .wl-archivo-card {
    margin: 1.5rem 1.5rem 0;
    padding: 1rem 1.25rem;
    border: 1px solid var(--line);
    background: var(--paper-2);
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  @media (min-width: 640px) {
    .wl-archivo-card { margin-left: 2.5rem; margin-right: 2.5rem; }
  }

  .wl-archivo-text {
    font-size: 0.72rem;
    color: var(--ink-soft);
    line-height: 1.5;
  }
  .wl-archivo-text strong {
    display: block;
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--espresso);
    margin-bottom: 0.2rem;
  }

  .wl-archivo-link {
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
  }
  .wl-archivo-link:hover { opacity: 0.55; }
`;

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function WishlistPage() {
  const items         = await getWishlistItems();
  const editionNumber = getEditionNumber();
  const entries       = buildSpectrumEntriesFromItems(items);

  const highPriority = items.filter((i) => i.decision === "buy-priority").length;
  const watching     = items.filter((i) => i.decision === "wishlist").length;
  const considering  = items.filter((i) => i.decision === "consider").length;
  const onPriceWatch = items.filter((i) => i.priceWatch === true).length;

  return (
    <>
      <style href="wl-cromatica" precedence="component">{WL_STYLES}</style>

      <div className="wl-wrap">

        {/* ── Editorial header ──────────────────────────────────────────────── */}
        <div className="wl-header">
          <p className="wl-eyebrow">Wishlist · Cromática</p>
          <h1 className="wl-title">La Lista.</h1>
          <p className="wl-subcopy">
            Tus deseos organizados por prioridad, color y propósito.
          </p>

          {/* Stats strip */}
          <div className="wl-stats">
            <div className="wl-stat">
              <span className="wl-stat-n">{String(items.length).padStart(2, "0")}</span>
              <span className="wl-stat-label">Total</span>
            </div>
            <div className="wl-stat">
              <span className="wl-stat-n">{String(highPriority).padStart(2, "0")}</span>
              <span className="wl-stat-label">Prioridad</span>
            </div>
            <div className="wl-stat">
              <span className="wl-stat-n">{String(watching).padStart(2, "0")}</span>
              <span className="wl-stat-label">Observación</span>
            </div>
            <div className="wl-stat">
              <span className="wl-stat-n">{String(considering).padStart(2, "0")}</span>
              <span className="wl-stat-label">A considerar</span>
            </div>
            {onPriceWatch > 0 && (
              <div className="wl-stat">
                <span className="wl-stat-n">{String(onPriceWatch).padStart(2, "0")}</span>
                <span className="wl-stat-label">Price watch</span>
              </div>
            )}
          </div>
        </div>

        {/* ── ChromaSpine ───────────────────────────────────────────────────── */}
        <EditorialMasthead
          editionNumber={editionNumber}
          entries={entries}
          captionLeft="TUS DESEOS"
          captionRight={`${items.length} DESEOS`}
        />

        {/* ── Conexión con El Archivo ───────────────────────────────────────── */}
        <div className="wl-archivo-card">
          <div className="wl-archivo-text">
            <strong>En El Archivo</strong>
            Tus deseos aparecen integrados en el archivo cromático del clóset.
          </div>
          <Link href="/closet?mode=wishlist" className="wl-archivo-link">
            Ver en El Archivo →
          </Link>
        </div>

        {/* ── WishlistPriorityBoard ─────────────────────────────────────────── */}
        <WishlistPriorityBoard items={items} />

      </div>
    </>
  );
}
