# Strategic Considerations (2026)

**Status**: Recommendations and strategic discussion only.  
**Purpose**: Higher-level, cross-cutting considerations that emerged from the full audit series. These are not yet translated into specific P0–P3 items but should strongly influence prioritization, sequencing, and long-term planning.

**Important Reminder**: All of the thinking in this document (and the broader audit folder) exists purely in the recommendations / planning layer. No production code should be modified based on these notes without explicit review and alignment.

---

## 1. Measuring Success

### The Core Problem
One of the most significant gaps identified across the audits is the lack of clear, shared definitions of success. We have many recommendations, but limited agreement on what "better" actually looks like once work is done.

Without explicit success criteria, it becomes very difficult to:
- Prioritize between competing good ideas
- Know when a project is "done enough"
- Measure whether changes are moving the needle
- Justify effort on structural work (monorepo, AI SDK migration, eval harness, etc.)

### Recommended Levels of Measurement

We should define success metrics across at least these layers:

**Engineering & Maintainability**
- Time to implement and ship non-trivial changes (before vs after monorepo + shared packages)
- Build / typecheck / test reliability and speed
- Developer context-switching cost
- Onboarding time for a new contributor (hypothetical)

**AI Output Quality** (Highest immediate priority given user feedback)
- Especially for cover letters: 
  - User self-reported "Would I actually send this?" rate
  - Average edit distance / revision effort on generated letters
  - Qualitative signals from the Testers cohort
  - External feedback loops (if any)
- Similar lightweight measurement for tailoring, summaries, and interview prep

**Product & User Behavior**
- Activation rate of key "intelligence loops" (analysis → tailoring → cover letter)
- Retention through a full job search cycle
- Feature adoption depth (especially Pro-only features)

**Business Outcomes**
- Trial → paid conversion (overall and by cohort)
- ARPU and expansion
- Churn / retention, especially correlated with use of high-value features
- Paywall interactions on cover letters and advanced tooling

**Strategic / Long-term**
- Visibility and perceived value of the NextGen modeling engine to users
- Ability to run real, fast experiments (prompts, models, features)
- Reduction in technical debt maintenance load

### Next Step Recommendation
Before building the full Testers / Evaluation Harness system, define a small set of leading indicators for AI quality (starting with cover letters). The harness will then be designed to collect exactly the data needed to move those indicators.

---

## 2. Monetization Considerations

### Current Strengths
The existing plan (Explorer / Plus / Pro with add-ons) has a reasonable value ladder: diagnosis is free, resolution and high-quality intelligence are paid. "Advanced cover letters" and the agentic quality loop are correctly positioned as Pro differentiators.

### Key Risks Exposed by the Audits

**Cover Letter Quality as a Monetization Risk**
If the Pro-tier output for one of the most visible user actions (sending a letter to a real human) is frequently mediocre, it directly undermines willingness to pay for the highest tier. This is not just a quality bug — it is a revenue risk.

**NextGen Visibility Gap**
The modeling engine is one of the most sophisticated parts of the system, yet it is almost entirely invisible to normal users. This is a missed opportunity for both retention and potential higher-tier or add-on pricing.

**Infrastructure Cost vs. Margin**
The custom encrypted vault + OperationQueue + complex dual-key migration + the custom Gemini proxy with stringly-typed refund logic represent significant ongoing maintenance cost. Every hour spent here is an hour not spent improving user-visible value.

**Unused Monetization Levers**
- `TIER_MODELS` exists in the proxy but is not actively used for differentiation.
- Model quality differences between tiers are currently minimal.

### Testers System Implications
A Testers cohort could dramatically accelerate improvement of Pro-tier outputs (especially cover letters). However, we must design it carefully to avoid:
- Creating a visibly superior experience for "testers" vs regular Pro users
- Privacy and trust issues (cover letters are highly personal)

**Recommended Approach**: Treat Testers as an explicit "Pro Experimental Contributors" opt-in with clear communication about benefits (earlier access to better generations) and data usage.

### Recommended Focus Areas
1. Treat major improvements in cover letter quality as a direct monetization project, not just an AI project.
2. Make parts of the NextGen model user-visible and steerable as a retention and expansion lever.
3. Use the AI SDK + Gateway modernization as an opportunity to get much better per-user / per-feature cost visibility (which supports future pricing experiments).

---

## 3. Evaluation Harness & Testers System

### Current State (What Already Exists)
- `RdFeedbackService.captureSignal()` writes to `rd_modeling_feedback`.
- Cover letter generations already trigger signals (implicit usage, explicit corrections when users edit, comparison mode wins/losses) **when the user has NextGen enabled**.
- The critique loop in `generateCoverLetterWithQuality` already produces structured feedback (decision + points + hallucination alerts).
- `RdStyleService` consumes these signals to produce the `[USER PERSONAL STYLE MODEL]` string.

This is genuinely good "dark wiring" infrastructure.

### Current Limitations
- Capture is gated behind the NextGen feature flag rather than a dedicated testers / evaluation cohort.
- The `context` parameter (e.g. `'cover_letter'`) is not meaningfully used in style distillation.
- The data is primarily consumed by the modeling engine rather than exposed for systematic human review or controlled experiments.
- No easy way to run A/B tests on prompts, models, or agent loop depth for specific flows.

### Recommended Design Principles for a Testers System

**Opt-in and Transparent**
- Clear consent + easy opt-out.
- Users should understand what data is collected and why.

**Full Context Capture (especially for cover letters)**
- Raw generation + all inputs (resume blocks, job description, tailoring instructions, trajectory context, injected style model, prompt variant, critique feedback, etc.)
- User actions afterward (edits, "use this version", manual corrections)
- Lightweight explicit feedback when possible (quick thumbs or ratings for testers)

**Cohort Control**
- Ability to run experiments on specific subsets of testers (different prompt versions, different models via the future AI SDK layer, different iteration depths).

**Separation of Concerns**
- Keep the existing `rd_modeling_feedback` table for NextGen modeling signals.
- Consider a new `ai_eval_generations` (or similar) table specifically for evaluation and golden dataset creation. This makes querying and retention policy easier.

**Privacy & Retention**
- Cover letters contain highly sensitive career and personal information.
- Define clear retention windows (e.g. 90–180 days) and access controls.
- Consider heavy anonymization or aggregation for long-term storage.

### Priority Recommendation
Start small and focused on **cover letters** (the current highest-pain, highest-visibility flow). Build just enough instrumentation to support rapid iteration on the quality problem the user has already identified. Expand to other flows once the pattern is proven.

This work is foundational for both AI quality improvement and credible monetization claims.

---

## 4. Documentation & Knowledge Organization

The audit folder grew organically through a long, iterative process. As a result, the boundary between "here is what the audits say we should do with the current system" and "here is what we would do if we started over" became blurry.

### Recommended Ongoing Discipline
Maintain a clear separation between:

- **Tactical recommendations** (`recommendations.md`) — What we should actually do with the existing codebase.
- **Speculative vision** (`V3-Greenfield.md`) — The full "if we rebuilt from scratch" narrative.
- **Execution research & notes** (`Migration-Execution-Notes.md` + `Phase0-*.md`) — Practical 2026 research and runnable starting points.
- **Strategic considerations** (this file) — Cross-cutting context that informs prioritization but is not yet turned into specific backlog items.

This meta-recommendation was raised during the April 2026 documentation cleanup process.

---

**Final Note**: Everything in this document is strategic thinking and recommendations. It should be used to inform conversations and prioritization, not as a mandate for immediate code changes.

*Last updated: April 2026*