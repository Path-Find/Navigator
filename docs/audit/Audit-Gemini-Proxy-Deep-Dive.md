# Navigator Audit — Gemini Proxy Subsystem Deep Dive

**Date**: April 2026  
**Subsystem**: `supabase/functions/gemini-proxy/` (primary AI gateway) + supporting RPCs in `supabase_schema.sql` and client integration in `src/services/ai/aiCore.ts`  
**Scope**: Authentication, tier resolution, multi-layer rate limiting & abuse prevention, feature gating, pessimistic quota + refund logic, direct Gemini calls, content safety injection, logging sanitization, error handling, and client contract.

This is the **single most critical production gateway** in the entire system. Every AI-powered feature (job analysis, cover letters, interviews, embeddings for NextGen, skill interviews, etc.) flows through this function.

---

## 1. High-Level Architecture

```
Client (React App)
    │
    │  aiCore.ts
    │  - getModel() → fetch() to /functions/v1/gemini-proxy
    │  - getEmbeddingModel() → supabase.functions.invoke('gemini-proxy')
    │  - callWithRetry() with AbortSignal support + client-side quota detection
    │  - logToSupabase() (separate logs table, redaction)
    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Gemini Proxy Edge Function (Deno)                         │
│  supabase/functions/gemini-proxy/index.ts                                    │
│                                                                              │
│  1. CORS + Preflight Handling                                                │
│  2. Auth (Bearer token → supabase.auth.getUser())                            │
│  3. Profile Lookup → Tier Resolution (free/plus/pro + admin/tester flags)    │
│  4. Pre-execution Limit Check (RPC: check_analysis_limit)                    │
│  5. Task Validation + Interview Hard Gates + Monthly Interview Counting      │
│  6. Feature-Tier Gating (Plus-only / Pro-only features)                      │
│  7. Model Selection (TIER_MODELS map + embedding override)                   │
│  8. Pessimistic Quota Increment (increment_analysis_count) for 'analysis'    │
│  9. Gemini API Call (direct fetch with systemInstruction injection)          │
│ 10. Refund Paths (API failure, "not_a_job" detection)                        │
│ 11. Token Usage Tracking (track_usage RPC)                                   │
│ 12. Authoritative Interview Logging (to 'logs' table)                        │
│ 13. Structured Error Responses + Sanitized Logging                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
         ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
         │ Supabase RPCs    │  │ Supabase DB  │  │ Google Gemini│
         │ • check_analysis_│  │ • profiles   │  │ (direct      │
         │   limit          │  │ • daily_usage│  │  REST API)   │
         │ • increment_...  │  │ • logs       │  │              │
         │ • decrement_...  │  │              │  │              │
         │ • track_usage    │  │              │  │              │
         └──────────────────┘  └──────────────┘  └──────────────┘
```

**Design Philosophy** (clear from implementation):
- **Server-authoritative** for all quotas, tiers, and abuse prevention.
- **Pessimistic charging** (increment before call) + explicit refund paths.
- **Defense in depth**: multiple independent limit layers (daily/weekly/lifetime, interview monthly, feature gates, device/email abuse, email verification, token ceilings).
- **Fail closed** on critical security paths, fail open with logging on some monitoring paths.

---

## 2. Detailed Code Walkthrough (gemini-proxy/index.ts)

### 2.1 Entry & CORS (lines 51-55)
Standard Deno.serve + preflight handling. `getCorsHeaders` (lines 10-19) allows:
- Explicit `SITE_URL`
- Local Vite dev servers
- Any `*.vercel.app` origin (pragmatic for previews)

**Observation**: The Vercel wildcard is convenient but broad. Combined with `host_permissions` in the extension, the attack surface for origin-based abuse is larger than a strict allow-list.

### 2.2 Authentication & Tier Resolution (lines 58-89)
- Uses the incoming `Authorization` header to create a Supabase client and calls `auth.getUser()`.
- Then does a direct `profiles` select for `subscription_tier, is_admin, is_tester`.
- Tier override logic is simple but effective: admin > tester > subscription_tier || 'free'.

**Strength**: No reliance on JWT claims for tier — always re-fetched from DB (prevents token tampering).

### 2.3 Pre-Execution Limit Check (lines 91-109)
Calls `check_analysis_limit` RPC with `p_source_type: 'manual'`.

On failure to allow → returns **429** with structured `{error, reason, used, limit}`.

This is the primary gate before any work or cost is incurred.

### 2.4 Task & Interview Hard Gates (lines 114-157)
- Whitelist of tasks: `['extraction', 'analysis', 'interview', 'embedding']`
- Interviews have an explicit 403 for free users + separate monthly counting via the `logs` table (not the daily_usage table).
  - Plus = 2/month, Pro = 5/month
  - Query uses `event_type` IN (three different interview event types)

**Note**: Monthly interview counting is **authoritative in the proxy** (line 302-311 also inserts on success). Client-side checks exist in `usageLimits.ts` but are secondary.

### 2.5 Feature-Tier Gating (lines 159-183)
Hard-coded arrays:
```ts
const PLUS_ONLY_FEATURES = ['cover_letter', 'resume_tailor'];
const PRO_ONLY_FEATURES = ['gap_analysis', 'roadmap', 'role_model'];
```

These tags are passed from the client in `ModelParams.feature` (see aiCore.ts:48 and many call sites in job/resume/career hooks).

This is the mechanism that powers "Pro-only" experiences without code duplication on the client.

### 2.6 Pessimistic Quota + Gemini Call + Refunds (lines 202-252)
This is the **core safety mechanism**:

1. For `task === 'analysis'`: call `increment_analysis_count` **before** hitting Gemini.
2. On any failure in the `fetch` to Google → refund via `decrement_analysis_count`.
3. After response: detect `"not_a_job"` magic string in the output → refund + return friendly 400.

The systemInstruction injected on every analysis task (lines 230-232) is clever:
> "CRITICAL: First validate if the provided content is a job description... If it is purely non-job related... return: {\"error\": \"not_a_job\"}."

This protects the quota system from users pasting random text (recipes, LinkedIn profiles, etc.).

**Refund robustness**: Multiple independent refund sites (API error, not_a_job, and later in the main catch for some paths).

### 2.7 Response Handling & Side Effects (lines 254-316)
- Embedding path: returns early with `{embedding}`.
- Generation path: naive extraction of `candidates[0].content.parts[].text`.
- Token tracking via `track_usage` RPC (note comment says `p_is_analysis: false` even for analysis tasks — because the count was already done pessimistically).
- Special authoritative `logs` insert only for interviews (for the monthly cap query).

### 2.8 Error Handling (lines 318-325)
Final catch returns 500 with sanitized message. All internal `console.*` go through `sanitizeLog`.

---

## 3. The Quota & Abuse Prevention System (Supabase RPCs + Schema)

The real sophistication lives in the SQL layer (`check_analysis_limit`, `increment/decrement_analysis_count`, `track_usage`, supporting tables, triggers, and profile protections).

### Key Tables (inferred)
- `profiles` (subscription_tier, job_analyses_count, is_admin, is_tester, email_verified, normalized_email, device_id, total_ai_calls, etc.)
- `daily_usage` (user_id, date, analysis_count, token_count, request_count)
- `logs` (for interview events and general auditing)
- `jobs` (source_type for inbound email tracking)

### check_analysis_limit (supabase_schema.sql ~335-530)
This is a **very long, defense-in-depth** function:

1. **Email verification gate** (unless admin/tester).
2. **Free-tier anti-abuse** (device fingerprint + normalized_email checks against other accounts that have already hit their lifetime limit).
3. **Tiered periodic limits**:
   - Free: lifetime 3
   - Plus: 200/week (rolling 7 days via `daily_usage`)
   - Pro: 100/day
   - Admin/Tester: extremely high numbers (safety valves)
4. **Inbound email specific gates** (separate daily counts for `source_type = 'email'`).
5. **Emergency daily token ceiling** (250k / 1M / 5M tokens depending on tier) as a last-resort fuse.

**Increments** happen in `increment_analysis_count`:
- Bumps `profiles.job_analyses_count`
- Upserts into `daily_usage` (analysis_count +1)

**Refunds** (`decrement...`) are best-effort and also update both profile and daily_usage.

There are also triggers:
- `set_normalized_email` (handles + addressing and Gmail dots)
- `protect_sensitive_profile_fields` (prevents users from updating their own tier/admin flags)

---

## 4. Client Integration (aiCore.ts)

### Two calling patterns
1. **Manual fetch** for normal generation (full control over AbortSignal, headers).
2. **supabase.functions.invoke** for embeddings (simpler but less control).

### Retry & Error Translation (`callWithRetry`)
- Client-side detection of quota strings ("PerDay", "429", "Quota", "High traffic").
- Special early throw for `DAILY_QUOTA_EXCEEDED` vs generic `RATE_LIMIT_EXCEEDED`.
- Progress callback support for UI ("retrying in 3s...").
- AbortSignal propagation and cleanup.
- Separate `logToSupabase` calls for success/error (with PII redaction for emails/phones).

**Interesting tension**: The client still does some quota string matching because not every error path (especially direct Gemini 429s that leak through or older code paths) is guaranteed to come through the structured proxy error format.

---

## 5. Security, Reliability & Cost Analysis

### Strengths (excellent)
- Pessimistic charging + multiple refund paths.
- Server-side only enforcement of all business limits.
- Content safety injection that turns the model into a cheap first-line classifier.
- Strong anti-abuse for the free tier (device + email normalization).
- Sanitized logging everywhere.
- Explicit task whitelist.
- Separate authoritative path for the scarcest resource (interviews).

### Areas of Concern (granular)

**1. "not_a_job" detection is naive string matching** (line 273)
- `text.includes('"error": "not_a_job"') || text.includes('not_a_job')`
- A user who legitimately wants the model to output that string in a resume bullet could trigger a false refund.
- The systemInstruction tells the model to return it as JSON, but the check is loose.

**2. Response parsing is brittle** (line 267-269)
- Assumes the exact Gemini response shape. No defensive null checks on the full path.
- If Google changes the response format (even slightly), the proxy returns empty `text` and the client throws "empty response from proxy".

**3. No timeout on the outbound Gemini fetch**
- Line 221: plain `await fetch(...)`. A slow or hanging Gemini call will hold the Edge Function invocation (which has its own timeout, but still wastes resources and user time).

**4. Console logging of userId (even sanitized)**
- Line 193: `console.log("User action:", { userId: sanitizeLog(user.id), ... })`
- While sanitized, this is still PII-adjacent in logs. In a mature system this should go to a structured audit sink.

**5. TIER_MODELS table is currently meaningless**
- All tiers map to the exact same `gemini-2.0-flash` for both extraction and analysis (lines 28-48).
- The differentiation is purely in **limits and feature gates**, not model quality. This is fine today but the data structure suggests future intent to give Pro users "gemini-2.0-pro" or better reasoning models.

**6. Hard-coded feature lists + magic strings**
- Feature tags are stringly typed and duplicated between client call sites and the proxy. Easy to drift.

**7. Refund on "not_a_job" happens after the model call**
- The model still consumed tokens. The refund only saves the *analysis credit*, not the actual Gemini cost. Acceptable, but worth noting for cost modeling.

**8. No streaming support yet**
- All responses are buffered. Long generations (complex cover letters, detailed roadmaps) have poor perceived performance.

---

## 6. Specific Line-Level Findings & Recommendations

### High-Value Improvements

1. **Add timeout + AbortController to the Gemini fetch** (around line 221).
2. **Make response parsing defensive** with optional chaining and a clear error if the expected shape is missing.
3. **Tighten "not_a_job" detection** — require the model to return it in a strict JSON envelope and parse it properly instead of `includes`.
4. **Extract constants**: `PLUS_ONLY_FEATURES`, `PRO_ONLY_FEATURES`, interview limits, event types, magic strings.
5. **Structured logging**: Replace the remaining `console.*` with a logger that can emit JSON (including `request_id`, `user_id`, `feature`, `latency`, `tokens`).
6. **Add contract tests** between `aiCore.ts` and the proxy (especially error shapes: `upgrade_required`, `not_a_job`, `limit_reached`, 429/403/500).
7. **Consider per-feature cost multipliers** in the future (some features are much more expensive than others).
8. **Expose model tier differentiation** when it makes sense (the TIER_MODELS map is ready).

### Polish / Maintainability

- The function is ~330 lines in one `handler`. Extract helpers for:
  - `resolveUserTierAndProfile`
  - `enforceInterviewLimits`
  - `enforceFeatureGates`
  - `performGeminiCallWithRefunds`
- The two test folders (`test/` and `test 2/`) suggest some cleanup is needed in the function deployment folder.

---

## 7. Comparison with Other Edge Functions

`scrape-jobs/index.ts` and `inbound-email/index.ts` both call the same quota RPCs and reuse some patterns (auth, sanitizeLog, tier checks). There is emerging shared logic, but each still duplicates a fair amount of boilerplate.

The proxy is clearly the most mature of the three.

---

## 8. Recommended Deep Actions

**Immediate (low effort, high confidence)**:
- Add fetch timeout + better response shape validation.
- Centralize the feature gate arrays and interview event types.
- Improve the "not_a_job" detection to be structural.

**Next cycle**:
- Structured/JSON logging + request correlation IDs.
- Contract tests + property-based testing of the limit RPCs.
- Evaluate streaming support for long-form generation tasks.

**Strategic**:
- Decide when (and for whom) to promote users to stronger Gemini models via the existing TIER_MODELS map.
- Build a small internal "AI Cost & Quota Dashboard" (admin-only) that surfaces data from `daily_usage` + `logs` + proxy events.

---

## Conclusion

The Gemini Proxy + surrounding quota system is **production-grade** and shows real sophistication in balancing user experience (optimistic feel via client), cost control, abuse prevention, and data safety.

It is one of the areas where the engineering maturity of the project is most visible.

The remaining work is mostly "maturity hardening" (timeouts, better parsing, observability, testability) rather than fundamental architectural gaps. The pessimistic + refund design, combined with the defense-in-depth SQL gates, is a model that many AI wrappers could learn from.

Because this is the choke point for all future intelligence features (especially NextGen embeddings and style-guided generation), any investment here directly multiplies the reliability and cost efficiency of the entire product.

---

**Related Documents**:
- [Audit-Storage-Subsystem-Deep-Dive.md](./Audit-Storage-Subsystem-Deep-Dive.md)
- [Audit-Deep-Dive.md](./Audit-Deep-Dive.md)
- [Audit.md](./Audit.md)

*Produced via complete reading of the proxy source, all relevant RPC definitions, client callers, schema triggers, and historical changelog context.*
