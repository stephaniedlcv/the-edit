import { styleProfile } from "@/lib/style-profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapStyleProfile } from "@/lib/supabase/mappers";

export async function getStyleProfile() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return styleProfile;
  }

  const { data, error } = await supabase
    .from("style_profiles")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load style_profile from Supabase:", error.message);
    return styleProfile;
  }

  if (!data) {
    return styleProfile;
  }

  return mapStyleProfile(data as never);
}
