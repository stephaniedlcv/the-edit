/**
 * ⚠ DEV ONLY — Cromática UI primitives + ChromaSpine preview
 * Delete this route before merging cromatica-v1 → main.
 * Static page: no Supabase, no APIs, no auth required.
 * RSC — no "use client". Interactive ChromaSpine demos require a client wrapper.
 */

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SectionHead } from "@/components/ui/section-head";
import { PieceCard } from "@/components/ui/piece-card";
import { ChromaSpine } from "@/components/chroma-spine";
import { getColorFamilyMeta } from "@/lib/wardrobe/spectrum";
import type { SpectrumEntry } from "@/lib/wardrobe/spectrum";

// ─── Static mock data ────────────────────────────────────────────────────────

const COLOR_FAMILIES = [
  "black", "brown", "cream", "white", "camel", "beige",
  "burgundy", "mustard", "olive", "plum", "blue", "denim",
  "multicolor", "metallic", "statement",
] as const;

const MOCK_PIECES = [
  { name: "Merino Turtleneck", category: "knitwear",   colorFamily: "cream",    imageUrl: undefined, href: undefined },
  { name: "Camel Coat",        category: "outerwear",  colorFamily: "camel",    imageUrl: undefined, href: undefined, priority: 1 },
  { name: "Silk Blouse",       category: "tops",       colorFamily: "burgundy", imageUrl: undefined, href: undefined },
  { name: "Tailored Trousers", category: "bottoms",    colorFamily: "olive",    imageUrl: undefined, href: undefined },
];

/**
 * Audit data (Fase 2A): 190 pieces across 17 active families.
 * plum count=0 included to demonstrate zero-count treatment.
 */
const AUDIT_ENTRIES: SpectrumEntry[] = [
  { family: "black",      meta: getColorFamilyMeta("black"),      count: 36 },
  { family: "brown",      meta: getColorFamilyMeta("brown"),      count: 27 },
  { family: "cream",      meta: getColorFamilyMeta("cream"),      count: 23 },
  { family: "white",      meta: getColorFamilyMeta("white"),      count: 22 },
  { family: "burgundy",   meta: getColorFamilyMeta("burgundy"),   count: 16 },
  { family: "beige",      meta: getColorFamilyMeta("beige"),      count: 16 },
  { family: "olive",      meta: getColorFamilyMeta("olive"),      count: 12 },
  { family: "mustard",    meta: getColorFamilyMeta("mustard"),    count:  8 },
  { family: "blue",       meta: getColorFamilyMeta("blue"),       count:  6 },
  { family: "gray",       meta: getColorFamilyMeta("gray"),       count:  6 },
  { family: "camel",      meta: getColorFamilyMeta("camel"),      count:  5 },
  { family: "denim",      meta: getColorFamilyMeta("denim"),      count:  5 },
  { family: "pink",       meta: getColorFamilyMeta("pink"),       count:  3 },
  { family: "multicolor", meta: getColorFamilyMeta("multicolor"), count:  2 },
  { family: "metallic",   meta: getColorFamilyMeta("metallic"),   count:  1 },
  { family: "orange",     meta: getColorFamilyMeta("orange"),     count:  1 },
  { family: "statement",  meta: getColorFamilyMeta("statement"),  count:  1 },
  { family: "plum",       meta: getColorFamilyMeta("plum"),       count:  0 }, // absent in live data
];

// ─── Section wrapper ──────────────────────────────────────────────────────────

function DevSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[var(--line)] pb-12">
      <p className="mb-6 inline-block rounded-full border border-[var(--line)] bg-[var(--gal)] px-4 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--tinta-suave)]">
        {label}
      </p>
      {children}
    </section>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[var(--tinta-tenue)]">
      {children}
    </p>
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
          Fase 3C–4A · Cromática UI primitives + ChromaSpine · Branch: cromatica-v1
        </p>
      </div>

      <div className="mx-auto max-w-5xl space-y-12">

        {/* ─── ChromaSpine ─── */}
        <DevSection label="ChromaSpine — Fase 4A">
          <div className="space-y-10">

            <div>
              <SubLabel>Full audit data — md, horizontal, showCounts</SubLabel>
              <ChromaSpine
                entries={AUDIT_ENTRIES}
                size="md"
                showCounts
                ariaLabel="Closet color spectrum — full audit"
              />
              <p className="mt-2 text-[0.6rem] text-[var(--tinta-tenue)]">
                190 pieces · 17 active families · plum=0 (faded) · spectral order
              </p>
            </div>

            <div>
              <SubLabel>Size — sm</SubLabel>
              <ChromaSpine entries={AUDIT_ENTRIES} size="sm" />
            </div>

            <div>
              <SubLabel>Size — lg, showCounts</SubLabel>
              <ChromaSpine entries={AUDIT_ENTRIES} size="lg" showCounts />
            </div>

            <div>
              <SubLabel>With hrefBase — each segment is a Link</SubLabel>
              <ChromaSpine
                entries={AUDIT_ENTRIES}
                size="md"
                hrefBase="/closet/gallery"
                showCounts
                ariaLabel="Filter closet by color"
              />
              <p className="mt-2 text-[0.6rem] text-[var(--tinta-tenue)]">
                Links to /closet/gallery?colorFamily=&#123;family&#125;
              </p>
            </div>

            <div>
              <SubLabel>Active family — burgundy highlighted</SubLabel>
              <ChromaSpine
                entries={AUDIT_ENTRIES}
                size="md"
                activeFamily="burgundy"
                hrefBase="/closet/gallery"
                showCounts
              />
            </div>

            <div>
              <SubLabel>Vertical orientation — lg</SubLabel>
              <div className="flex h-40 gap-4">
                <ChromaSpine
                  entries={AUDIT_ENTRIES}
                  size="lg"
                  orientation="vertical"
                  ariaLabel="Closet color spectrum — vertical"
                />
                <div className="flex flex-col justify-center">
                  <p className="text-[0.62rem] text-[var(--tinta-tenue)]">
                    Same entries, vertical axis.<br />
                    Width = thickness (48px).<br />
                    Height per segment ∝ √count.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--r-card)] border border-[var(--line)] bg-[var(--papel)] px-5 py-4">
              <p className="text-[0.68rem] font-semibold text-[var(--tinta)]">
                onSelect (interactive)
              </p>
              <p className="mt-1 text-[0.76rem] text-[var(--tinta-suave)]">
                Providing <code className="font-mono text-[var(--tinta)]">onSelect</code> renders
                each segment as a <code className="font-mono text-[var(--tinta)]">&lt;button&gt;</code>{" "}
                with <code className="font-mono text-[var(--tinta)]">aria-pressed</code>.
                Demo requires a Client Component wrapper — see chroma-spine.tsx.
              </p>
            </div>

          </div>
        </DevSection>

        {/* ─── Button ─── */}
        <DevSection label="Button — Fase 3C">
          <div className="space-y-6">
            <div>
              <SubLabel>Variants × sizes</SubLabel>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="solid"   size="sm">Solid sm</Button>
                <Button variant="solid"   size="md">Solid md</Button>
                <Button variant="solid"   size="lg">Solid lg</Button>
                <Button variant="outline" size="sm">Outline sm</Button>
                <Button variant="outline" size="md">Outline md</Button>
                <Button variant="outline" size="lg">Outline lg</Button>
                <Button variant="ghost"   size="sm">Ghost sm</Button>
                <Button variant="ghost"   size="md">Ghost md</Button>
                <Button variant="ghost"   size="lg">Ghost lg</Button>
              </div>
            </div>
            <div>
              <SubLabel>Disabled state</SubLabel>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="solid"   disabled>Solid</Button>
                <Button variant="outline" disabled>Outline</Button>
                <Button variant="ghost"   disabled>Ghost</Button>
              </div>
            </div>
          </div>
        </DevSection>

        {/* ─── Chip ─── */}
        <DevSection label="Chip — Fase 3C">
          <div className="space-y-6">
            <div>
              <SubLabel>Static variants</SubLabel>
              <div className="flex flex-wrap items-center gap-2">
                <Chip variant="default">Default</Chip>
                <Chip variant="active">Active</Chip>
                <Chip variant="outline">Outline</Chip>
                <Chip variant="default" size="sm">Default sm</Chip>
                <Chip variant="active"  size="sm">Active sm</Chip>
              </div>
            </div>
            <div>
              <SubLabel>Color chips — 15 families</SubLabel>
              <div className="flex flex-wrap gap-2">
                {COLOR_FAMILIES.map((cf) => (
                  <Chip key={cf} variant="color" colorFamily={cf} size="md" />
                ))}
              </div>
            </div>
            <div>
              <SubLabel>Interactive note</SubLabel>
              <p className="rounded-[var(--r-card)] border border-[var(--line)] bg-[var(--papel)] px-4 py-3 text-[0.78rem] text-[var(--tinta-suave)]">
                Providing <code className="font-mono text-[var(--tinta)]">onClick</code> renders{" "}
                <code className="font-mono text-[var(--tinta)]">&lt;button&gt;</code> with
                focus ring. Omit for static <code className="font-mono text-[var(--tinta)]">&lt;span&gt;</code>.
                Demo requires a Client Component.
              </p>
            </div>
          </div>
        </DevSection>

        {/* ─── SectionHead ─── */}
        <DevSection label="SectionHead — Fase 3C">
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

        {/* ─── PieceCard gallery ─── */}
        <DevSection label="PieceCard gallery — Fase 3C">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {MOCK_PIECES.map((piece) => (
              <PieceCard key={piece.name} variant="gallery" {...piece} />
            ))}
          </div>
        </DevSection>

        {/* ─── PieceCard compact ─── */}
        <DevSection label="PieceCard compact — Fase 3C">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {MOCK_PIECES.map((piece) => (
              <PieceCard key={piece.name} variant="compact" {...piece} />
            ))}
          </div>
        </DevSection>

        {/* ─── PieceCard river ─── */}
        <DevSection label="PieceCard river — Fase 3C">
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
