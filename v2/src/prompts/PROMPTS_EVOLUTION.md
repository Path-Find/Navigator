# Prompts Evolution Tracker

## Core Philosophy
This document serves as the architectural ledger for Navigator's AI prompt engineering. It tracks the evolution, strategic reasoning, and structured changes made to the foundational prompt layer. The goal is to ensure prompt engineering remains a deliberate software methodology rather than ad-hoc string manipulation.

## Core Directives

1. **Evidence-Based Grounding**: The AI must strictly anchor its responses to verifiable evidence provided in the Candidate Context (e.g., Resume Blocks). It must not hallucinate skills or seniority levels.
2. **Category-Aware Adaptation**: Structural and stylistic handling of responses must dynamically adjust based on the professional domain (e.g., Licensed Trades vs. Software Engineering vs. Creative Marketing).
3. **Thematic Cohesion**: Synthesis of experiences should prioritize functional bridges and impact themes over blunt chronological lists.
4. **Professional Neutrality**: Tone should remain objective, authoritative, and direct, avoiding robotic transitions and hyperbole ("excited to apply," "moreover," "additionally").

### Recent Architecture Updates

#### v2.22.0 Architectural Sweep
- **Cover Letter Engine Rebuild**:
  - Deprecated generic "one-size-fits-all" narrative approach.
  - Implemented High-Fidelity Cover Letters with distinct variants (`v1_direct`, `v2_storytelling`, `v3_experimental_pro`).
  - Standardized "Category-Aware Metrics" constraint across all variants to ensure numerical fidelity for technical/academic roles while allowing narrative interpretation for creative/managerial roles.
  - Enforced strict "Functional Connections" rule to synthesize cross-role evidence based on thematic impact rather than chronological listing.
- **Monolithic Decoupling**:
  - Removed deprecated `analysis.ts` monolithic export wrapper.
  - Transitioned all domain services (`jobAiService`, `resumeAiService`, `eduAiService`) to consume modular prompt files (`coverLetter.ts`, `jobAnalysis.ts`, `career.ts`, `education.ts`) directly to support targeted imports and reduce bundle pollution.
