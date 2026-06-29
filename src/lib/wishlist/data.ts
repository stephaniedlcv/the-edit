import { mockWishlistItems } from "@/lib/mock-wishlist-items";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapWishlistItem } from "@/lib/supabase/mappers";
import { STYLE_OS_STORAGE_BUCKETS } from "@/lib/supabase/storage";
import type { WishlistItem } from "@/types/wardrobe";

async function attachSignedWishlistImageUrls(
  items: WishlistItem[],
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
): Promise<WishlistItem[]> {
  return Promise.all(
    items.map(async (item) => {
      if (!item.imagePath) return item;

      const { data, error } = await supabase.storage
        .from(STYLE_OS_STORAGE_BUCKETS.wishlistItems)
        .createSignedUrl(item.imagePath, 60 * 60);

      if (error || !data?.signedUrl) return item;

      return { ...item, imageUrl: data.signedUrl };
    }),
  );
}

export async function getWishlistItems(): Promise<WishlistItem[]> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return mockWishlistItems;
  }

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("*, wishlist_item_images(*), price_history(observed_at, price)")
    .eq("is_archived", false)
    .order("purchase_order", { ascending: true });

  if (error) {
    console.error("Failed to load wishlist_items from Supabase:", error.message);
    return mockWishlistItems;
  }

  if (!data?.length) {
    return [];
  }

  const mapped = data.map((item) => mapWishlistItem(item as never));
  return attachSignedWishlistImageUrls(mapped, supabase);
}
