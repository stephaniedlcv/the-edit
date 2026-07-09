import Link from "next/link";
import { SavedOutfitCard } from "@/components/saved-outfit-card";
import { getSavedOutfits } from "@/lib/outfits/data";

export const dynamic = "force-dynamic";

// ─── Styles ────────────────────────────────────────────────────────────────────

const OF_SAVED_STYLES = `
  .ofs-wrap {
    padding-bottom: calc(9rem + env(safe-area-inset-bottom, 0px));
  }

  .ofs-header {
    padding: 2.5rem 1.5rem 0;
  }
  @media (min-width: 640px) {
    .ofs-header { padding: 3rem 2.5rem 0; }
  }

  .ofs-eyebrow {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: var(--caramel);
    margin-bottom: 0.75rem;
  }

  .ofs-title {
    font-family: var(--font-serif);
    font-size: clamp(2.8rem, 9vw, 4.5rem);
    font-weight: 600;
    line-height: 0.94;
    letter-spacing: -0.02em;
    color: var(--espresso);
    margin-bottom: 0.9rem;
  }

  .ofs-subcopy {
    font-size: 0.78rem;
    line-height: 1.8;
    color: var(--ink-soft);
    max-width: 40ch;
  }

  .ofs-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
    margin-top: 1.75rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--line);
  }

  .ofs-nav-link {
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    text-decoration: none;
    padding-bottom: 2px;
    transition: opacity 0.15s;
    color: var(--coffee);
    border-bottom: 1.5px solid transparent;
  }
  .ofs-nav-link:hover {
    border-bottom-color: var(--coffee);
  }
  .ofs-nav-link.active {
    color: var(--espresso);
    border-bottom-color: var(--espresso);
  }

  .ofs-empty {
    border: 1px dashed var(--line);
    border-radius: 3px;
    background: var(--paper);
    padding: 2.5rem 2rem;
    font-size: 0.85rem;
    line-height: 1.75;
    color: var(--ink-soft);
  }

  .ofs-error {
    border: 1px solid rgba(128,55,45,0.28);
    border-radius: 3px;
    background: rgba(128,55,45,0.06);
    padding: 1.25rem 1.5rem;
    font-size: 0.85rem;
    line-height: 1.7;
    color: var(--espresso);
  }
`;

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function SavedOutfitsPage() {
  const { outfits, error } = await getSavedOutfits();

  return (
    <>
      <style href="of-saved-cromatica" precedence="component">{OF_SAVED_STYLES}</style>

      <div className="ofs-wrap">

        {/* ── Header editorial ──────────────────────────────────────────────── */}
        <div className="ofs-header">
          <p className="ofs-eyebrow">Estilo · Cromática</p>
          <h1 className="ofs-title">Looks guardados.</h1>
          <p className="ofs-subcopy">
            Los outfits que editaste y guardaste, listos para volver a ponerte.
          </p>

          {/* Sub-nav: Builder / Guardados */}
          <nav className="ofs-nav" aria-label="Outfits navigation">
            <Link href="/outfits" className="ofs-nav-link">
              Constructor
            </Link>
            <Link href="/outfits/saved" className="ofs-nav-link active">
              Guardados
            </Link>
          </nav>
        </div>

        {/* ── Looks grid ────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 py-10 md:px-10">
          {error ? (
            <div className="ofs-error">
              No se pudieron cargar los looks guardados: {error}
            </div>
          ) : outfits.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {outfits.map((outfit) => (
                <SavedOutfitCard key={outfit.id} outfit={outfit} />
              ))}
            </div>
          ) : (
            <div className="ofs-empty">
              <p className="font-display mb-2 text-2xl text-[var(--espresso)]">Sin looks guardados.</p>
              Ve al constructor, edita un look generado y presiona <em>Guardar</em> para verlo aquí.
            </div>
          )}
        </section>

      </div>
    </>
  );
}
