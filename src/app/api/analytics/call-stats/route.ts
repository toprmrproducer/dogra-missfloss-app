import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export async function GET(req: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const days = Math.min(parseInt(searchParams.get("days") ?? "30", 10), 90);
  const since = new Date(Date.now() - days * 86400_000).toISOString();

  const url =
    `${SUPABASE_URL}/rest/v1/call_stats` +
    `?select=day,total_calls,completed_calls,failed_calls,avg_duration_sec,total_cost_usd` +
    `&day=gte.${since}` +
    `&order=day.asc`;

  const resp = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    next: { revalidate: 300 },
  });

  if (!resp.ok) {
    return NextResponse.json({ error: "upstream error", status: resp.status }, { status: 502 });
  }

  const data = await resp.json();
  return NextResponse.json(data);
}
