import { NextRequest, NextResponse } from "next/server";

/**
 * Demo backend stub. Catches every /api/v1/* request the UI makes and returns
 * shape-compatible empty defaults so the dashboard renders without console
 * errors. The real Dograh FastAPI takes over once the Railway deploy lands
 * (Tasks.md #10) and this file can be removed.
 */

const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

function defaultForPath(path: string, method: string): unknown {
  const p = "/" + path;

  // Health + version
  if (p === "/health") return { status: "ok", demo: true };
  if (p === "/version") return { version: "demo-1.33.0" };

  // Auth (already handled client-side, but keep safe defaults)
  if (p.startsWith("/auth/")) return { ok: true };

  // Workflow counts + lists
  if (p === "/workflow/count") return { total: 0, active: 0, inactive: 0 };
  if (p === "/workflow" || p === "/workflows") return { items: [], total: 0 };
  if (p.startsWith("/workflow/")) return { id: 0, name: "", status: "draft", nodes: [] };

  // Telephony
  if (p.includes("telephony-config-warnings")) return [];
  if (p.includes("telephony-config") || p.includes("telephony_config")) return { items: [], total: 0 };
  if (p.includes("telephony")) return { items: [], total: 0 };

  // User + organizations + workspaces
  if (p.endsWith("/user/configurations/user")) {
    return {
      id: "demo-user",
      email: "demo@missfloss.dev",
      name: "Demo Clinic",
      onboarding_completed: true,
      provider: "demo",
    };
  }
  if (p.startsWith("/user")) return { id: "demo-user", email: "demo@missfloss.dev" };
  if (p.startsWith("/organization") || p.includes("/organizations")) {
    return { id: "demo-org", name: "Brampton Family Dental", role: "owner" };
  }
  if (p.startsWith("/workspace") || p.includes("/workspaces")) {
    return { items: [{ id: "demo-ws", name: "Brampton Family Dental", role: "owner" }], total: 1 };
  }

  // Usage / quota / billing
  if (p.includes("/usage") || p.includes("/quota") || p.includes("/billing")) {
    return { used: 0, total: 1000, dograh_token_usage: 0, quota_dograh_tokens: 1000 };
  }

  // Tools / models / api-keys / files / recordings / campaigns / analytics / reports
  if (
    p.includes("/tool") ||
    p.includes("/model") ||
    p.includes("/api-key") ||
    p.includes("/api_key") ||
    p.includes("/file") ||
    p.includes("/recording") ||
    p.includes("/campaign") ||
    p.includes("/analytic") ||
    p.includes("/report") ||
    p.includes("/automation") ||
    p.includes("/integration")
  ) {
    return { items: [], total: 0 };
  }

  // Settings (key/value lookups)
  if (p.includes("/setting")) return {};

  // POST/PUT/DELETE writes - acknowledge success
  if (method !== "GET") return { success: true, demo: true };

  // Catch-all fallback
  return { items: [], total: 0 };
}

async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const joined = (path || []).join("/");
  const body = defaultForPath(joined, req.method);
  return json(body);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
