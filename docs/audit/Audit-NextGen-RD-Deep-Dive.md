# Navigator Audit — NextGen R&D Layer Deep Dive

**Date**: April 2026  
**Subsystem**: Professional Modeling Engine R&D (`src/services/ai/rd/`) + supporting infrastructure  
**Scope**: Embedding pipeline, feedback capture, style distillation, semantic similarity, trajectory projection, "dark wiring" integration, admin calibration UI, prompts, and database layer.

This is the **most ambitious and forward-looking subsystem** in Navigator. It represents the attempt to move from one-shot AI assistance to a persistent, learning "personal professional model."

---

## 1. High-Level Architecture & Philosophy

The NextGen layer is explicitly designed as a **sequestered R&D engine** that runs in parallel with (and increasingly influences) the main production flows.

```
User Actions (silent / "dark wiring")
    │
    ├─► RdFeedbackService.captureSignal() / captureOutcome()
    │   → rd_modeling_feedback table
    │
    ├─► RdEmbeddingService.vectorizeAndStore()
    │   → rd_user_embeddings (pgvector) + match_rd_embeddings RPC
    │
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Modeling Engine (R&D Services)                   │
│                                                                     │
│  RdFeedbackService     → Raw signal collection                      │
│  RdEmbeddingService    → Professional Latent Space (vectors)        │
│  RdStyleService        → Distills signals → "USER STYLE MODEL"      │
│  RdSimilarityService   → Cosine semantic match (job vs profile)     │
│  RdTrajectoryService   → Growth projection using historical vectors │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
         Production Generation Paths     Admin Calibration UI
         (useResumeTailoring,            (NextGenCalibration.tsx)
          useCoverLetterEditor,          - Bootstrap, Map Latent Space,
          useJobAnalysis, etc.)            Project Trajectory, Test Match
```

**Core Design Principles** (from code + ROADMAP_NEXTGEN.md):
- **"Dark Wiring"**: R&D features are silently active when `isNextGenEnabled` is true. No new UI for normal users yet.
- **Feedback as primary fuel**: Explicit approvals, corrections, and implicit saves/outcomes are the training signal.
- **Two parallel spaces**:
  - **Symbolic/Style** (via `RdStyleService` + `MODELING_DISTILLER` prompt)
  - **Vector/Semantic** (via pgvector embeddings)
- **Admin-only visibility** for now (the Calibration portal).

---

## 2. Component Deep Analysis

### 2.1 EmbeddingService (`embeddingService.ts`)

**Purpose**: The foundation of the "Professional Latent Space."

Key observations:
- Uses `getEmbeddingModel` from `aiCore.ts` (which routes through the Gemini proxy with `task: 'embedding'`).
- Stores in dedicated `rd_user_embeddings` table (isolated from production data — good security hygiene).
- `source_type`: `'full_profile' | 'experience_block' | 'onboarding_goal' | 'job_role'`
- `upsert` on `(user_id, source_type, source_id)` — prevents duplicates.
- `searchSimilar` relies on a custom Supabase RPC `match_rd_embeddings` (pgvector cosine similarity).

**Strengths**:
- Clean separation.
- Uses the same proxy path as everything else (benefits from quota, auth, logging).

**Issues**:
- No batching or rate limiting on vectorization (see `handleSyncLatentSpace` which fires many parallel calls).
- `searchSimilar` is called with a dummy zero vector in `trajectoryService.ts:24` (`new Array(768).fill(0)`). This looks like a placeholder / broken implementation.
- Hard dependency on a custom RPC that must be maintained in Supabase.

### 2.2 FeedbackService (`feedbackService.ts`)

**Purpose**: The data collection layer.

Signal types:
- `explicit_approval`
- `explicit_correction`
- `implicit_usage`

Contexts:
- `tailoring`, `match_logic`, `cover_letter`

Notable:
- `captureOutcome` is used on job status changes (applied/interview/offer/rejected) — powerful long-term signal.
- `getSignalStats` is only used in the admin UI.
- Data is written to `rd_modeling_feedback` (separate table).

**Issues**:
- Duplicate JSDoc comment (lines 56–58).
- Very loose typing (`outputContent: any`, `userCorrection?: any`).
- No deduplication or importance weighting at write time.

### 2.3 StyleService (`styleService.ts`)

**Purpose**: The bridge from raw signals → actionable prompt augmentation.

This is currently the most "production-adjacent" piece of the R&D layer.

Flow:
1. Fetch last 50 signals.
2. Separate "outcomes" (interview/offer) from stylistic signals.
3. Build a weighted natural language summary (marking winning patterns).
4. Send to Gemini via a dedicated distiller prompt (`MODELING_DISTILLER`).
5. Return a string that gets injected as `USER STYLE MODEL [Active]: ...`

**Critical Finding**:
- The function has `// eslint-disable-next-line @typescript-eslint/no-unused-vars` on the `_context` parameter (line 14). The context parameter is accepted but completely ignored.
- It always fetches 50 signals and does its own client-side filtering.

**Strength**: The weighting logic that prioritizes signals tied to real positive outcomes is genuinely smart.

### 2.4 SimilarityService & TrajectoryService

These are the more experimental "Level 2 / Level 4" pieces.

**SimilarityService**:
- Implements its own pure JS `cosineSimilarity`.
- For every match request, it re-vectorizes the job description on the fly.
- Then pulls *all* of the user's `experience_block` embeddings and computes similarity in JavaScript.
- This is O(n) client-side computation and will degrade as users accumulate more blocks.

**TrajectoryService**:
- Heavily dependent on `RdEmbeddingService.searchSimilar` with a dummy zero vector (clear placeholder).
- Falls back to pulling the entire current resume and stuffing it into a prompt.
- JSON extraction via regex (`\{[\s\S]*\}`) — brittle.

These two services feel the most "prototype-y" compared to the feedback + style pipeline.

---

## 3. Integration ("Dark Wiring") Analysis

The R&D services are wired into real user flows when `isNextGenEnabled` is true:

**Locations**:
- `useResumeTailoring.ts:55-71` — On successful tailoring: captures explicit approval signal + silently vectorizes the new tailored content.
- `useCoverLetterEditor.ts` — Multiple `captureSignal` calls on approval, correction, and final save.
- `useJobManager.ts:112` — `captureOutcome` on job status changes.
- `useJobAnalysis.ts` — Calls `RdTrajectoryService.getTrajectoryProjection`.

This is the correct architectural approach for R&D (low user friction, rich data collection), but it means:

- The modeling engine's quality is now **directly coupled** to how often users perform certain actions.
- There is almost no user-visible feedback when the model is learning or when data is insufficient.
- Errors in the R&D services are swallowed (they never block the main user flow).

---

## 4. The Admin Calibration Surface (`NextGenCalibration.tsx`)

This 480-line component is currently the only way to interact with or inspect the modeling engine.

It exposes:
- Toggle for `isNextGenEnabled`
- "Mapping" (vectorization of all visible experience blocks)
- "Initialize" bootstrap from historical analyzed jobs
- Style signature display (distilled output)
- Signal stats breakdown
- Trajectory projection
- Semantic match testing

**Observations**:
- The UI is polished and thoughtful (good motion, clear explanations).
- It is the only place where most of these services are exercised in a controlled way.
- Heavy reliance on local component state; no real persistence of calibration runs.
- The "Bootstrap Echo" feature is a pragmatic way to seed data for existing users.

This component is extremely valuable as both a debugging tool and a future user-facing "Career Model" dashboard.

---

## 5. Database & Prompt Layer

- Two dedicated tables: `rd_user_embeddings` (pgvector) and `rd_modeling_feedback`.
- Custom RPC `match_rd_embeddings` required for vector search.
- Two dedicated prompts in `src/prompts/modeling.ts` (`MODELING_DISTILLER` and `TRAJECTORY_MAPPER_PROMPT`).

The schema work (isolated tables + vector extension) is already done and documented in the changelog and ROADMAP_NEXTGEN.md.

---

## 6. Strengths

- Clear philosophical separation between production and R&D ("sequestered").
- Excellent feedback taxonomy and outcome correlation.
- Real "dark wiring" in production flows (the correct way to collect training data at this stage).
- Sophisticated style distillation logic that actually weights real-world success.
- Isolated data model (good for both privacy and experimentation velocity).
- High-quality admin calibration UI.

---

## 7. Risks & Architectural Issues

**1. Prototype-to-Production Debt (Highest Risk)**
- Several services still contain obvious placeholder code (zero vector search, regex JSON extraction, ignored parameters).
- The similarity and trajectory engines do heavy lifting client-side or via brittle parsing.

**2. Observability & Data Quality**
- Almost no visibility for normal users (or even power users) into what the model has learned about them.
- Easy to accumulate noisy or low-quality signals with no quality gate.

**3. Performance & Cost at Scale**
- Vectorization is called on many user actions without batching or deduplication.
- Similarity calculation loads all user vectors and computes in JS.

**4. Maintainability**
- Feature strings (`'role_model'`, `'style_distiller'`) and magic context values are scattered.
- Weak typing on the feedback payload.

**5. Coupling Risk**
- As more production features start depending on `getPersonalizedStyle` or trajectory data, the R&D layer stops being "safe to break."

---

## 8. Specific Recommendations

### Short Term (Next 1–2 Cycles)
- Fix the obvious placeholder code in `searchSimilar` and `getTrajectoryProjection`.
- Add basic deduplication / rate limiting around `vectorizeAndStore`.
- Remove the unused `_context` parameter or implement it.
- Add error boundaries / fallback behavior around style injection so a bad distillation never breaks generation.

### Medium Term
- Build a minimal user-facing "My Career Model" view (start by exposing the style signature and a simple "signals collected" counter).
- Implement proper vector similarity search inside the RPC (or move cosine calculation server-side).
- Create a small evaluation harness (e.g., "does the style guide measurably improve user approval rate on A/B tests?").

### Strategic / Long Term
- Decide on a clear migration path from "sequestered R&D" to first-class feature (with user consent and controls).
- Consider whether the modeling engine should eventually become its own microservice or stay inside the Supabase + client model.
- Define success metrics for the modeling engine (not just "we have signals," but "using the model measurably improves outcome rates or user satisfaction").

---

## 9. Relationship to Previous Audits & Roadmaps

This subsystem is the primary realization of the ambitions described in:
- `docs/ROADMAP_NEXTGEN.md`
- `docs/ROADMAP_PROMPT.md` (style modeling section)
- The "NextGen" items in the main `ROADMAP.md`

The Storage deep dive and Gemini Proxy deep dive both touched on related concerns (encrypted personal data, quota enforcement on R&D features, logging of modeling activity). The NextGen layer increases the importance of both.

---

## Conclusion

The NextGen R&D layer is the most interesting and highest-potential part of the entire Navigator project. The data collection strategy ("dark wiring" + outcome correlation) is genuinely strong. The style distillation logic shows real product thinking.

However, it is also the subsystem that most clearly shows its R&D heritage: several components are still in a prototype state, performance characteristics are unproven at scale, and the path from "admin calibration tool" to "user-visible career intelligence" is not yet defined.

Treating this layer with the same engineering rigor that was applied to the Storage Vault and Gemini Proxy (proper typing, observability, performance hardening, contract tests, user-facing surfaces) will be one of the highest-leverage things the project can do in the next 6–12 months.

---

**Related Documents**:
- [Audit-Gemini-Proxy-Deep-Dive.md](./Audit-Gemini-Proxy-Deep-Dive.md)
- [Audit-Storage-Subsystem-Deep-Dive.md](./Audit-Storage-Subsystem-Deep-Dive.md)
- [ROADMAP_NEXTGEN.md](./ROADMAP_NEXTGEN.md)

*Produced via full reading of all six R&D service files, the calibration UI, key integration points in production hooks, modeling prompts, and cross-referenced schema/changelog context.*
