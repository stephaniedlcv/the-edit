import { AtelierPlaceholder } from "@/components/atelier-placeholder";
import type { WardrobeCategory, WardrobeItem } from "@/types/wardrobe";

type GeneratedOutfitVisualProps = {
  items: WardrobeItem[];
};

const visualPositions = [
  { left: "7%", top: "8%", width: "31%", rotate: "-4deg" },
  { left: "37%", top: "7%", width: "28%", rotate: "3deg" },
  { left: "61%", top: "18%", width: "29%", rotate: "-2deg" },
  { left: "15%", top: "50%", width: "24%", rotate: "4deg" },
  { left: "43%", top: "55%", width: "22%", rotate: "-3deg" },
  { left: "66%", top: "58%", width: "20%", rotate: "5deg" },
];

function formatCategory(category: WardrobeCategory) {
  return category.replaceAll("_", " ").replaceAll("-", " ");
}

function OutfitVisualPiece({
  item,
  index,
}: {
  item: WardrobeItem;
  index: number;
}) {
  const position = visualPositions[index % visualPositions.length];

  const style = {
    left: position.left,
    top: position.top,
    width: position.width,
    transform: `rotate(${position.rotate})`,
    zIndex: index + 1,
  };

  if (item.imageUrl) {
    return (
      <div
        className="absolute aspect-[3/4] rounded-[5px] bg-white/45 bg-contain bg-center bg-no-repeat drop-shadow-[0_18px_28px_rgba(74,47,34,0.18)]"
        style={{
          ...style,
          backgroundImage: `url("${item.imageUrl}")`,
        }}
        aria-label={item.name}
        title={item.name}
      />
    );
  }

  return (
    <div
      className="absolute aspect-[3/4] drop-shadow-[0_18px_28px_rgba(74,47,34,0.18)]"
      style={style}
      title={item.name}
    >
      <AtelierPlaceholder
        name={item.name}
        colorName={item.colorName}
        colorFamily={item.colorFamily}
        category={formatCategory(item.category)}
        className="h-full"
        compact
      />
    </div>
  );
}

export function GeneratedOutfitVisual({ items }: GeneratedOutfitVisualProps) {
  const visibleItems = items.slice(0, 6);
  const hiddenCount = Math.max(0, items.length - visibleItems.length);

  return (
    <div className="relative mb-6 h-72 overflow-hidden rounded-[7px] border border-[var(--line)] bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.9),transparent_28%),linear-gradient(135deg,var(--paper-2),#ead8c0)]">
      <div className="absolute inset-5 border border-white/55" />

      {visibleItems.length > 0 ? (
        visibleItems.map((item, index) => (
          <OutfitVisualPiece key={`${item.id}-${index}`} item={item} index={index} />
        ))
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm leading-6 text-[var(--ink-soft)]">
          Add images to these closet pieces to preview the outfit collage.
        </div>
      )}

      {hiddenCount > 0 ? (
        <div className="absolute bottom-4 right-4 z-20 rounded-full border border-white/70 bg-[rgba(255,248,237,0.86)] px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-[var(--espresso)]">
          +{hiddenCount} more
        </div>
      ) : null}
    </div>
  );
}
