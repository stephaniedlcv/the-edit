import { mockWishlistItems } from "@/lib/mock-wishlist-items";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mapWishlistItem } from "@/lib/supabase/mappers";
import type { WishlistItem } from "@/types/wardrobe";

export async function getWishlistItems(): Promise<WishlistItem[]> {
  const supabase = getSupabaseBrowserClient();

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

  // @ts-ignore
  return data.map((item) => mapWishlistItem(item));
}
