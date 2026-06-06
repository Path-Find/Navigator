# NextGen

Technical specification for the professional modeling engine and latent space architecture.

## Engine Architecture

The engine functions as a feedback-driven optimization loop designed to minimize the semantic distance between user profiles and market requirements.

### 1. Infrastructure (Vector Layer)
- **Embedding Model**: `text-embedding-004` (768-dimensional vectors).
- **Storage**: `pgvector` on Supabase with HNSW indexing for optimized retrieval.
- **Data Store**: `rd_user_embeddings` (isolated from primary application tables).

### 2. Modeling (Logic Layer)
- **Style Distillation**: Frequency analysis of manual edits to derive prompt-level style guides.
- **Trajectory Calculation**: Vector drift measurement between $T_0$ (Master Profile) and $T_n$ (Target Archetype).
- **Semantic Match Fallback**: Cosine similarity calculation to augment/replace traditional keyword-based matching.

### 3. Feedback Propagation (Learning Layer)
- **Outcome Correlation**: Automated weight adjustment for successful "Interview" and "Offer" signals.
- **Pattern Extraction**: Distillation of high-conversion stylistic patterns from anonymized outcome data.

---

## Research Initiatives

### Latent Space Navigation
- **Path Prediction**: Calculating the vector path between current coordinates and senior-level archetypes.
- **Gap Density**: Quantifying "Leadership" and "Technical" density gaps through semantic cluster analysis.

### Autonomous Refinement
- **Global Floor Elevation**: Periodic update of base prompts using successful real-world strategies.
- **Steering Engine**: Collaborative user loop for gradient-less refinement of narrative context.

---

## Implementation Status

- [x] **Vector Store**: Established `rd_user_embeddings` with `pgvector`.
- [x] **Distance Engine**: Implemented `RdSimilarityService` (Cosine Similarity).
- [x] **Trajectory Logic**: Implemented `RdTrajectoryService` for drift calculation.
- [x] **Calibration UI**: Admin dashboard for monitoring active style instructions.
- [ ] **Similarity Scaling**: Optimized distance engine for cross-user pattern recognition.
- [ ] **Role Model Clustering**: Vector-based matching for Role Model (Bucket) overlap.

---

[Back to Roadmap](../ROADMAP.md)
