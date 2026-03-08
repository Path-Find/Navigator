# Professional Modeling Engine (NextGen)

R&D initiatives to transition Navigator from a utility application into a high-fidelity professional modeling engine.

## The Objective

The engine's primary goal is to close the "Distance" between your personal professional identity and the requirements of the market. This is achieved by modeling your voice, your background, and your successful outcomes into a unified career agent.

---

## What Exists

- **`RdFeedbackService`**: Secure logging of A/B picks, manual edits, and status-based outcome signals.
- **`RdEmbeddingService`**: Vectorization infrastructure using `text-embedding-004` and `pgvector` for high-resolution experience mapping.
- **`RdStyleService`**: Distillation logic that converts feedback patterns into active style guides.
- **Dark-Wiring**: Silent integration of modeling logic into the primary tailoring and generation hooks.

---

## Personal Style & Signals (Active)

Building the foundation of the user's personal model.

### 1. Voice Capture
- [x] **Selection Tracking**: Log A/B stylistic selections to measure preference.
- [x] **Edit Monitoring**: Monitor manual edits for style-drift detection.
- [x] **Outcome Correlation**: Correlate "Interview" and "Offer" status changes to successful modeling states.

### Level 2: Semantic Trajectory Mapping (In Progress)
- [x] **Trajectory Mapper Prompt**: Established `TRAJECTORY_MAPPER_PROMPT` for path analysis.
- [x] **Growth Vector Logic**: Implemented `RdTrajectoryService` to calculate drift between past and present.
- [ ] **Trajectory Dashboard**: UI to visualize the path from current archetype to target archetype.
- [ ] **Gap Analysis 2.0**: Integration with the matching loop to provide trajectory-aware feedback.

### 2. Automated Style Inlining
- [x] **Style Distillation**: Distill recent feedback into prompt-level instructions (Style Guides).
- [x] **Prompt Injection**: Implement dynamic prompt overrides in the generation loop.
- [x] **Dashboard**: Building a calibration dashboard for "NextGen" (Admins) in Settings to view active style instructions.

---

## Experience Mapping (Active)

Transforming text-based profiles into a mathematical career space.

### 1. Experience Vectorization
- [x] **Data Store**: Establish isolated `rd_user_embeddings` data store with `pgvector`.
- [x] **Trajectory Wiring**: Silently vectorize tailored resume blocks to track professional trajectory.
- [ ] **Master Profile**: Implement vectorization for "Master Profile" updates to establish a semantic "Zero Point."

### 2. Similarity Infrastructure
- [ ] **Role Model Matching**: Implement vector-based matching logic to find Role Models (Buckets) with high semantic overlap.
- [ ] **Fallback Logic**: Develop the "Match Score" fallback that uses vector distance when keyword matching fails.

---

## Trajectory Projection (Later)

Moving from "matching" to "forecasting."

### 1. Path Prediction
- [ ] **Gap Calculation**: Calculate the "vector path" between current experience and target senior roles.
- [ ] **Experience Gaps**: Highlight the specific semantic gaps (e.g., "Leadership density") between a user and their next logical move.

---

## Autonomous Synthesis (Vision)

Using platform-wide success to improve the "Floor" for all users.

### 1. Global Pattern Refinement
- [ ] **Pattern Extraction**: Identify high-conversion stylistic patterns across anonymized success data.
- [ ] **Prompt Refresh**: Periodically update base AI prompts with real-world winning strategies.

---

[Back to Roadmap](../ROADMAP.md)
