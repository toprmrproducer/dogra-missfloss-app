import { NextRequest, NextResponse } from "next/server";

/**
 * Demo backend stub. Catches every /api/v1/* request the UI makes and returns
 * shape-compatible defaults that mirror the generated SDK response types
 * (src/client/types.gen.ts) so each dashboard page renders cleanly without
 * a real FastAPI backend. Removed when the Railway-hosted backend lands
 * (Tasks.md #10) — drop this file and reset BACKEND_URL.
 *
 * Hard rule applied here: LLM = Anthropic only. No OpenAI / GPT anywhere.
 */

const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

// ───────────────────────── Provider catalogs ─────────────────────────

const TELEPHONY_PROVIDERS = [
  { provider: "twilio", display_name: "Twilio", fields: ["account_sid", "auth_token", "sip_domain"] },
  { provider: "vobiz", display_name: "Vobiz", fields: ["auth_id", "auth_token", "application_id"] },
  { provider: "plivo", display_name: "Plivo", fields: ["auth_id", "auth_token"] },
  { provider: "vonage", display_name: "Vonage", fields: ["api_key", "api_secret", "application_id"] },
  { provider: "telnyx", display_name: "Telnyx", fields: ["api_key", "connection_id"] },
  { provider: "cloudonix", display_name: "Cloudonix", fields: ["api_key", "domain"] },
];

// Anthropic-only LLM (NEVER OpenAI/GPT — Shreyas rule)
const LLM_SCHEMA = {
  anthropic: {
    display_name: "Anthropic Claude",
    model_options: [
      "claude-opus-4-8",
      "claude-opus-4-7",
      "claude-sonnet-4-6",
      "claude-haiku-4-5",
    ],
    api_key_field: "anthropic_api_key",
  },
};

const REALTIME_SCHEMA = {
  google: {
    display_name: "Gemini Live",
    model_options: ["gemini-3.1-flash-live-preview", "gemini-2.5-flash-live"],
    voice_options: ["Puck", "Charon", "Kore", "Fenrir", "Aoede"],
    api_key_field: "google_api_key",
  },
};

const TTS_SCHEMA = {
  elevenlabs: {
    display_name: "ElevenLabs",
    model_options: ["eleven_turbo_v2_5", "eleven_multilingual_v2"],
    api_key_field: "elevenlabs_api_key",
  },
  sarvam: { display_name: "Sarvam", model_options: ["bulbul-v2"], api_key_field: "sarvam_api_key" },
  cartesia: { display_name: "Cartesia", model_options: ["sonic-2"], api_key_field: "cartesia_api_key" },
  deepgram: { display_name: "Deepgram Aura", model_options: ["aura-2-en"], api_key_field: "deepgram_api_key" },
  rime: { display_name: "Rime", model_options: ["mistv2"], api_key_field: "rime_api_key" },
};

const STT_SCHEMA = {
  deepgram: { display_name: "Deepgram", model_options: ["nova-3"], api_key_field: "deepgram_api_key" },
  sarvam: { display_name: "Sarvam", model_options: ["saarika-v2"], api_key_field: "sarvam_api_key" },
};

const VOICE_LIBRARIES: Record<string, Array<{ id: string; name: string; gender: string; preview_url?: string }>> = {
  elevenlabs: [
    { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", gender: "female" },
    { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", gender: "female" },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", gender: "female" },
    { id: "ErXwobaYiN019PkySvjV", name: "Antoni", gender: "male" },
  ],
  sarvam: [
    { id: "meera", name: "Meera", gender: "female" },
    { id: "arjun", name: "Arjun", gender: "male" },
  ],
  cartesia: [{ id: "sonic-default", name: "Sonic", gender: "female" }],
  deepgram: [{ id: "aura-2-en-us-female", name: "Aura Female", gender: "female" }],
  dograh: [{ id: "default", name: "Default", gender: "female" }],
  rime: [{ id: "mistv2", name: "MistV2", gender: "female" }],
};

// ───────────────────────── Response builders ─────────────────────────

function defaultUser() {
  return {
    id: "demo-user",
    email: "demo@missfloss.dev",
    name: "Demo Clinic",
    onboarding_completed: true,
    provider: "demo",
    organization_id: "demo-org",
    role: "owner",
  };
}

function defaultUserConfigurations() {
  return {
    llm_provider: "anthropic",
    llm_model: "claude-opus-4-7",
    realtime_provider: "google",
    realtime_model: "gemini-3.1-flash-live-preview",
    realtime_voice: "Puck",
    tts_provider: "elevenlabs",
    tts_model: "eleven_turbo_v2_5",
    tts_voice_id: "21m00Tcm4TlvDq8ikWAM",
    stt_provider: "deepgram",
    stt_model: "nova-3",
    is_realtime: true,
    overrides: {},
  };
}

function defaultsForPath(path: string, method: string): unknown {
  const p = "/" + path;

  // ── Health + version ─────────────────────────────
  if (p === "/health") return { status: "ok", demo: true };
  if (p === "/version") return { version: "demo-1.33.0" };

  // ── Auth & user identity ─────────────────────────
  if (p === "/auth/me" || p === "/user/auth-user") return defaultUser();
  if (p.startsWith("/auth/")) return { ok: true };

  // ── User configurations ──────────────────────────
  if (p === "/user/configurations/user") return defaultUserConfigurations();
  if (p === "/user/configurations/defaults") {
    return { llm: LLM_SCHEMA, tts: TTS_SCHEMA, stt: STT_SCHEMA, realtime: REALTIME_SCHEMA };
  }
  if (p === "/user/configurations/user/validate") return { valid: true, errors: [] };
  if (p.startsWith("/user/configurations/voices/")) {
    const provider = p.split("/").pop()?.toLowerCase() ?? "";
    return { voices: VOICE_LIBRARIES[provider] ?? [] };
  }

  // ── User keys ────────────────────────────────────
  if (p === "/user/api-keys") return { api_keys: [] };
  if (p === "/user/service-keys") return { service_keys: [] };

  // ── Workflows ────────────────────────────────────
  if (p === "/workflow/count") return { total: 0, active: 0, inactive: 0 };
  if (p === "/workflow/fetch" || p === "/workflow/summary") return { workflows: [] };
  if (p === "/workflow/templates") return { templates: [] };
  if (p.startsWith("/workflow/") && p.endsWith("/runs")) return { runs: [], total: 0 };
  if (p.startsWith("/workflow/")) return { id: 0, name: "", status: "draft", nodes: [], edges: [] };

  // ── Campaigns ────────────────────────────────────
  if (p === "/campaign" || p === "/campaign/") return { campaigns: [] };
  if (p.startsWith("/campaign/") && p.endsWith("/progress")) return { total: 0, completed: 0, in_progress: 0, failed: 0 };
  if (p.startsWith("/campaign/") && p.endsWith("/runs")) return { runs: [], total: 0 };
  if (p.startsWith("/campaign/")) {
    return {
      id: 0,
      name: "",
      state: "draft",
      created_at: new Date(0).toISOString(),
      updated_at: new Date(0).toISOString(),
    };
  }

  // ── Telephony ────────────────────────────────────
  if (p === "/organizations/telephony-providers/metadata") return { providers: TELEPHONY_PROVIDERS };
  if (p === "/organizations/telephony-configs") return { configurations: [] };
  if (p.includes("/telephony-config-warnings")) return { warnings: [] };
  if (p.startsWith("/organizations/telephony-configs/") && p.endsWith("/phone-numbers")) return { phone_numbers: [] };
  if (p.startsWith("/organizations/telephony-configs/")) {
    return { id: 0, name: "", provider: "", configuration: {}, phone_numbers: [], is_default_outbound: false };
  }
  if (p === "/organizations/telephony-config") return { configuration: null };

  // ── Organizations ────────────────────────────────
  if (p === "/organizations/campaign-defaults") return { defaults: {} };
  if (p === "/organizations/langfuse-credentials") return { credentials: null };
  if (p === "/organizations/usage/current-period") return { used: 0, total: 1000, period_start: new Date(0).toISOString(), period_end: new Date(0).toISOString() };
  if (p === "/organizations/usage/daily-breakdown") return { breakdown: [] };
  if (p === "/organizations/usage/mps-credits") return { credits: 0 };
  if (p === "/organizations/usage/runs") return { runs: [], total: 0 };
  if (p === "/organizations/reports/daily") return { rows: [] };
  if (p === "/organizations/reports/daily/runs") return { runs: [] };
  if (p === "/organizations/reports/workflows") return { workflows: [] };

  // ── Tools / Files / Folders / Recordings / Knowledge base ────
  if (p === "/tools" || p === "/tools/") return { tools: [] };
  if (p === "/folder" || p === "/folder/") return { folders: [] };
  if (p === "/workflow/recordings" || p.includes("/recordings")) return { recordings: [] };
  if (p.includes("/knowledge-base/documents")) return { documents: [] };

  // ── Credentials ──────────────────────────────────
  if (p === "/credentials" || p === "/credentials/") return { credentials: [] };

  // ── Node types ──────────────────────────────────
  if (p === "/node-types") return { node_types: [] };

  // ── Superuser (always empty in demo) ────────────
  if (p.startsWith("/superuser/")) return { items: [], total: 0 };

  // ── Writes ───────────────────────────────────────
  if (method !== "GET") return { success: true, demo: true };

  // ── Generic GET fallback ─────────────────────────
  return {};
}

async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const joined = (path || []).join("/");
  return json(defaultsForPath(joined, req.method));
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
