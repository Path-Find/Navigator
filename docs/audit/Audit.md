# Navigator Audit

**Purpose**: Independent architecture, code quality, product strategy, infrastructure, and technical debt review of the Navigator platform.

**Scope**: Full repository (main application, browser extension, Supabase Edge Functions, build configuration, documentation, and R&D components).

**Relationship to Other Docs**:
- Complements [ROADMAP.md](../ROADMAP.md) and the detailed roadmaps in this folder.
- Focuses on current state, maintainability, and engineering leverage points rather than feature commitments.
- **Active recommendations**: See [recommendations.md](./recommendations.md) — the working backlog of prioritized items.
- **Strategic Considerations**: See [Strategic-Considerations.md](./Strategic-Considerations.md).

- **[V3-Greenfield.md](./V3-Greenfield.md)**: A speculative, high-level vision document describing what Navigator V3 could look like if rebuilt from the ground up (modeled after the style of the main `ROADMAP_V3.md`).

- For forensic-level detail on critical subsystems, see the companion deep-dive documents:
  - [Storage & Vault Subsystem Deep Dive](./Audit-Storage-Subsystem-Deep-Dive.md)
  - [Gemini Proxy Subsystem Deep Dive](./Audit-Gemini-Proxy-Deep-Dive.md)
  - [NextGen R&D Layer Deep Dive](./Audit-NextGen-RD-Deep-Dive.md)

---

## Executive Summary

Navigator is a sophisticated, AI-powered career co-pilot with an unusually high level of engineering discipline for its stage. The codebase is clean, many historical technical debt items have been resolved systematically, and the core security model (AI calls through authenticated Supabase Edge Functions with tiering and usage controls) is strong.

The project shows clear long-term thinking through its NextGen R&D efforts (personal embeddings, style distillation, trajectory modeling) and comprehensive multi-dimensional roadmaps.

Overall assessment: **Strong foundation with excellent bones.** High-leverage opportunities exist in build hygiene, observability, AI quality, and maturing evaluation layers.

See [recommendations.md](./recommendations.md) for the current prioritized backlog.

---

## Project Overview

- **Product**: AI-powered career co-pilot for job analysis, modular resume tailoring, cover letters, career roadmaps, academic planning, and skill interviewing.
- **Core Tech**: React 19 + Vite + TypeScript + Tailwind, Supabase (auth + DB + Edge Functions + pgvector), Google Gemini (via secure proxy), Stripe, Vercel.
- **Key Differentiators**: Block-based modular resumes, NextGen personal modeling engine (embeddings + feedback loops), browser extension for one-click capture, offline-first + cloud sync storage layer.
- **Notable Artifacts**:
  - `src/` (~330 files, well-organized feature modules)
  - `extension/` (separate MV3 React app)
  - `supabase/functions/` (gemini-proxy, scrape-jobs, Stripe handlers)
  - Extensive prompt versioning and R&D in `src/prompts/` + `src/services/ai/rd/`

---

## Strengths

### Code Quality & Discipline
- No `TODO`, `FIXME`, or `HACK` markers in `src/`.
- Many items from `ROADMAP_TECHNICAL.md` (sync failures, timeouts, conflict resolution, error boundaries, PDF memory issues, etc.) have been resolved with clear dates.
- Strict TypeScript configuration (`tsconfig.app.json`) with `strict`, `noUnusedLocals`, `erasableSyntaxOnly`, and `verbatimModuleSyntax`.
- Thoughtful separation of concerns across services, hooks, contexts, and storage.

### Security & Backend Architecture
- All AI generation and scraping occurs through authenticated Supabase Edge Functions (`gemini-proxy`, `scrape-jobs`).
- Proper user tier resolution, usage limit checks via RPC (`check_analysis_limit`), and origin validation.
- Input sanitization, logging sanitization, and CORS hardening in place.
- No client-side Gemini API keys.

### Data & Sync Layer
- Sophisticated custom `StorageService` architecture with domain-specific stores (`resumeStorage`, `jobStorage`, `coachStorage`, etc.).
- Encryption support, timestamp-based conflict resolution, batch operations, migration guards, and timeout wrappers.
- Strong offline-first + sync experience for a personal knowledge/workflow product.

### AI & Intelligence Layer
- Well-structured `aiCore.ts` with retry logic, model selection, and proxy abstraction.
- Advanced R&D in `src/services/ai/rd/` (embedding service, style service, trajectory service, similarity service).
- Versioned prompts with evolution tracking (`PROMPTS_EVOLUTION.md`).
- "Dark wiring" approach to gradually roll out NextGen modeling without disrupting users.

### Documentation & Planning
- Exceptional roadmap documentation: product, technical, NextGen, monetization, platform, prompts, feedback, and V3 visions.
- `NAVIGATORLOG.md` enforces high-signal portfolio tracking (distinct from churn logs).
- Clear feature registry and modular breakdown.

### Extension & Capture
- Proper Manifest V3 structure with background service worker, content script extraction, and popup React app.
- Direct Supabase sync so captured jobs appear immediately in the main application.
- Thoughtful permission model for job board scraping.

---

## Subsystem Deep Dives

Detailed forensic reviews have been conducted on two of the most critical and complex subsystems. These documents contain line-level findings, architecture diagrams, risk assessments, and precise recommendations.

- **[Storage & Vault Subsystem Deep Dive](./Audit-Storage-Subsystem-Deep-Dive.md)**: Comprehensive analysis of the encrypted local vault (`Vault`, `encryptionService`, `OperationQueue`), multi-domain sync logic, conflict resolution, PBKDF2 migration strategy, and data safety guarantees. Highlights include sophisticated defensive design alongside duplication in sync orchestration and fire-and-forget cloud writes.

- **[Gemini Proxy Subsystem Deep Dive](./Audit-Gemini-Proxy-Deep-Dive.md)**: End-to-end examination of the primary AI gateway (`gemini-proxy/index.ts`), the sophisticated `check_analysis_limit` / quota RPCs, pessimistic charging + refund logic, feature gating, abuse prevention (device/email normalization), and client contract in `aiCore.ts`. The system is production-grade with strong defense-in-depth, but contains brittle response parsing, naive refund detection, missing outbound timeouts, and opportunities for better observability and constant extraction.

- **[NextGen R&D Layer Deep Dive](./Audit-NextGen-RD-Deep-Dive.md)**: Forensic review of the Professional Modeling Engine (`src/services/ai/rd/`). Covers embedding pipeline (pgvector), feedback taxonomy, style distillation, semantic similarity, trajectory projection, "dark wiring" in production flows, and the admin Calibration UI. The data collection strategy is strong, but several components still contain prototype-level code and the path from R&D to user-facing feature is not yet defined.

**Key cross-cutting insights from the subsystem reviews**:
- The project consistently chooses **defensive, user-data-preserving** designs (never lose data on decryption failure; pessimistic charging with refunds).
- There is recurring **duplication of orchestration and sync logic** across storage domains and between client/proxy concerns.
- **Observability is the largest practical gap**: scattered `console.*` calls and limited structured events in both the proxy and storage layer.
- The most ambitious part of the product (**NextGen R&D**) is also the one that most clearly shows its experimental heritage (prototype code paths, weak typing, placeholder implementations).
- Several high-leverage "maturity" improvements (timeouts, better parsing, extracted constants, contract tests) are low-effort relative to their reliability impact.

These deep dives should be treated as living supplements to this document.

---

## Improvement Opportunities

See [recommendations.md](./recommendations.md) for the current prioritized backlog of improvements.

Raw findings from the original review are preserved below for reference. Once converted into concrete recommendations, items are removed from this document.

**Impact**: Medium-High (scalability and maintainability).

**Recommendations**:
- Conduct a state audit to classify state as: server-synced, local UI, or ephemeral.
- Introduce a lightweight store (Zustand or Jotai recommended) for cross-cutting domain state (jobs, resumes, skills, user profile) while retaining Context for purely UI concerns (modals, toasts, theme).
- Leverage React 19 features more aggressively (transitions, `use()`, better Suspense boundaries, form actions where applicable).
- Add React DevTools Profiler marks or why-did-you-render style tooling during development.

### 5. AI Evaluation, Quality, and NextGen Maturation

**Problem**: While prompt versioning and retry logic are solid, there is limited systematic evaluation of AI output quality (hallucination rates, style consistency, gap analysis accuracy, trajectory predictions).

**Impact**: High for long-term differentiation.

**Recommendations**:
- Expand the existing `.bench.ts` and `.test.ts` patterns into a proper evaluation harness with golden datasets for key tasks (job analysis, cover letter generation, resume block tailoring).
- Add offline scoring and regression testing for style distillation and embedding similarity.
- Expose more of the NextGen personal model to users (e.g., "My Career Model" dashboard, calibration controls, trajectory visualization).
- Consider response streaming through the proxy for better perceived performance on long generations.

### 6. Product & User Experience Gaps (Roadmap Alignment)

Several high-value items from `ROADMAP_PRODUCT.md` and `ROADMAP_V3.md` remain open and directly impact user delight and monetization:

- **PDF Export**: Still relies on broken `window.print()` approach. Needs a proper solution (`@react-pdf/renderer`, Puppeteer via function, or high-fidelity html-to-pdf library).
- **Interactive Cover Letter Co-Pilot**: The shift from one-shot generation to a collaborative "write it with me" experience is one of the highest-leverage product bets.
- **Mobile Responsiveness & Accessibility**: Full mobile support and WCAG 2.1 AA compliance pass.
- **Data Portability**: CSV/JSON export of history and analyzed data, plus stronger "right to delete" flows.

## Other Observations

- Security headers and Supabase Edge Function patterns are strong.
- React 19 adoption is recent but still maturing.
- Monetization foundation (Stripe + tier gating) is solid.

See [recommendations.md](./recommendations.md) for the current prioritized backlog.

## Conclusion

Navigator has strong engineering maturity. Remaining gaps center on scaling practices (build, observability, evaluation) and shipping high-signal experiences already identified in the roadmaps.

Deep dives confirmed that the most complex subsystems also contain the highest duplication and observability gaps.

See recommendations.md for the prioritized backlog.

This document should be revisited after major milestones.

---

**Back to**: [ROADMAP.md](../ROADMAP.md) | [VISION.md](./VISION.md)

*Audit conducted April 2026 (based on repository state at time of review). Updated with subsystem deep dives.*
