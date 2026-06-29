export const STYLE_OS_STORAGE_BUCKETS = {
  closetItems: "closet-items",
  wishlistItems: "wishlist-items",
  outfitLooks: "outfit-looks",
  profile: "profile",
} as const;

export const ITEM_IMAGE_TYPES = [
  "main",
  "front",
  "back",
  "detail",
  "try_on",
  "transparent_cutout",
] as const;

export type ItemImageType = (typeof ITEM_IMAGE_TYPES)[number];

export function buildItemImagePath({
  itemId,
  imageType,
  extension = "webp",
}: {
  itemId: string;
  imageType: ItemImageType;
  extension?: "webp" | "png" | "jpg" | "jpeg";
}) {
  return `${itemId}/${imageType}.${extension}`;
}
