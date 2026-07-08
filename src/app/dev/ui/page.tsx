/**
 * ⚠ DEV ONLY — Fase 3C UI primitives preview
 * Delete this route before merging cromatica-v1 → main.
 * Static page: no Supabase, no APIs, no auth required.
 */

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SectionHead } from "@/components/ui/section-head";
import { PieceCard } from "@/components/ui/piece-card";

// ─── Static mock data ────────────────────────────────────────────────────────

const COLOR_FAMILIES = [
  "black", "brown", "cream", "white", "camel", "beige",
  "burgundy", "mustard", "olive", "plum", "blue", "denim",
  "multicolor", "metallic", "statement",
] as const;

const MOCK_PIECES = [
  {
    name: "Merino Turtleneck",
    category: "knitwear",
    colorFamily: "cream",
    imageUrl: undefined,
    href: undefined,
  },
  {
    name: "Camel Coat",
    category: "outerwear",
    colorFamily: "camel",
    imageUrl: undefined,
    href: undefined,
    priority: 1,
  },
  {
    name: "Silk Blouse",
    category: "tops",
    colorFamily: "burgundy",
    imageUrl: undefined,
    href: undefined,
  },
  {
    name: "Tailored Trousers",
    category: "bottoms",
    colorFamily: "olive",
    imageUrl: undefined,
    href: undefined,
  },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────

function DevSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[var(--line)] pb-12">
      <p className="mb-6 rounded-full border border-[var(--line)] bg-[var(--gal)] px-4 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--tinta-suave)] inline-block">
        {label}
      </p>
      {children}
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DevUiPage() {
  return (
    <div className="min-h-screen bg-[var(--gal)] px-8 py-12">
      {/* Warning banner */}
      <div className="mb-10 rounded-[var(--r-card)] border border-[var(--c-mostaza)] bg-[var(--c-mostaza)]/10 px-6 py-4">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--c-mostaza)]">
          ⚠ Dev only — delete before merge
        </p>
        <p className="mt-1 text-[0.82rem] text-[var(--tinta-suave)]">
          Fase 3C · Cromática UI primitives · Branch: cromatica-v1
        </p>
      </div>

      <div className="mx-auto max-w-5xl space-y-12">

        {/* ── Button ── */}
        <DevSection label="Button">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[var(--tinta-tenue)]">
                Variants × sizes
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="solid"   size="sm">Solid sm</Button>
                <Button variant="solid"   size="md">Solid md</Button>
                <Button variant="solid"   size="lg">Solid lg</Button>
                <Button variant="outline" size="sm">Outline sm</Button>
                <Button variant="outline" size="md">Outline md</Button>
                <Button variant="outline" size="lg">Outline lg</Button>
                <Button variant="ghost"  size="sm">Ghost sm</Button>
                <Button variant="ghost"  size="md">Ghost md</Button>
                <Button variant="ghost"  size="lg">Ghost lg</Button>
              </div>
            </div>
            <div>
              <p className="mb-3 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[var(--tinta-tenue)]">
                Disabled state
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="solid"   disabled>Solid</Button>
                <Button variant="outline" disabled>Outline</Button>
                <Button variant="ghost"   disabled>Ghost</Button>
              </div>
            </div>
          </div>
        </DevSection>

        {/* ── Chip ── */}
        <DevSection label="Chip">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[var(--tinta-tenue)]">
                Static variants
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Chip variant="default">Default</Chip>
                <Chip variant="active">Active</Chip>
                <Chip variant="outline">Outline</Chip>
                <Chip variant="default" size="sm">Default sm</Chip>
                <Chip variant="active"  size="sm">Active sm</Chip>
              </div>
            </div>

            <div>
              <p className="mb-3 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[var(--tinta-tenue)]">
                Color chips — all 15 families
              </p>
              <div className="flex flex-wrap gap-2">
                {COLOR_FAMILIES.map((cf) => (
                  <Chip key={cf} variant="color" colorFamily={cf} size="md" />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[var(--tinta-tenue)]">
                Interactive note
              </p>
              <p className="rounded-[var(--r-card)] border border-[var(--line)] bg-[var(--papel)] px-4 py-3 text-[0.78rem] text-[var(--tinta-suave)]">
                When <code className="font-mono text-[var(--tinta)]">onClick</code> is provided,
                Chip renders as <code className="font-mono text-[var(--tinta)]">&lt;button&gt;</code>{" "}
                with full focus-visible ring. Omit it for a static
                <code className="font-mono text-[var(--tinta)]"> &lt;span&gt;</code>.
                Demo requires a Client Component — see chip.tsx.
              </p>
            </div>
          </div>
        </DevSection>

        {/* ── SectionHead ── */}
        <DevSection label="SectionHead">
          <div className="space-y-8">
            <SectionHead
              eyebrow="Cromática"
              title="Your wardrobe, curated."
              description="A personal color OS for Dark Autumn dressing — built on spectrum science."
              actionLabel="View all"
              actionHref="/closet"
            />
            <SectionHead
              title="No eyebrow, no description"
              actionLabel="See more"
              actionHref="/closet"
            />
            <SectionHead
              eyebrow="Wishlist"
              title="Pieces to acquire"
              description="Sorted by priority score and closet impact."
            />
          </div>
        </DevSection>

        {/* ── PieceCard gallery ── */}
        <DevSection label="PieceCard — gallery">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {MOCK_PIECES.map((piece) => (
              <PieceCard key={piece.name} variant="gallery" {...piece} />
            ))}
          </div>
        </DevSection>

        {/* ── PieceCard compact ── */}
        <DevSection label="PieceCard — compact">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {MOCK_PIECES.map((piece) => (
              <PieceCard key={piece.name} variant="compact" {...piece} />
            ))}
          </div>
        </DevSection>

        {/* ── PieceCard river ── */}
        <DevSection label="PieceCard — river">
          <div className="space-y-2">
            {MOCK_PIECES.map((piece) => (
              <PieceCard key={piece.name} variant="river" {...piece} />
            ))}
          </div>
        </DevSection>

      </div>
    </div>
  );
}
