import { NextResponse } from "next/server";
import { getCalendarEvents } from "@/lib/calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  const now = Date.now();
  const rangeStart = startParam ? new Date(startParam) : new Date(now - 24 * 60 * 60 * 1000);
  const rangeEnd = endParam ? new Date(endParam) : new Date(now + 8 * 24 * 60 * 60 * 1000);

  if (Number.isNaN(rangeStart.getTime()) || Number.isNaN(rangeEnd.getTime())) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  try {
    const result = await getCalendarEvents(rangeStart, rangeEnd);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Calendar fetch failed:", error);
    return NextResponse.json(
      { error: "Could not read the calendar feed." },
      { status: 502 },
    );
  }
}
