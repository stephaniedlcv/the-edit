import type { WishlistItem } from "@/types/wardrobe";
import { AtelierPlaceholder } from "@/components/atelier-placeholder";
import { getColorFamilyMeta } from "@/lib/wardrobe/spectrum";

// ─── Labels en español ─────────────────────────────────────────────────────────

const DECISION_LABEL: Record<WishlistItem["decision"], string> = {
  "buy-priority": "Prioridad",
  wishlist:       "En lista",
  consider:       "Considerar",
  skip:           "Pausado",
};

const TIER_LABEL: Record<WishlistItem["priorityTier"], string> = {
  "foundation-buys":  "Bases",
  "color-builders":   "Color",
  "statement-review": "Statement",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMoney(value?: number) {
  if (typeof value !== "number") return "—";
  return `$${value.toFixed(0)}`;
}

// ─── MiniPriceLine ────────────────────────────────────────────────────────────

function MiniPriceLine({ item }: { item: WishlistItem }) {
  const history = item.priceHistory ?? [];
  if (history.length < 2) {
    return <div className="h-px w-full bg-[var(--line)]" />;
  }

  const prices = history.map((point) => point.price);
  const min    = Math.min(...prices);
  const max    = Math.max(...prices);
  const range  = max - min || 1;

  const points = prices
    .map((price, index) => {
      const x = (index / (prices.length - 1)) * 100;
      const y = 100 - ((price - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-8 w-full overflow-visible" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[var(--gold)]"
      />
    </svg>
  );
}

// ─── ColorChip ────────────────────────────────────────────────────────────────

function ColorChip({
  colorFamily,
  colorName,
}: {
  colorFamily: string;
  colorName?: string | null;
}) {
  const meta  = getColorFamilyMeta(colorFamily);
  const label = colorName && colorName !== colorFamily ? colorName : meta.labelEs;

  if (meta.kind === "special") {
    return (
      <span
        className="inline-flex items-center px-[0.45rem] py-[0.18rem]"
        style={{
          fontSize:      "0.5rem",
          fontWeight:    700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color:         "var(--ink-soft)",
          border:        "1px solid var(--line)",
          borderRadius:  "2px",
        }}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{
        fontSize:      "0.5rem",
        fontWeight:    700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color:         "var(--ink-soft)",
      }}
    >
      <span
        style={{
          display:      "inline-block",
          width:        "0.55rem",
          height:       "0.55rem",
          borderRadius: "50%",
          background:   meta.hex,
          border:       meta.borderHex ? `1px solid ${meta.borderHex}` : `1px solid rgba(0,0,0,0.08)`,
          flexShrink:   0,
        }}
      />
      {label}
    </span>
  );
}

// ─── WishlistCard ─────────────────────────────────────────────────────────────

export function WishlistCard({ item }: { item: WishlistItem }) {
  return (
    <article
      className="group overflow-hidden transition-shadow duration-200 hover:shadow-[0_4px_18px_rgba(36,26,18,0.09)]"
      style={{
        background:   "var(--paper)",
        border:       "1px solid rgba(95,63,50,0.1)",
        borderRadius: "3px",
      }}
    >
      {/* ── Imagen ─────────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--cream)", padding: "0.5rem 0.5rem 0" }}>
        {item.imageUrl ? (
          <div
            style={{
              height:              "18rem",
              backgroundImage:     `url(${item.imageUrl})`,
              backgroundSize:      "cover",
              backgroundPosition:  "center top",
              backgroundRepeat:    "no-repeat",
              borderRadius:        "2px 2px 0 0",
            }}
            aria-label={item.name}
          />
        ) : (
          <AtelierPlaceholder
            name={item.name}
            colorName={item.colorName}
            colorFamily={item.colorFamily}
            category={item.category}
            className="h-[18rem]"
          />
        )}
      </div>

      {/* ── Cuerpo ─────────────────────────────────────────────────────────── */}
      <div className="px-5 pb-5 pt-4">

        {/* Orden + tier / decision badge */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <p
            style={{
              fontSize:      "0.52rem",
              fontWeight:    700,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color:         "var(--caramel)",
            }}
          >
            #{String(item.purchaseOrder).padStart(2, "0")} · {TIER_LABEL[item.priorityTier]}
          </p>

          <span
            style={{
              flexShrink:    0,
              fontSize:      "0.48rem",
              fontWeight:    700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color:         "var(--espresso)",
              background:    "var(--paper-2)",
              border:        "1px solid rgba(95,63,50,0.14)",
              borderRadius:  "2px",
              padding:       "0.2rem 0.55rem",
            }}
          >
            {DECISION_LABEL[item.decision]}
          </span>
        </div>

        {/* Nombre */}
        <h3
          style={{
            fontFamily:    "var(--font-serif)",
            fontSize:      "1.75rem",
            fontWeight:    600,
            lineHeight:    1.02,
            color:         "var(--espresso)",
            marginBottom:  "0.5rem",
          }}
        >
          {item.name}
        </h3>

        {/* Color chip + price watch badge */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <ColorChip colorFamily={item.colorFamily} colorName={item.colorName} />

          {item.priceWatch && (
            <span
              style={{
                fontSize:      "0.46rem",
                fontWeight:    700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color:         "var(--gold)",
                border:        "1px solid var(--gold)",
                borderRadius:  "2px",
                padding:       "0.18rem 0.45rem",
              }}
            >
              Price watch
            </span>
          )}
        </div>

        {/* Scores */}
        <div
          className="grid grid-cols-3 text-center"
          style={{
            borderTop:    "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
            padding:      "0.85rem 0",
            marginBottom: "1rem",
          }}
        >
          <div>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", lineHeight: 1, color: "var(--espresso)" }}>
              {item.priorityScore}
            </p>
            <p style={{ marginTop: "0.28rem", fontSize: "0.45rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--caramel)" }}>
              Señal
            </p>
          </div>

          <div style={{ borderLeft: "1px solid var(--line)", borderRight: "1px solid var(--line)" }}>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", lineHeight: 1, color: "var(--espresso)" }}>
              {item.outfitPotential}
            </p>
            <p style={{ marginTop: "0.28rem", fontSize: "0.45rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--caramel)" }}>
              Outfits
            </p>
          </div>

          <div>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", lineHeight: 1, color: "var(--espresso)" }}>
              {item.closetImpactScore}
            </p>
            <p style={{ marginTop: "0.28rem", fontSize: "0.45rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--caramel)" }}>
              Impacto
            </p>
          </div>
        </div>

        {/* Precio */}
        <div className="grid items-end gap-4" style={{ gridTemplateColumns: "1fr 5.5rem" }}>
          <div>
            <p style={{ fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--caramel)" }}>
              Señal de precio
            </p>
            <div className="mt-1.5">
              <MiniPriceLine item={item} />
            </div>
          </div>

          <div className="text-right">
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", lineHeight: 1, color: "var(--espresso)" }}>
              {formatMoney(item.currentPrice)}
            </p>
            <p style={{ marginTop: "0.25rem", fontSize: "0.47rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-soft)" }}>
              Obj. {formatMoney(item.targetPrice)}
            </p>
          </div>
        </div>

        {/* Notas */}
        {item.notes && (
          <p
            style={{
              marginTop:  "1rem",
              fontSize:   "0.85rem",
              lineHeight: 1.8,
              color:      "var(--ink-soft)",
            }}
          >
            {item.notes}
          </p>
        )}

      </div>
    </article>
  );
}
