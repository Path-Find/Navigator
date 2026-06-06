# Prompts

Technical specification for the prompt orchestration layer and inference strategies.

## Inference Strategy

Strategic model mapping based on task complexity and token efficiency:

- **Gemini 1.5 Pro**: Primary reasoning engine for high-entropy tasks.
  - **Context Window**: 2M tokens, utilized for zero-shot cross-referencing of $N$ resume versions against full-text JDs.
  - **Tasks**: `JOB_FIT_ANALYSIS`, `COVER_LETTER_STREERING`, `INTERVIEW_SIMULATION`.
- **Gemini 1.5 Flash**: Classification and triage engine.
  - **Latency Target**: < 500ms for atomic extraction tasks.
  - **Tasks**: `INGEST_TRIAGE`, `SCHEMA_EXTRACTION`, `NARRATIVE_TAGGING`.

## Prompt Orchestration Patterns

### Chain-of-Thought (CoT) Reasoning
- **Heuristic**: Encapsulate reasoning within `<thought>` blocks to enforce sequential logic.
- **Constraint**: Models must cite specific resume UUIDs/bullets before deriving compatibility scores.

### Few-Shot Semantic Steering
- **Implementation**: 3–5 high-fidelity examples of narrative "pivots" (e.g., translating retail management into operational leadership).
- **Goal**: Maintain the "Career Architect" persona without fine-tuning overhead.

### Context Injection & Grounding
- **Dynamic Context**: Late-binding injection of `narrativeContext` and `jobMetadata` into standard system prompts.
- **Grounding**: Strict instruction to ignore pre-training knowledge of specific companies in favor of provided JD text.

---

## Technical Workstreams

### Technical Experience Mapping
- [ ] Refactor job analysis prompts to utilize parallel rule systems and regulatory cross-referencing.
- [ ] Implement consistent "operational rigor" framing for high-volume non-technical work.

### Regression & Failure Mapping
- [ ] Establish a pain-point registry for cross-source reference failures.
- [ ] Automated evaluation harness using `diff` analysis on real-world user edits.

### Narrative Synthesis
- [ ] Synthesize disparate experience blocks into coherent career arguments (reducing "list-like" output).

---

[Back to Roadmap](../ROADMAP.md)
