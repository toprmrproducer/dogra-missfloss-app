# Miss Floss app (rebranded Dograh UI)

Next.js 15 dashboard for **Miss Floss** — the AI receptionist for Canadian dental clinics. Source-of-truth fork of the Dograh OSS UI from `~/Downloads/Claude Projects/Doghra/ui/`, rebranded end-to-end for Rutvik + Anmol's Miss Floss agency.

## Brand

- **Primary:** cyan `oklch(0.595 0.118 219.45)` ≈ `#0891B2`
- **Background:** white `oklch(1 0 0)` — **always light, never dark** (per Shreyas: "white should be the primary color, do not keep the whole website in a darker tone")
- **Type:** Geist Sans + Geist Mono (from next/font)
- **Logo:** `/public/miss-floss-logo.svg` — cyan tile + abstracted "Mi" mark

The dark-mode class is force-disabled in `src/app/layout.tsx` even though the OKLCH `.dark` block remains in `globals.css` for safety.

## Structure

| Path | What |
|---|---|
| `src/app/` | Next.js App Router. Key routes: `/handler` (auth), `/auth`, `/overview`, `/workflow`, `/analytics`, `/recordings`, `/automation`, `/campaigns`, `/usage`, `/files`, `/api-keys`, `/telephony-configurations`, `/model-configurations`, `/tools`, `/settings`, `/superadmin`, `/impersonate`, `/after-sign-in`, `/reports`. |
| `src/components/` | UI components (Radix UI primitives + custom). |
| `src/context/` | App config, user config, onboarding, telephony warnings providers. |
| `src/client/` | Generated OpenAPI client (`types.gen.ts`). Regenerate via `pnpm generate-client` against the backend OpenAPI. |
| `src/lib/auth.ts` | `AuthProvider` for the Dograh OSS JWT flow against the FastAPI backend. |
| `next.config.ts` | Sentry-wrapped, `output: 'standalone'`, proxies `/api/*` (except `/api/config` + `/api/auth`) to `BACKEND_URL`. |

## Env (required for runtime)

| Var | Used for |
|---|---|
| `BACKEND_URL` | Server-side API proxy target (FastAPI backend) |
| `NEXT_PUBLIC_BACKEND_URL` | Client-side API calls |
| `NEXT_PUBLIC_NODE_ENV` | `production` on Vercel |
| `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` | optional, leave blank to disable |

## Deploy

Vercel-first, framework auto-detected. Set the env vars above in the Vercel project. The backend MUST be deployed to a cloud host (Railway is the default — see `~/Downloads/Claude Projects/Doghra/api/`). Local-only backend violates the [client-automations-never-run-locally] rule.

```bash
pnpm install
vercel deploy --prod
```

## DB column carveout

Three files reference column names from the upstream Dograh schema and were left **un-rebranded** so the API contract stays intact:
- `src/app/usage/page.tsx`, `src/app/workflow/[workflowId]/run/[runId]/page.tsx`, `src/client/types.gen.ts`
- Column names: `dograh_token_usage`, `quota_dograh_tokens`, `dograh_pcm_cache`

If the backend migrates these column names, regenerate `types.gen.ts` and grep-replace the two app files.

## Linked

- Marketing landing: `~/Desktop/website/dogra-missfloss/` (https://dogra-missfloss.netlify.app)
- Backend repo: `~/Downloads/Claude Projects/Doghra/` (`rapidx-rebrand` branch, GitHub `toprmrproducer/rapidx-voice`)
- Supabase: DograMissfloss (`uazwppofnntmdwqoqyuf`, ap-south-1)
- Vault: [[Miss Floss]], [[Rutvik Boudhankar]], [[Anmol Anand]], [[6th June 2026]]

@AGENTS.md
