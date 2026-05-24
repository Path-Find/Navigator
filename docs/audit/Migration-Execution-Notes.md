# Migration Execution Notes & Research (2026)

**Purpose**: Practical, research-backed notes to accelerate execution of the architectural changes discussed in the audit series.  
**Date**: April 2026  
**Sources**: Web research + prior deep dives (Storage, Gemini Proxy, NextGen R&D, Greenfield V3).

This document is meant to be a living tactical companion to `recommendations.md`, `Strategic-Considerations.md`, and `V3-Greenfield.md`.

---

## 1. Monorepo Setup (Turborepo + pnpm + Vite + Extension)

### Recommended Starting Point
The most practical path in 2026 is:

- **pnpm workspaces** + **Turborepo**
- Use the official Vite example as a base:
  ```bash
  pnpm dlx create-turbo@latest -e with-vite
  ```

### Current Best Practices (from 2025–2026 sources)
- Root-level `pnpm-workspace.yaml`
- `turbo.json` with pipelines for `build`, `dev`, `lint`, `typecheck`
- Shared `tsconfig` with project references for fast type checking
- For **CRXJS** (your current extension setup): There are known compatibility discussions. Shared UI packages often need careful configuration (especially with Tailwind and Vite). Many teams keep the extension build somewhat isolated initially.

**Real 2026 Examples & Starters** (directly relevant):
- **Jonghakseo chrome-extension-boilerplate-react-vite** (https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite): Actively maintained into 2026 (commits Feb 2026), uses **Turborepo + pnpm workspaces + Vite + React 18/19 + TS + Chrome Extension tooling**. Includes web + extension sharing of types/utils/ui. Excellent reference or fork base for your exact stack. Clone it, then map your existing Vite app into `apps/web` and extension into `apps/extension`.
- **WXT (wxt.dev)**: Rapidly becoming the preferred modern framework for MV3 extensions in 2025/26 monorepos. Better DX than older crxjs/vite-plugin for many teams. Several "Turborepo + Next.js web + WXT extension + shadcn" boilerplates exist.
- **Plasmo + Turborepo patterns**: See real AI extension monorepos like https://github.com/tantara/transformers.js-chrome (Turborepo + pnpm + Plasmo extension sharing inference code with a web app). Good precedent for AI-heavy extensions.

**Practical Gotchas reported in 2026**:
- pnpm hoisting + multiple React versions (your React 19 + extension) can cause strange runtime errors — pin carefully and use `pnpm.overrides` or `nodeLinker: hoisted`.
- Tailwind / PostCSS / content script injection needs explicit config sharing (many teams duplicate the Tailwind config or use a shared package with Vite plugin tricks).
- Turborepo project references for TypeScript give huge speedups but require 1–2 days of initial tsconfig pain.
- Extension builds often stay "semi-isolated" (own vite config) even inside the monorepo for the first iterations.

### Practical Structure Suggestion
```
navigator/
├── apps/
│   ├── web/          # Current main app (Vite) → later Next.js
│   └── extension/    # Current CRXJS → consider WXT later
├── packages/
│   ├── ui/
│   ├── utils/
│   ├── types/
│   └── ai/           # Future home for modern AI layer (AI SDK)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

**2-Day Action**: 
1. `pnpm dlx create-turbo@latest -e with-vite` (or directly fork the Jonghakseo boilerplate above).
2. Move/copy your current `src/` (minus heavy deps) into `apps/web/src`.
3. Move extension source into `apps/extension`.
4. Extract only the smallest shared pieces (`types`, a couple of pure utils, Tailwind theme tokens) into `packages/`.
5. Wire `package.json` workspace deps and turbo pipelines.
6. Run `turbo dev` and `turbo build` — celebrate when both apps still work.

Leave the encrypted vault and Gemini proxy code where they are for now.

**Key Resources**:
- https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite (best current match)
- https://wxt.dev (modern extension framework to evaluate)
- Official Turborepo docs + Vite example

---

## 2. Vite → Next.js Migration

### Official Path (as of 2026)
Next.js has an official migration guide:  
**https://nextjs.org/docs/app/guides/migrating/from-vite**

**Key practical steps from the official guide + 2026 reports**:
- Start **pure client-side SPA** (`output: 'export'` in next.config.js) — zero SSR risk, matches your current Vite SPA architecture perfectly. You can enable SSR/Server Components later, route-by-route.
- Use the App Router from the start for new work (`app/` dir). No more `pages/`.
- Replace `react-router-dom` with Next.js file-system routing (or keep a thin compatibility layer using `next/navigation` + custom Link wrapper during transition).
- Supabase client usage stays almost identical on the client (`@supabase/supabase-js`). Many 2025 guides cover `createClient` in `app/` with `'use client'`.
- Metadata: move from `react-helmet` or manual `<title>` to the new `metadata` export or `generateMetadata` (async supported).
- Images/assets: switch to `next/image` and `next/font` for automatic optimization (big win on Vercel).
- Environment: All client vars must be prefixed `NEXT_PUBLIC_`. Server-only secrets go in `.env.local` without prefix (and are never bundled).

**Incremental 2-Week Pilot Path (low risk)**:
1. In monorepo: `apps/web-next` (new Next.js app, same pnpm workspace).
2. Copy your `src/components`, `src/hooks`, `src/services` (adjust imports).
3. Install deps + `next.config.js` with `output: 'export'`, React 19 compatible.
4. Port 2–3 high-value routes first as App Router pages (e.g. a dashboard or jobs list).
5. Keep existing Vite app running and deployed; only preview the Next version.
6. Later (after monorepo + shared packages): swap the default web app.

**Common Gotchas reported 2025–2026**:
- `NEXT_PUBLIC_` everywhere for Supabase URL/key and other public config.
- Tailwind/PostCSS: Next has its own PostCSS, so copy your `tailwind.config` and ensure content paths cover the new `app/` dir.
- Framer Motion + React 19: Test animations early (some 19 + motion combos had issues in early 2025).
- Bundle size: Run `next build` + `next-bundle-analyzer` immediately; your current Vite build may be smaller until optimized.
- Supabase Realtime + auth cookie handling in static export mode needs care (may fall back to localStorage or use Vercel edge middleware later).

**Timeline Reality**: Full migration is usually 2–6 weeks of focused work for a project your size (not 2 days). The SPA static export path makes it safe to run in parallel with shipping the Vite version. Monorepo first, then this.

**Strong recommendation for you**: Do **monorepo consolidation first** (2 days). Only after that, create the parallel `apps/web-next` pilot. This keeps risk extremely low while giving you the modern foundation the greenfield doc recommends.

---

## 3. Local-First / Storage Alternatives (for the Custom Vault)

Current research (2025–2026) on Supabase + local-first (expanded with official docs + real reports):

| Tool / Engine     | Strengths                                                                 | Weaknesses / Risks                                      | Supabase Fit          | 2026 Recommendation for You |
|-------------------|---------------------------------------------------------------------------|---------------------------------------------------------|-----------------------|-----------------------------|
| **PowerSync**     | Best-in-class offline (SQLite on client), strong conflict resolution, first-class Supabase integration, active workshops & docs | Separate hosted sync service (extra cost/latency); some hobby Supabase users hit WAL/row limits | Excellent            | **Primary to evaluate** — strongest practical path for replacing parts of your vault |
| **ElectricSQL**   | Pure Postgres (uses PGlite on client), shapes for partial sync, CRDTs, good TanStack Query / DB integration | Some 2026 subjective "avoid" reports (maturity/pain signals vary); less "set and forget" offline than PowerSync | Very good            | Good if you want zero additional services and pure Postgres fidelity |
| **Zero (rocicorp)** | Query-driven sync, multi-DB roadmap (Postgres + others), simpler client lib, gaining traction (post-Triplit acqui-hire by Supabase) | Newer / smaller ecosystem than PowerSync/Electric | Good & improving     | Watch closely — potential future winner for Supabase users |
| **RxDB**          | Very mature, flexible replication plugins, works with Supabase            | More manual sync setup, heavier for simple cases       | Good                 | Solid fallback if others don't fit |
| Custom (current)  | Full control + tailored encryption-at-rest + migrations                   | Enormous ongoing maintenance, duplication, subtle bugs  | N/A                  | High cost — only keep if encryption-at-rest on shared devices is non-negotiable |

**Key 2026 Insights & Gotchas**:
- **PowerSync Supabase guide** (official): Requires specific Supabase-side setup — create a `powersync` publication, a dedicated `powersync_role` with `REPLICATION` privilege + grants on your tables, RLS policies that work with the sync service, and YAML "Sync Streams" in the PowerSync dashboard (e.g. `SELECT * FROM your_table WHERE user_id = request.jwt() ->> 'sub'`). Writes still go through Supabase Data API (your existing RLS helps).
- **Supabase hobby / 2026 changes**: Hobby projects have limited WAL disk — PowerSync sync can trigger issues (increase or move to paid). Also major Data API + RLS exposure changes (May/Oct 2026) that affect public schema and anonymous access — test early if any of your tables are public.
- Real production note: One 2026 report mentioned hitting row/sync limits on ~6k rows with PowerSync on Supabase — relevant for career data volume.
- Your custom vault's **encryption-at-rest** strength remains a differentiator that none of these replace out of the box. If that is a hard requirement, a hybrid (PowerSync for non-sensitive modeling data + keep vault for core PII) is the pragmatic middle path.

**Advice for your case**:
- The custom encrypted vault + OperationQueue is one of the highest-maintenance parts of the system (confirmed across deep dives).
- **For 2-day / 2-week speed**: Do **not** attempt to swap the core vault yet. Instead:
  - Pilot PowerSync (or Electric) **only for new NextGen / modeling features** (new `rd_*` style tables or a fresh "career model" store).
  - Use the Strangler Fig pattern: new features write to the new system; old vault continues for jobs/resumes/etc.
  - Re-evaluate full cutover only after the monorepo + AI SDK work is shipping value.
- This keeps your "2 days lmfao" velocity while still making irreversible progress toward the greenfield vision.

---

## 4. Vercel AI SDK Migration

### Current State (2026)
- The Vercel AI SDK (v5/v6 in 2025–2026) is the dominant, well-supported path for new AI features across the industry.
- One-line provider switching (`@ai-sdk/google` for Gemini, `@ai-sdk/openai`, `@ai-sdk/anthropic`, etc.).
- First-class streaming (`streamText`, `streamObject`), structured outputs with Zod, tool calling, multi-step agents, and approval workflows (major additions in v5/v6).
- Official codemods: `npx @ai-sdk/codemod upgrade` for v5 → v6 jumps.
- Real production migration reports (OpenAI SDK → AI SDK, LangChain → AI SDK) show 30-60% reduction in boilerplate + much better error/observability surface.

### Recommended Migration Pattern (from 2026 reports)
**Strangler Fig for AI layer** (matches your risk tolerance):
1. `pnpm add ai @ai-sdk/google` (in the relevant package once monorepo exists).
2. **Pilot only on new or low-traffic flows first**:
   - A new "quick analysis" helper
   - The style distiller / MODELLING_DISTILLER path (perfect for structured `streamObject`)
   - One cover letter variant generator
3. Use `generateText` / `streamText` + Zod schemas immediately for the huge win on your analysis JSON parsing brittleness.
4. Keep the existing `gemini-proxy/index.ts` + `aiCore.ts` for all current production user-facing calls for the first 2–4 weeks.
5. Add **Vercel AI Gateway** (or Helicone/LiteLLM self-hosted) in front of the SDK calls for cost tracking, prompt versioning, fallbacks, and logging — this directly replaces most of the value of your custom proxy without rewriting it.
6. Gradually move high-maintenance calls (cover letters, NextGen heavy prompts) once the pilot paths prove stable in production.

**Gateway options if you want to deprecate the custom proxy faster**:
- Vercel AI Gateway (simplest if staying on Vercel)
- LiteLLM (open source, self-hostable, excellent for Supabase Edge Functions too)
- Helicone or Portkey for advanced observability + prompt management

**Benefits seen in 2025–2026 real migrations**:
- Dramatically less custom fetch + response parsing code (your current stringly refund logic and brittle JSON parsing become Zod + SDK error classes).
- Built-in telemetry hooks.
- Easy to add multi-provider fallback or A/B model testing.
- Structured outputs eliminate an entire class of prompt engineering + post-processing bugs you currently have.

**Note on your custom proxy + pessimistic charging**: You can (and probably should) keep the proxy as a thin authenticated + quota + charging layer in Supabase Edge Functions even after adopting the AI SDK on the client or in other functions. The SDK calls the provider (or your gateway); your proxy enforces the business rules (limits, refunds, tiers). This is actually a clean separation that many teams land on.

This is one of the highest-ROI changes you can make in the first 2 weeks while the monorepo is being stood up.

---

## Recommended 2-Week Fast Track (Incorporating Research)

**Week 1 (Days 1–7) — Monorepo + AI SDK Pilot (highest velocity path)**
- **Day 1 (2–4 hours)**: Fork or reference https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite (or `pnpm dlx create-turbo@latest -e with-vite`). Create `pnpm-workspace.yaml` + basic `turbo.json`. Get `turbo dev` running both current web + extension.
- **Day 1–2**: Extract smallest possible shared packages (`@navigator/types`, `@navigator/utils`, a `@navigator/ui` stub with your Tailwind tokens and 2–3 components). Wire workspace deps. Do not touch storage or AI code yet.
- **Day 3–4**: Install `ai` + `@ai-sdk/google` in the new `packages/ai` (or directly in web for speed). Port **one** non-critical flow (e.g. a helper that calls the style distiller prompt, or a fresh analysis variant) to `streamObject` + Zod. Keep all existing production calls on the old path.
- **Day 5–7**: Wire basic observability (even just structured console + one error boundary) around the pilot. Document what broke and what was magically easier.

**Week 2**
- Expand the AI SDK pilot to 1–2 more flows (cover letter variant, one NextGen service).
- Evaluate PowerSync: Follow the official Supabase guide (https://docs.powersync.com/integrations/supabase/guide). Stand up a **new** small table + sync stream for a modeling feature only. Do **not** migrate existing vault data.
- Create a one-page decision doc in this folder (or a new `docs/adr/`) comparing PowerSync vs keeping custom vault for the core.
- Optional: Spin up a throwaway `apps/web-next` (static export) inside the monorepo and port 1–2 routes to prove the Vite→Next path.

**Hard Rule for Speed & Safety**:
- **Storage Layer (custom vault)**: Explicitly **do not** touch the core encrypted vault + OperationQueue + dual-key migration logic in the first 4–6 weeks unless you have a proven PowerSync (or equivalent) replacement running in production for new data with a clear strangler cutover plan.
- The monorepo + AI SDK changes give massive DX and velocity wins with near-zero data-risk.

---

## Next Steps for You (post-research)

1. **Immediate (today)**: Read [Phase0-Monorepo-Setup.md](./Phase0-Monorepo-Setup.md) and run the copy-paste commands (or fork the Jonghakseo boilerplate). This is the single best 2-day visible win.
2. Choose the first pilot after monorepo is green: AI SDK on one prompt, or the Next.js static export `apps/web-next` experiment.
3. Once the skeleton works, we can generate any additional config files or a small automation script on the spot.
4. We can also expand this doc or create a `docs/adr/001-monorepo-decision.md` once you make the call.

This 2026 research strongly validates the greenfield direction (Next.js + monorepo + AI SDK + lighter local-first) while giving concrete, low-risk on-ramps that respect your existing production data and "heavy AI usage for 2-day progress" goal.

---

**Related Documents**:
- [V3-Greenfield.md](./V3-Greenfield.md)
- [recommendations.md](./recommendations.md)
- [Audit.md](./Audit.md)

---

## 2026 Research Sources

- Monorepo + Extension: https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite (active 2026), WXT docs, Plasmo monorepo examples (e.g. transformers.js-chrome), various Reddit/Twitter 2025–26 threads on Turborepo + CRXJS pain/gotchas.
- Vite → Next.js: Official guide https://nextjs.org/docs/app/guides/migrating/from-vite + 2026 production migration reports (PolicyEngine and others using static export + incremental App Router).
- Local-first / Supabase sync: Official PowerSync Supabase integration guide (https://docs.powersync.com/integrations/supabase/guide), ElectricSQL docs + 2026 opinion posts, Zero (rocicorp) comparisons, RxDB Supabase plugins, real-user reports on Supabase hobby limits + 2026 Data API/RLS changes.
- AI SDK migration: Multiple 2025–26 detailed migration write-ups (OpenAI SDK → Vercel AI SDK, LangChain → AI SDK), AI SDK 5/6 release notes + codemod docs, Vercel AI Gateway + LiteLLM/Helicone comparisons for gateway layer.

*Heavily updated April 2026 with fresh targeted web research to support aggressive 2-day execution.*