import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { OutfitEditor } from "@/components/outfit-editor";
import {
  composeOutfits,
  type ComposedOutfit,
} from "@/lib/style-profile/outfit-composer";
import type { WardrobeItem } from "@/types/wardrobe";

type OutfitBuilderProps = {
  items: WardrobeItem[];
  selectedPiece?: WardrobeItem;
};

const CATEGORY_LABELS: Record<string, string> = {
  outerwear: "Outerwear",
  top: "Top",
  bottom: "Parte de abajo",
  dress: "Vestido",
  shoes: "Zapatos",
  bag: "Bolso",
  accessory: "Accesorio",
  jewelry: "Joyería",
};

function SelectedPieceCard({ piece }: { piece: WardrobeItem }) {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-2 pt-6 md:px-10">
      <div className="flex items-center gap-5 rounded-[10px] border border-[rgba(122,46,53,0.14)] bg-[rgba(255,253,252,0.82)] px-5 py-4 shadow-[0_6px_24px_rgba(74,47,34,0.06)] backdrop-blur-sm">

        {piece.imageUrl ? (
          <div
            className="h-16 w-16 flex-shrink-0 rounded-[6px] border border-[var(--line)] bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${piece.imageUrl})` }}
            aria-label={piece.name}
          />
        ) : (
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[6px] border border-[var(--line)] bg-[var(--paper-3)]">
            <span className="font-display text-lg leading-none text-[var(--espresso)]">
              {piece.name.charAt(0)}
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-[0.44rem] font-800 uppercase tracking-[0.18em] text-[var(--caramel)]">
            Estilismo desde
          </p>
          <p className="font-display truncate text-[1.35rem] leading-none text-[var(--espresso)]">
            {piece.name}
          </p>
          <p className="mt-1 text-[0.52rem] font-semibold uppercase tracking-[0.1em] text-[var(--coffee)]">
            {CATEGORY_LABELS[piece.category] ?? piece.category}
            {" · "}
            {piece.colorName}
            {piece.size ? ` · ${piece.size}` : ""}
          </p>
        </div>

        <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row">
          <Link
            href="/closet/gallery"
            className="inline-flex items-center rounded-full border border-[rgba(122,46,53,0.18)] bg-[var(--paper)] px-3.5 py-2 text-[0.48rem] font-800 uppercase tracking-[0.14em] text-[var(--burgundy)] no-underline transition hover:bg-[rgba(122,46,53,0.06)]"
          >
            Cambiar pieza
          </Link>
          <Link
            href="/closet"
            className="inline-flex items-center rounded-full border border-[var(--line)] bg-transparent px-3.5 py-2 text-[0.48rem] font-semibold uppercase tracking-[0.14em] text-[var(--coffee)] no-underline transition hover:border-[var(--caramel)]"
          >
            Volver al clóset
          </Link>
        </div>

      </div>
    </div>
  );
}

type OutfitSlot = {
  id: string;
  label: string;
  helper: string;
};

function activeOnly(items: WardrobeItem[]) {
  return items.filter((item) => (item.itemStatus ?? "active") === "active");
}

function countByCategory(items: WardrobeItem[]) {
  return items.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.category] = (accumulator[item.category] ?? 0) + 1;
    return accumulator;
  }, {});
}

function formatMachineLabel(value: string) {
  return value.replaceAll("_", " ").replaceAll("-", " ");
}

function decisionLabel(decision: ComposedOutfit["decision"]) {
  if (decision === "approved") return "Aprobado";
  if (decision === "needs_review") return "Revisar";
  return "Descartado";
}

function decisionClassName(decision: ComposedOutfit["decision"]) {
  if (decision === "approved") {
    return "border-[rgba(88,119,74,0.28)] bg-[rgba(88,119,74,0.10)] text-[var(--espresso)]";
  }

  if (decision === "needs_review") {
    return "border-[rgba(194,126,56,0.32)] bg-[rgba(194,126,56,0.10)] text-[var(--coffee)]";
  }

  return "border-[rgba(128,55,45,0.28)] bg-[rgba(128,55,45,0.10)] text-[var(--espresso)]";
}

function getPieceText(look: ComposedOutfit) {
  return look.items.map((item) => item.label).join(" + ");
}

function GeneratedLookCard({
  look,
  index,
  closetItems,
}: {
  look: ComposedOutfit;
  index: number;
  closetItems: WardrobeItem[];
}) {
  const visualItems = look.pieceIds
    .map((pieceId) => closetItems.find((item) => item.id === pieceId))
    .filter((item): item is WardrobeItem => Boolean(item));

  return (
    <article className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[0_18px_60px_rgba(74,47,34,0.05)]">
      <OutfitEditor
        items={visualItems}
        closetItems={closetItems}
        lookMetadata={{
          title: look.title,
          sourceOutfitId: look.id,
          formula: look.formula,
          decision: look.decision,
          generatedPieceIds: look.pieceIds,
          scores: {
            total: look.totalScore,
            color: look.colorScore,
            elevation: look.elevationScore,
          },
          stylingInstruction: look.stylingInstruction,
          whyItWorks: look.whyItWorks,
        }}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
            Estilo inteligente · Look {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="font-display mt-3 text-[2.35rem] leading-none text-[var(--espresso)]">
            {look.title}
          </h3>
        </div>

        <div
          className={`rounded-full border px-3 py-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.18em] ${decisionClassName(
            look.decision,
          )}`}
        >
          {decisionLabel(look.decision)}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] px-4 py-3">
          <p className="text-[0.52rem] font-semibold uppercase tracking-[0.18em] text-[var(--caramel)]">
            Total
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--espresso)]">
            {look.totalScore}
          </p>
        </div>

        <div className="rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] px-4 py-3">
          <p className="text-[0.52rem] font-semibold uppercase tracking-[0.18em] text-[var(--caramel)]">
            Color
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--espresso)]">
            {look.colorScore}
          </p>
        </div>

        <div className="rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] px-4 py-3">
          <p className="text-[0.52rem] font-semibold uppercase tracking-[0.18em] text-[var(--caramel)]">
            Elevation
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--espresso)]">
            {look.elevationScore}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] p-4">
        <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[var(--caramel)]">
          Piezas
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
          {getPieceText(look)}
        </p>
      </div>

      <div className="mt-5 space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
        <p>
          <span className="font-semibold text-[var(--espresso)]">Estilismo: </span>
          {look.stylingInstruction}
        </p>
        <p>
          <span className="font-semibold text-[var(--espresso)]">Fórmula: </span>
          {formatMachineLabel(look.formula)}
        </p>
        <p>
          <span className="font-semibold text-[var(--espresso)]">Color: </span>
          {formatMachineLabel(look.colorValidation.status)}
        </p>
        <p>
          <span className="font-semibold text-[var(--espresso)]">Estado de estilo: </span>
          {formatMachineLabel(look.stylingValidation.stylingStatus)}
        </p>
      </div>

      <details className="mt-5 rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] p-4">
        <summary className="cursor-pointer text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)]">
          Por qué funciona
        </summary>
        <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
          {look.whyItWorks.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </div>
      </details>
    </article>
  );
}

export function OutfitBuilder({ items, selectedPiece }: OutfitBuilderProps) {
  const activeItems = activeOnly(items);
  const categoryCounts = countByCategory(activeItems);

  const generatedLooks = composeOutfits(activeItems, {
    occasion: "office",
    maxLooks: 8,
    includeOuterwear: true,
    includeAccessories: true,
    allowDenim: false,
    requireColorApproval: false,
    pushBeyondComfort: true,
  });

  const approvedLooks = generatedLooks.filter((look) => look.decision === "approved");
  const reviewLooks = generatedLooks.filter((look) => look.decision === "needs_review");

  const slots: OutfitSlot[] = [
    {
      id: "top",
      label: "Top",
      helper: "Elige un top que defina el color del look.",
    },
    {
      id: "bottom",
      label: "Parte de abajo",
      helper: "Ancla el outfit con la silueta correcta.",
    },
    {
      id: "shoes",
      label: "Zapatos",
      helper: "Complementa el mood, no solo la categoría.",
    },
    {
      id: "layer",
      label: "Capa",
      helper: "Blazer, cardigan o chaleco opcional.",
    },
    {
      id: "finishing",
      label: "Pieza final",
      helper: "Bolso, cinturón, joyería o detalle de estilo.",
    },
  ];

  const categorySummary = [
    ["Tops", categoryCounts.top ?? 0],
    ["Pantalones", categoryCounts.bottom ?? 0],
    ["Zapatos", categoryCounts.shoes ?? 0],
    ["Outerwear", categoryCounts.outerwear ?? 0],
    ["Bolsos", categoryCounts.bag ?? 0],
    ["Accesorios", categoryCounts.accessory ?? 0],
    ["Joyería", categoryCounts.jewelry ?? 0],
    ["Vestidos", categoryCounts.dress ?? 0],
  ];

  return (
    <section className="pb-16 md:pb-20">
      <PageHeader
        eyebrow="Mesa de edición"
        title={
          <>
            Crea looks desde{" "}
            <em className="text-[var(--coffee)]">tu clóset real.</em>
          </>
        }
        description="El sistema lee tu clóset activo y genera combinaciones para la oficina usando tus reglas de color, silueta y elevación."
        asideEyebrow="Inteligencia de estilo"
        asideText="Generado desde piezas reales del clóset. Denim desactivado para esta vista de oficina."
      >
        <div className="flex flex-wrap gap-5">
          <Link
            href="/closet"
            className="border-b-[1.5px] border-transparent pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)] no-underline transition hover:border-[var(--coffee)]"
          >
            El Archivo
          </Link>
          <Link
            href="/outfits"
            className="border-b-[1.5px] border-[var(--espresso)] pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--espresso)] no-underline"
          >
            Mesa de edición
          </Link>
        </div>
      </PageHeader>

      {selectedPiece ? <SelectedPieceCard piece={selectedPiece} /> : null}

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="relative overflow-hidden rounded-[8px] border border-[var(--line)] bg-[var(--espresso)] p-8 text-[var(--paper)]">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
              Clóset activo disponible
            </p>
            <p className="mt-6 font-display text-8xl leading-none">
              {activeItems.length}
            </p>
            <p className="mt-6 max-w-md text-sm leading-7 text-[rgba(255,248,237,0.76)]">
              Las piezas elegibles para las fórmulas de outfits. Se excluyen archivadas,
              donadas, vendidas y dañadas.
            </p>
          </article>

          <article className="rounded-[8px] border border-[var(--line)] bg-[var(--paper-2)] p-8">
            <p className="eyebrow mb-3">Motor de recomendación</p>
            <h2 className="font-display text-4xl text-[var(--espresso)]">
              Activo
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
              El sistema verifica armonía de color, fórmula de outfit, pulido de oficina,
              balance de silueta y la regla de elevación antes de mostrar looks.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[4px] border border-[var(--line)] bg-[var(--paper)] p-4">
                <p className="text-3xl font-semibold text-[var(--espresso)]">
                  {generatedLooks.length}
                </p>
                <p className="mt-2 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[var(--caramel)]">
                  Generados
                </p>
              </div>

              <div className="rounded-[4px] border border-[var(--line)] bg-[var(--paper)] p-4">
                <p className="text-3xl font-semibold text-[var(--espresso)]">
                  {approvedLooks.length}
                </p>
                <p className="mt-2 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[var(--caramel)]">
                  Aprobados
                </p>
              </div>

              <div className="rounded-[4px] border border-[var(--line)] bg-[var(--paper)] p-4">
                <p className="text-3xl font-semibold text-[var(--espresso)]">
                  {reviewLooks.length}
                </p>
                <p className="mt-2 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[var(--caramel)]">
                  A revisar
                </p>
              </div>
            </div>
          </article>
        </div>

        <div className="mt-8 rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] p-5 md:p-7">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow mb-2">Generado por inteligencia de estilo</p>
              <h2 className="font-display text-4xl text-[var(--espresso)]">
                Ideas para oficina
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--ink-soft)]">
              No son combinaciones aleatorias. Cada look tiene puntuación de color,
              elevación, proporción y uso en oficina.
            </p>
          </div>

          {generatedLooks.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {generatedLooks.map((look, index) => (
                <GeneratedLookCard key={look.id} look={look} index={index} closetItems={activeItems} />
              ))}
            </div>
          ) : (
            <div className="rounded-[4px] border border-dashed border-[var(--line)] bg-[var(--paper)] p-8 text-sm leading-7 text-[var(--ink-soft)]">
              Aún no hay looks generados. Añade más piezas activas al clóset: tops, pantalones,
              zapatos, bolsos o accesorios.
            </div>
          )}
        </div>

        <div className="mt-8 rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] p-5 md:p-7">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow mb-2">Estructura de fórmula</p>
              <h2 className="font-display text-4xl text-[var(--espresso)]">
                Slots que el motor completa
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--ink-soft)]">
              El compositor parte de un outfit base y añade zapatos y anclajes de estilo.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {slots.map((slot) => (
              <article
                key={slot.id}
                className="rounded-[8px] border border-dashed border-[var(--line)] bg-[var(--paper)] p-5"
              >
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
                  {slot.label}
                </p>
                <div className="mt-5 flex h-52 items-center justify-center rounded-[4px] bg-[var(--paper-2)] px-5 text-center text-sm leading-6 text-[var(--ink-soft)]">
                  {slot.helper}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-[8px] border border-[var(--line)] bg-[var(--paper-2)] p-7">
          <p className="eyebrow mb-3">Piezas por slot</p>
          <h2 className="font-display text-4xl text-[var(--espresso)]">
            Con qué puede trabajar el constructor
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categorySummary.map(([label, count]) => (
              <div
                key={label}
                className="rounded-[4px] border border-[var(--line)] bg-[var(--paper)] px-5 py-4"
              >
                <p className="text-3xl font-semibold text-[var(--espresso)]">
                  {count}
                </p>
                <p className="mt-2 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[var(--caramel)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
