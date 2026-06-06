import { NextRequest, NextResponse } from "next/server";

/**
 * Demo backend stub. Catches every /api/v1/* request the UI makes and returns
 * shape-compatible defaults that mirror the generated SDK response types
 * (src/client/types.gen.ts) AND the runtime expectations of the form
 * components (ServiceConfigurationForm reads providerSchema.properties,
 * ConfigFormDialog renders TelephonyProviderUiField objects).
 *
 * Hard rule applied here: LLM = Anthropic only. No OpenAI / GPT.
 */

const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

// ───────────────────────── Telephony providers ─────────────────────────

type TelephonyField = {
  name: string;
  label: string;
  type: string;
  required: boolean;
  sensitive: boolean;
  description?: string | null;
  placeholder?: string | null;
};

const f = (
  name: string,
  label: string,
  type: string,
  required: boolean,
  sensitive: boolean,
  description?: string,
  placeholder?: string,
): TelephonyField => ({ name, label, type, required, sensitive, description: description ?? null, placeholder: placeholder ?? null });

const TELEPHONY_PROVIDERS = [
  {
    provider: "twilio",
    display_name: "Twilio",
    docs_url: "https://www.twilio.com/docs/voice",
    fields: [
      f("account_sid", "Account SID", "text", true, false, "Find this in your Twilio Console under Account Info.", "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"),
      f("auth_token", "Auth Token", "password", true, true, "Twilio Auth Token from the same Console panel.", "Click Show, then paste here"),
      f("sip_domain", "SIP Domain", "text", false, false, "Required only for Elastic SIP Trunking outbound calls.", "your-trunk.pstn.twilio.com"),
      f("sip_username", "SIP Username", "text", false, false, "Optional Elastic SIP credential username."),
      f("sip_password", "SIP Password", "password", false, true, "Optional Elastic SIP credential password."),
    ],
  },
  {
    provider: "vobiz",
    display_name: "Vobiz",
    docs_url: "https://app.vobiz.ai/docs",
    fields: [
      f("auth_id", "Auth ID", "text", true, false, "Vobiz Console → API Keys.", "MA_xxxxxxxxxxxxxxxx"),
      f("auth_token", "Auth Token", "password", true, true, "Vobiz Auth Token from the same panel."),
      f("application_id", "Application ID", "text", true, false, "The Application that the inbound calls route to.", "59414766047197048"),
    ],
  },
  {
    provider: "plivo",
    display_name: "Plivo",
    docs_url: "https://www.plivo.com/docs/voice/api/",
    fields: [
      f("auth_id", "Auth ID", "text", true, false, "Plivo Console → Account → Account ID.", "MAxxxxxxxxxxxxxxxxxx"),
      f("auth_token", "Auth Token", "password", true, true, "Plivo Auth Token from the same page."),
    ],
  },
  {
    provider: "vonage",
    display_name: "Vonage",
    docs_url: "https://developer.vonage.com/en/voice/voice-api/overview",
    fields: [
      f("api_key", "API Key", "text", true, false, "Vonage Dashboard → API Key.", "abcd1234"),
      f("api_secret", "API Secret", "password", true, true, "Vonage Dashboard → API Secret."),
      f("application_id", "Application ID", "text", true, false, "Voice application UUID."),
      f("private_key", "Private Key", "textarea", true, true, "Paste the contents of private.key from your Vonage Application."),
    ],
  },
  {
    provider: "telnyx",
    display_name: "Telnyx",
    docs_url: "https://developers.telnyx.com/docs/voice",
    fields: [
      f("api_key", "API Key v2", "password", true, true, "Telnyx Portal → API Keys.", "KEYxxxxxxxxxxxxxxxx"),
      f("connection_id", "Connection ID", "text", true, false, "The Telnyx Voice Connection used to dial."),
    ],
  },
  {
    provider: "cloudonix",
    display_name: "Cloudonix",
    docs_url: "https://docs.cloudonix.io/",
    fields: [
      f("api_key", "API Key", "password", true, true, "Cloudonix Console → API Keys."),
      f("domain", "Domain", "text", true, false, "Your Cloudonix tenant domain.", "your-clinic.cloudonix.io"),
    ],
  },
];

// ───────────────────────── AI provider schemas (JSON-Schema style) ─────────────────────────

type SchemaProperty = {
  type: string;
  default?: string | number | boolean | string[];
  enum?: string[];
  description?: string;
  format?: string;
};

type ProviderSchema = {
  display_name: string;
  description?: string;
  provider_docs_url?: string;
  properties: Record<string, SchemaProperty>;
  model_options?: Record<string, string[]>;
  voice_options?: string[];
};

const baseLlmProperties = (modelDefault: string): Record<string, SchemaProperty> => ({
  provider: { type: "string", default: "anthropic" },
  api_key: { type: "string", default: "", description: "Anthropic API key", format: "password" },
  model: { type: "string", default: modelDefault, enum: [
    "claude-opus-4-8", "claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5",
  ] },
  temperature: { type: "number", default: 0.7 },
  max_tokens: { type: "number", default: 4096 },
});

const LLM_SCHEMA: Record<string, ProviderSchema> = {
  anthropic: {
    display_name: "Anthropic Claude",
    description: "Anthropic Claude is the LLM Miss Floss uses for variable extraction, QA, and post-call summaries.",
    provider_docs_url: "https://docs.anthropic.com/",
    properties: baseLlmProperties("claude-opus-4-7"),
    model_options: {
      "claude-opus-4-8": [],
      "claude-opus-4-7": [],
      "claude-sonnet-4-6": [],
      "claude-haiku-4-5": [],
    },
  },
};

const REALTIME_SCHEMA: Record<string, ProviderSchema> = {
  google: {
    display_name: "Gemini Live (Google)",
    description: "Gemini Live is a single speech-to-speech model. No separate STT/TTS needed when this is on.",
    provider_docs_url: "https://ai.google.dev/gemini-api/docs/live",
    properties: {
      provider: { type: "string", default: "google" },
      api_key: { type: "string", default: "", description: "Google AI Studio API key", format: "password" },
      model: { type: "string", default: "gemini-3.1-flash-live-preview", enum: ["gemini-3.1-flash-live-preview", "gemini-2.5-flash-live"] },
      voice: { type: "string", default: "Puck", enum: ["Puck", "Charon", "Kore", "Fenrir", "Aoede"] },
    },
    model_options: {
      "gemini-3.1-flash-live-preview": ["Puck", "Charon", "Kore", "Fenrir", "Aoede"],
      "gemini-2.5-flash-live": ["Puck", "Charon", "Kore"],
    },
    voice_options: ["Puck", "Charon", "Kore", "Fenrir", "Aoede"],
  },
};

const ttsProvider = (
  display: string,
  apiKeyLabel: string,
  models: Record<string, string[]>,
  docsUrl: string,
  description: string,
): ProviderSchema => {
  const modelKeys = Object.keys(models);
  return {
    display_name: display,
    description,
    provider_docs_url: docsUrl,
    properties: {
      provider: { type: "string", default: display.toLowerCase() },
      api_key: { type: "string", default: "", description: apiKeyLabel, format: "password" },
      model: { type: "string", default: modelKeys[0], enum: modelKeys },
      voice_id: { type: "string", default: models[modelKeys[0]][0] ?? "", enum: models[modelKeys[0]] ?? [] },
    },
    model_options: models,
  };
};

const TTS_SCHEMA: Record<string, ProviderSchema> = {
  elevenlabs: ttsProvider("ElevenLabs", "ElevenLabs API Key",
    { eleven_turbo_v2_5: ["Rachel", "Domi", "Bella", "Antoni"], eleven_multilingual_v2: ["Rachel", "Bella"] },
    "https://elevenlabs.io/docs/api-reference", "Premium English voices, best in class for clinical demos."),
  sarvam: ttsProvider("Sarvam", "Sarvam API Key", { "bulbul-v2": ["meera", "arjun"] },
    "https://docs.sarvam.ai/", "Built for Indic + multilingual; great fallback when ElevenLabs cost matters."),
  cartesia: ttsProvider("Cartesia", "Cartesia API Key", { "sonic-2": ["sonic-default"] },
    "https://docs.cartesia.ai/", "Sonic 2 is the fastest TTS available, ~75ms time to first audio."),
  deepgram: ttsProvider("Deepgram Aura", "Deepgram API Key", { "aura-2-en": ["aura-2-en-us-female"] },
    "https://developers.deepgram.com/docs/aura-2", "Aura 2 by Deepgram, paired well with their STT for the same vendor billing."),
  rime: ttsProvider("Rime", "Rime API Key", { mistv2: ["mistv2"] },
    "https://docs.rime.ai/", "Rime MistV2, natural-sounding North American English."),
};

const STT_SCHEMA: Record<string, ProviderSchema> = {
  deepgram: {
    display_name: "Deepgram",
    description: "Deepgram Nova 3 is the most accurate streaming STT we benchmarked.",
    provider_docs_url: "https://developers.deepgram.com/docs/nova-3",
    properties: {
      provider: { type: "string", default: "deepgram" },
      api_key: { type: "string", default: "", description: "Deepgram API Key", format: "password" },
      model: { type: "string", default: "nova-3", enum: ["nova-3", "nova-2"] },
      language: { type: "string", default: "en", enum: ["en", "fr", "es"] },
    },
    model_options: { "nova-3": [], "nova-2": [] },
  },
  sarvam: {
    display_name: "Sarvam",
    description: "Sarvam Saarika v2 for Hindi + Indic languages.",
    provider_docs_url: "https://docs.sarvam.ai/",
    properties: {
      provider: { type: "string", default: "sarvam" },
      api_key: { type: "string", default: "", description: "Sarvam API Key", format: "password" },
      model: { type: "string", default: "saarika-v2", enum: ["saarika-v2"] },
    },
    model_options: { "saarika-v2": [] },
  },
};

const EMBEDDING_SCHEMA: Record<string, ProviderSchema> = {
  voyage: {
    display_name: "Voyage AI",
    description: "Voyage embeddings, Anthropic-recommended, no OpenAI dependency.",
    provider_docs_url: "https://docs.voyageai.com/",
    properties: {
      provider: { type: "string", default: "voyage" },
      api_key: { type: "string", default: "", description: "Voyage API Key", format: "password" },
      model: { type: "string", default: "voyage-3", enum: ["voyage-3", "voyage-3-lite"] },
    },
    model_options: { "voyage-3": [], "voyage-3-lite": [] },
  },
};

// ───────────────────────── Voice library ─────────────────────────

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

// ───────────────────────── Identity defaults ─────────────────────────

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

// ───────────────────────── Path router ─────────────────────────

function defaultsForPath(path: string, method: string): unknown {
  const p = "/" + path;

  if (p === "/health") return { status: "ok", demo: true };
  if (p === "/version") return { version: "demo-1.33.0" };

  if (p === "/auth/me" || p === "/user/auth-user") return defaultUser();
  if (p.startsWith("/auth/")) return { ok: true };

  if (p === "/user/configurations/user") return defaultUserConfigurations();
  if (p === "/user/configurations/defaults") {
    return { llm: LLM_SCHEMA, tts: TTS_SCHEMA, stt: STT_SCHEMA, realtime: REALTIME_SCHEMA, embeddings: EMBEDDING_SCHEMA };
  }
  if (p === "/user/configurations/user/validate") return { valid: true, errors: [] };
  if (p.startsWith("/user/configurations/voices/")) {
    const provider = p.split("/").pop()?.toLowerCase() ?? "";
    return { voices: VOICE_LIBRARIES[provider] ?? [] };
  }

  // Both return raw arrays per SDK types.
  if (p === "/user/api-keys") return [];
  if (p === "/user/service-keys") return [];

  if (p === "/workflow/count") return { total: 0, active: 0, inactive: 0 };
  // The next three endpoints return raw arrays per SDK types.
  if (p === "/workflow/fetch" || p === "/workflow/summary") return [];
  if (p === "/workflow/templates") return [];
  if (p.startsWith("/workflow/") && p.endsWith("/runs")) return { runs: [], total: 0 };
  if (p.startsWith("/workflow/")) return { id: 0, name: "", status: "draft", nodes: [], edges: [] };

  if (p === "/campaign" || p === "/campaign/") return { campaigns: [] };
  if (p.startsWith("/campaign/") && p.endsWith("/progress")) return { total: 0, completed: 0, in_progress: 0, failed: 0 };
  if (p.startsWith("/campaign/") && p.endsWith("/runs")) return { runs: [], total: 0 };
  if (p.startsWith("/campaign/")) {
    return { id: 0, name: "", state: "draft", created_at: new Date(0).toISOString(), updated_at: new Date(0).toISOString() };
  }

  if (p === "/organizations/telephony-providers/metadata") return { providers: TELEPHONY_PROVIDERS };
  if (p === "/organizations/telephony-configs") return { configurations: [] };
  if (p.includes("/telephony-config-warnings")) return { warnings: [] };
  if (p.startsWith("/organizations/telephony-configs/") && p.endsWith("/phone-numbers")) return { phone_numbers: [] };
  if (p.startsWith("/organizations/telephony-configs/")) {
    return { id: 0, name: "", provider: "", configuration: {}, phone_numbers: [], is_default_outbound: false };
  }
  if (p === "/organizations/telephony-config") return { configuration: null };

  if (p === "/organizations/campaign-defaults") {
    return {
      concurrent_call_limit: 5,
      from_numbers_count: 1,
      default_retry_config: {
        enabled: true,
        max_retries: 2,
        retry_delay_seconds: 600,
        retry_on_busy: true,
        retry_on_no_answer: true,
      },
      last_campaign_settings: null,
    };
  }
  if (p === "/organizations/langfuse-credentials") return { credentials: null };
  if (p === "/organizations/usage/current-period") return { used: 0, total: 1000, period_start: new Date(0).toISOString(), period_end: new Date(0).toISOString() };
  if (p === "/organizations/usage/daily-breakdown") return { breakdown: [] };
  if (p === "/organizations/usage/mps-credits") return { credits: 0 };
  if (p === "/organizations/usage/runs") return { runs: [], total: 0 };
  if (p === "/organizations/reports/daily") return { rows: [] };
  if (p === "/organizations/reports/daily/runs") return { runs: [] };
  if (p === "/organizations/reports/workflows") return { workflows: [] };

  // Raw arrays per SDK types: tools, folder, credentials. Recordings + node-types stay wrapped.
  if (p === "/tools" || p === "/tools/") return [];
  if (p === "/folder" || p === "/folder/") return [];
  if (p === "/workflow/recordings" || p.includes("/recordings")) return { recordings: [] };
  if (p.includes("/knowledge-base/documents")) return { documents: [] };

  if (p === "/credentials" || p === "/credentials/") return [];

  if (p === "/node-types") return { node_types: [] };

  if (p.startsWith("/superuser/")) return { items: [], total: 0 };

  if (method !== "GET") return { success: true, demo: true };

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
