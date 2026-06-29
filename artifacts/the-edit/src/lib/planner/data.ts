import {
  outfitLogWeek,
  outfitLogStats,
  type OutfitLogDay,
  type OutfitLogStatus,
} from "@/lib/mock-outfit-log";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type { OutfitLogDay, OutfitLogStatus };

export type PlannerStats = {
  planned: number;
  worn: number;
  open: number;
  skipped: number;
};

function mapOutfitLogRow(row: Record<string, unknown>): OutfitLogDay {
  const logDate =
    typeof row.log_date === "string" ? new Date(row.log_date + "T00:00:00") : new Date();

  const day = logDate.toLocaleDateString("en-US", { weekday: "long" });
  const date = logDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return {
    id: typeof row.id === "string" ? row.id : String(row.log_date),
    day,
    date,
    status: (row.status as OutfitLogStatus) ?? "open",
    title: typeof row.title === "string" && row.title ? row.title : "Needs outfit",
    outfitNeed: typeof row.outfit_need === "string" ? row.outfit_need : "",
    formula: Array.isArray(row.formula)
      ? (row.formula as string[]).filter((f) => typeof f === "string")
      : [],
    weatherNote: typeof row.weather_note === "string" ? row.weather_note : "",
    repeatSignal: typeof row.repeat_signal === "string" ? row.repeat_signal : "",
    notes: typeof row.notes === "string" ? row.notes : "",
  };
}

export async function getPlannerWeek(): Promise<{
  entries: OutfitLogDay[];
  stats: PlannerStats;
}> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return {
      entries: outfitLogWeek,
      stats: outfitLogStats,
    };
  }

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const toISO = (d: Date) => d.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("outfit_log")
    .select("*")
    .gte("log_date", toISO(monday))
    .lte("log_date", toISO(sunday))
    .order("log_date", { ascending: true });

  if (error) {
    console.warn("Planner: failed to load from Supabase, using mock data.", error.message);
    return {
      entries: outfitLogWeek,
      stats: outfitLogStats,
    };
  }

  if (!data || data.length === 0) {
    return {
      entries: outfitLogWeek,
      stats: outfitLogStats,
    };
  }

  const entries = (data as Record<string, unknown>[]).map(mapOutfitLogRow);

  const stats: PlannerStats = {
    planned: entries.filter((e) => e.status === "planned").length,
    worn: entries.filter((e) => e.status === "worn").length,
    open: entries.filter((e) => e.status === "open").length,
    skipped: entries.filter((e) => e.status === "skipped").length,
  };

  return { entries, stats };
}
