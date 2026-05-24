# Navigator V3 (Greenfield)

> **This is a speculative document.**  
> It describes how Navigator might look if it were designed and built from the ground up today, with the full benefit of the audits, deep dives, and lessons learned. It is **not** a committed plan.

---

## Goal

Build a **career intelligence platform** that feels magical, trustworthy, and low-friction — while being dramatically simpler and more maintainable to develop and operate than the current system.

The product should help users move from "I have a career" to "I have clear options, strong positioning, and momentum" with as little manual drudgery as possible.

---

## Core Design Principles (If Starting Over)

| Principle | What It Means |
|---------|---------------|
| **Local-first by default, server where it matters** | The user owns their data. Heavy modeling and history should feel instant even offline. |
| **AI is a collaborator, not a black box** | Users should understand what the system knows about them and be able to steer it. |
| **One coherent modeling engine** | Style, trajectory, semantic matching, and outcomes should feel like one system, not bolted-on features. |
| **Radical simplicity for the developer** | The engineering surface area should be 40-60% smaller than today for the same (or better) capability. |
| **Observability from day one** | Cost, quality, and user outcomes should be visible and actionable in real time. |
| **Clear boundaries between R&D and production** | Experiments should be cheap and safe. Production features should be boring and reliable. |

---

## Proposed Architecture (Ground Up)

### 1. Foundation
- **Next.js (App Router)** as the primary framework (monorepo with Turborepo).
- **Supabase** for auth, database, realtime, storage, and pgvector.
- **Vercel** for hosting, edge functions (where needed), and previews.
- **Shared packages** from day one:
  - `@navigator/ui`
  - `@navigator/ai` (wrappers around AI SDK + providers)
  - `@navigator/storage` (clean local-first abstraction)
  - `@navigator/types`

### 2. Data & Modeling Layer
- **Primary modeling engine lives closer to the data**.
  - Either as Supabase Edge Functions / Postgres functions + pgvector, or a small dedicated service.
  - Embeddings, style distillation, and trajectory calculations should be queryable and observable.
- **Client is optimistic and eventually consistent**, not the source of truth for modeling.
- **Much lighter custom encryption** (or none) — use Supabase Row Level Security + client-side encryption only for the most sensitive "vault" items if truly required.

### 3. AI Layer
- **Vercel AI SDK** (or equivalent) as the primary abstraction.
- **AI Gateway** (Helicone, LiteLLM, or Vercel AI Gateway) for:
  - Observability
  - Cost tracking
  - Prompt versioning
  - Fallbacks and model routing
- Structured outputs with Zod schemas from the beginning.
- Streaming as the default for any long-form generation.

### 4. State & Sync
- **TanStack Query** for server state.
- A **thin local-first layer** (possibly Electric SQL, PowerSync, or a well-scoped custom solution) only where true offline + instant feel is required.
- **Far fewer React contexts**. Zustand or Jotai for client state.

### 5. Browser Extension
- A proper package inside the monorepo (`packages/extension`).
- Shares types, UI primitives, and AI clients with the main app.

---

## Product Experience Changes

### What Would Feel Different

- **"My Career Model"** is a first-class, visible surface — not hidden in admin tools.
  - Users can see their style signature, trajectory, and what the system has learned.
  - They can correct or reinforce signals directly.

- **Jobs workspace is the center of gravity**.
  - Analysis, tailoring, cover letters, interview prep, and outcome tracking all live together.
  - The modeling engine powers recommendations and personalization across the entire workspace.

- **Modeling is steerable**.
  - Users get lightweight feedback mechanisms ("This version was much better") that visibly improve future outputs.

- **Much faster perceived performance**.
  - Streaming + better caching + server components.
  - Target: meaningful interaction in < 1.5s even on slower connections.

- **Clearer pricing boundaries**.
  - "Basic intelligence" (analysis, basic tailoring) is more accessible.
  - Heavy modeling and advanced coaching are the premium differentiators.

---

## What We Would Do Differently (Summary)

| Area                        | Current Reality                          | Greenfield Approach                              |
|----------------------------|------------------------------------------|--------------------------------------------------|
| **Framework**              | Vite + React SPA                         | Next.js App Router + monorepo                    |
| **Storage**                | Heavy custom encrypted vault + sync      | Lighter local-first + server-authoritative split |
| **AI Abstraction**         | Custom Gemini client + proxy             | Vercel AI SDK + proper AI Gateway                |
| **Modeling Engine**        | "Dark wiring" + admin-only calibration   | First-class, observable, partially user-facing   |
| **Observability**          | Mostly console logs                      | Structured + AI-specific tooling from day one    |
| **State Management**       | Many contexts + custom hooks             | Zustand/Jotai + TanStack Query                   |
| **Extension**              | Separate app + node_modules              | First-class monorepo package                     |
| **R&D vs Production**      | Blurry boundaries                        | Explicit experiments with clear graduation paths |
| **Evaluation**             | Minimal                                  | Evaluation harness + outcome tracking built in   |

**Note on Evaluation (April 2026 consideration)**: The existing `RdFeedbackService` + `rd_modeling_feedback` table already provides "dark wiring" for signals (including cover letters). A key evolution is turning this into an explicit, consent-based Testers mode that can support controlled experiments, golden datasets, and rapid iteration on high-pain flows like cover letter generation.

**As of April 2026 research** (see Migration-Execution-Notes.md for sources and gotchas):
- Best concrete monorepo starter matching your Vite + extension reality: the Jonghakseo Turborepo React Vite Chrome Extension boilerplate (active maintenance into 2026). WXT is the rising modern alternative to crxjs for the extension package.
- Vite → Next.js safest on-ramp: static `output: 'export'` SPA first (official migration guide), then incremental App Router adoption. Supabase client works with almost no change initially.
- Local-first reality check: PowerSync has the most production Supabase guides and offline strength, but requires non-trivial Supabase-side publication/role/RLS + Sync Stream YAML work. ElectricSQL for pure-Postgres purists. Zero (rocicorp) rising fast after the Triplit/Supabase connection. Your custom vault's encryption guarantees are not trivially replaced.
- AI layer: Vercel AI SDK + gateway (Vercel / LiteLLM / Helicone) + strangler pattern is the validated 2026 path. You can (and should) keep a thin authenticated proxy in Supabase Edge Functions for quota/charging/tiering even after adopting the SDK.

---

## Things We Would Still Do

- Keep the **strong security posture** (authenticated AI calls, tiering, abuse prevention).
- Preserve the **defensive, user-data-first** philosophy.
- Maintain excellent **roadmap and documentation discipline**.
- Use **dedicated tables** for experimental / high-sensitivity modeling data.
- Continue the practice of **"dark collection"** of high-quality signals (with better transparency).

---

## Open Questions

- How much of the modeling engine should eventually be **user-editable** vs **automatically learned**?
- What is the right long-term home for heavy vector work (Supabase pgvector vs dedicated vector DB)?
- How do we productize "Career Twin" / portable professional models without creating privacy or competitive risks?
- When does the extension become a true companion app vs just a capture tool?

---

## Relationship to Other Documents

- This document is the **V3 / future architecture** counterpart to the current [ROADMAP_V3.md](../ROADMAP_V3.md).
- Detailed tactical recommendations live in [recommendations.md](./recommendations.md).
- Higher-level strategic considerations (measuring success, monetization, Testers system, etc.) live in [Strategic-Considerations.md](./Strategic-Considerations.md). All of this remains in the recommendations/planning layer only.
- The analysis that led to these conclusions lives in the various subsystem deep-dive documents in this folder.

---

[Back to Audit](./Audit.md) | [Recommendations](./recommendations.md)

*Written as part of the 2026 Navigator Audit series. Speculative and not a commitment.*

**Note**: A detailed "If Rebuilding from Scratch" retrospective that previously lived in recommendations.md has been consolidated into this document and the broader strategic thinking in the audit process. All greenfield ideas remain recommendations and discussion only.