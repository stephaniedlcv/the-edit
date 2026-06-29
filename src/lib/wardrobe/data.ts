import { mockOwnedItems } from "@/lib/mock-owned-items";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapWardrobeItem } from "@/lib/supabase/mappers";
import type { WardrobeItem } from "@/types/wardrobe";

async function attachSignedWardrobeImageUrls(items: WardrobeItem[]) {
  const supabase = getSupabaseServerClient();

  if (!supabase || items.length === 0) {
    return items;
  }

  const signedItems = await Promise.all(
    items.map(async (item) => {
      const imagePath = item.imagePath ?? item.imageUrl;

      if (!imagePath) {
        return item;
      }

      const { data, error } = await supabase.storage
        .from("closet-items")
        .createSignedUrl(imagePath, 60 * 60);

      if (error || !data?.signedUrl) {
        return item;
      }

      return {
        ...item,
        imageUrl: data.signedUrl,
      };
    }),
  );

  return signedItems;
}


export async function getWardrobeItems(): Promise<WardrobeItem[]> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return mockOwnedItems;
  }

  const { data, error } = await supabase
    .from("wardrobe_items")
    .select("*, wardrobe_item_images(*)")
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load wardrobe_items from Supabase:", error.message);
    return mockOwnedItems;
  }

  if (!data?.length) {
    return [];
  }

  return attachSignedWardrobeImageUrls(data.map((item) => mapWardrobeItem(item as never)));
}
