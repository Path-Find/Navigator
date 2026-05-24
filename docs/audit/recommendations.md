# Navigator Audit — Recommendations

**Status**: Tactical, prioritized recommendations derived directly from the audits and deep dives.  
**Purpose**: The canonical working backlog of what to actually do with the *existing* Navigator codebase.  
**Important**: These are **recommendations only**. No production code changes should be made based on this document without explicit review and alignment.

**Sources**:
- [Audit.md](./Audit.md)
- [Audit-Deep-Dive.md](./Audit-Deep-Dive.md)
- [Audit-Storage-Subsystem-Deep-Dive.md](./Audit-Storage-Subsystem-Deep-Dive.md)
- [Audit-Gemini-Proxy-Deep-Dive.md](./Audit-Gemini-Proxy-Deep-Dive.md)
- [Audit-NextGen-RD-Deep-Dive.md](./Audit-NextGen-RD-Deep-Dive.md)

For speculative "if we rebuilt Navigator from scratch" thinking, see [V3-Greenfield.md](./V3-Greenfield.md).

---

## Prioritization Framework

- **P0 – Critical / Quick Wins**: High impact, relatively low effort. Do these first.
- **P1 – High Impact**: Significant value but requires more sustained effort.
- **P2 – Important Foundations**: Necessary for long-term health and scalability.
- **P3 – Strategic / Future Bets**: High ambition items that can be sequenced after the above.

---

## P0 – Critical / Quick Wins

| # | Recommendation | Area | Effort | Rationale & References |
|---|----------------|------|--------|------------------------|
| 1 | Fix the two real lint errors (unused `savedJobId` in extension popup + missing dependency in `useCoachManager.ts`) | Code Quality | Low | Immediate hygiene wins. |
| 2 | Resolve GitHub Pages vs Vercel deployment mismatch | DevEx / Infra | Low | High risk of confusion or broken deploys. See main Audit. |
| 3 | Add outbound timeout to Gemini fetch in the proxy | Reliability | Low | Prevents hanging requests. Gemini Proxy Deep Dive. |
| 4 | Make Gemini response parsing defensive (null checks + clear error) | Reliability | Low | Currently brittle to upstream response shape changes. |
| 5 | Fix obvious placeholder code in NextGen R&D (zero-vector search, regex JSON parsing) | R&D Quality | Low-Medium | Trajectory and similarity services contain non-functional stubs. |
| 6 | Bound the `bucketCache` Map in `bucketStorage.ts` (add LRU or TTL) | Performance | Low | Already flagged in Technical Roadmap and Storage Deep Dive. |

---

## P1 – High Impact

| # | Recommendation | Area | Effort | Rationale & References |
|---|----------------|------|--------|------------------------|
| 1 | Initiate monorepo consolidation (pnpm workspaces or Turborepo) for main app + extension | DX / Maintainability | Medium-High | Largest single source of duplicated node_modules and config pain. |
| 2 | Add structured logging + basic observability (Sentry + events) | Observability | Medium | Critical gap across storage, proxy, and NextGen layers. |
| 3 | Extract shared sync/orchestration logic in the Storage layer | Maintainability | Medium | Heavy duplication between `storageService.ts` and per-domain stores. Storage Deep Dive. |
| 4 | Harden Gemini Proxy: extract constants (feature gates, interview limits, event types), improve "not_a_job" detection | Reliability / Cost | Medium | Currently stringly-typed and fragile. |
| 5 | Add proper vectorization safeguards (batching, dedup, rate limiting) in NextGen | Performance / Cost | Medium | Current implementation fires many parallel calls with no controls. |
| 6 | Strengthen NextGen style injection with fallbacks and better error handling | Reliability | Medium | Bad distillation must never break user-facing generation. |
| 7 | Create contract tests between client (`aiCore.ts`) and Gemini Proxy | Testing | Medium | Error shapes and success paths are currently only manually verified. |

---

## P2 – Important Foundations

| # | Recommendation | Area | Effort | Rationale & References |
|---|----------------|------|--------|------------------------|
| 1 | Introduce lightweight global store (Zustand/Jotai) for core domain state | State Management | Medium-High | Context proliferation is becoming a scalability concern. |
| 2 | Standardize all storage and auth paths to `async/await` only | Code Hygiene | Medium | Mixed promise styles still exist (25+ sites identified). |
| 3 | Expand test coverage on critical paths (storage conflict resolution, proxy error flows, NextGen dark wiring) | Testing | Medium-High | Current coverage is thin on the hardest subsystems. |
| 4 | Expose lightweight user-facing value from NextGen (e.g., "My Style Signature" + signal count) | Product / Trust | Medium | Currently only visible in admin calibration UI. |
| 5 | Add structured events around vault migrations and failed cloud syncs | Observability | Medium | Storage layer currently only logs to console. |
| 6 | Build a lightweight "Testers" mode + automatic capture of AI generations (starting with cover letters) as the foundation for a real evaluation harness and golden datasets | AI Quality | Medium | You already have partial dark wiring via `RdFeedbackService` → `rd_modeling_feedback`, but it is tied to NextGen and not designed for systematic prompt/model experimentation or human review. The recent discovery that Gemini struggles with cover letters makes this higher priority. See ongoing discussion in chat + Audit-NextGen-RD-Deep-Dive.md. |
| 7 | Improve "My Career Model" visibility and user controls for NextGen | Product / Trust | Medium | Users currently have almost no insight into what the system has learned about them. |

---

## P3 – Strategic / Longer Term

| # | Recommendation | Area | Effort | Rationale & References |
|---|----------------|------|--------|------------------------|
| 1 | Full mobile responsiveness + WCAG 2.1 AA accessibility pass | Product / Accessibility | High | Still listed as open in Product Roadmap. |
| 2 | Robust PDF export (replace broken `window.print()`) | Product | High | High user value and differentiation. |
| 3 | Interactive Cover Letter Co-Pilot experience | Product | High | One of the highest-leverage bets in the Product Roadmap. |
| 4 | Decide on long-term home for the Modeling Engine (stay client-side or extract service) | Architecture | High | NextGen is currently the most experimental part of the system. |
| 5 | Consider replacing parts of the custom Storage Vault with a library (while preserving guarantees) | Maintainability | High | Impressive but high ongoing maintenance cost. |
| 6 | Build "Career Twin" / exportable personal model artifacts | Product / Platform | Very High | Long-term vision item from VISION.md and NextGen Roadmap. |
| 7 | Model tier differentiation in Gemini Proxy (stronger models for Pro users) | Monetization / Quality | Medium-High | The `TIER_MODELS` map already exists but is currently unused. |

---

## Cross-Cutting Themes

From the deep dives, several themes appear repeatedly:

- **Defensive-by-default design** — Excellent (data preservation, pessimistic charging, graceful degradation).
- **Observability debt** — The single largest practical risk as the system grows.
- **Duplication** — Especially in sync logic (Storage) and configuration (feature gates, limits).
- **Prototype-to-production transition** — Most visible in the NextGen R&D layer.
- **"Dark wiring" maturity** — Powerful data collection strategy (`RdFeedbackService`, `rd_modeling_feedback`) that now needs to evolve into a controllable Testers + Evaluation Harness system (especially for high-pain outputs like cover letters). Current capture is useful but too tightly coupled to NextGen and not designed for deliberate A/B testing or golden dataset creation.

---

## How to Use This Document

- Treat this as the **working engineering backlog** for the next 3–6 months.
- Revisit and re-prioritize after each major milestone (monorepo, observability baseline, first user-facing NextGen features).
- Link specific tasks here back to the detailed analysis in the subsystem deep-dive documents when starting work.

---

## Strategic Considerations

Higher-level, cross-cutting considerations that emerged during the 2026 audit process. These are **not** yet turned into specific P0–P3 backlog items.

See the dedicated file **[Strategic-Considerations.md](./Strategic-Considerations.md)** for expanded thinking on:

- Measuring Success (across engineering, AI quality, product, and business levels)
- Monetization Considerations (risks and opportunities, including cover letter quality and Testers system implications)
- Evaluation Harness & Testers System design (building on the existing `RdFeedbackService` infrastructure)
- Documentation & Knowledge Organization

All of this remains in the recommendations and strategic discussion layer only.

**Reminder**: No production code should be modified based on any of the thinking in the audit folder without explicit review and alignment.

