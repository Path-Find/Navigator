# Navigator Audit Folder

This directory contains the complete audit documentation for the Navigator platform.

## Documents

| File | Purpose |
|------|---------|
| [Audit.md](./Audit.md) | Master high-level strategic audit and overview |
| [recommendations.md](./recommendations.md) | **Canonical prioritized tactical recommendations** derived from the audits (working backlog) |
| [Strategic-Considerations.md](./Strategic-Considerations.md) | Expanded strategic thinking on Measuring Success, Monetization, the Testers/Evaluation Harness system, and documentation organization |
| [V3-Greenfield.md](./V3-Greenfield.md) | Speculative "if we rebuilt Navigator from scratch" vision (analogous to the main V3 roadmap) |
| [Migration-Execution-Notes.md](./Migration-Execution-Notes.md) | **Practical 2026-researched execution notes** for monorepo, Vite→Next, local-first alternatives, and AI SDK migration (with concrete commands, gotchas, boilerplates, and 2-week fast track) |
| [Phase0-Monorepo-Setup.md](./Phase0-Monorepo-Setup.md) | Copy-paste ready commands, YAMLs, folder layout, and gotchas to stand up the monorepo in <1 day |
| [Audit-Deep-Dive.md](./Audit-Deep-Dive.md) | Broader code-level findings from static analysis and inspection |
| [Audit-Storage-Subsystem-Deep-Dive.md](./Audit-Storage-Subsystem-Deep-Dive.md) | Forensic deep dive into the encrypted vault + sync layer |
| [Audit-Gemini-Proxy-Deep-Dive.md](./Audit-Gemini-Proxy-Deep-Dive.md) | Forensic deep dive into the AI gateway, quota system, and abuse prevention |
| [Audit-NextGen-RD-Deep-Dive.md](./Audit-NextGen-RD-Deep-Dive.md) | Forensic deep dive into the Professional Modeling Engine (embeddings, style, trajectory) |

## How to Use

- Start with **[recommendations.md](./recommendations.md)** for the current prioritized tactical action list.
- Read **[Strategic-Considerations.md](./Strategic-Considerations.md)** for higher-level thinking on success metrics, monetization, the Testers/eval harness, and documentation organization.
- Use **[Audit.md](./Audit.md)** for context and high-level assessment.
- Dive into the individual subsystem documents when working on or reviewing a specific area.

## Maintenance

This folder should be updated whenever:
- New audit work is completed
- Major recommendations are implemented or reprioritized
- New risks or architectural insights are discovered

*Last organized / researched: April 2026 (after targeted 2026 tooling & migration searches)*