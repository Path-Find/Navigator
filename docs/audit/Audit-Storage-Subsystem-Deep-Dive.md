# Navigator Audit — Storage & Vault Subsystem Deep Dive

**Date**: April 2026  
**Subsystem**: Privacy Vault + Multi-Domain Offline-First Sync Layer (`src/services/storage/*` + `encryptionService.ts` + `storageService.ts`)  
**Scope**: End-to-end analysis of local encrypted storage, key management, migration, concurrency control, cloud sync, conflict resolution, error handling, and data safety guarantees.

This is the most custom, security-sensitive, and architecturally complex subsystem in the entire Navigator codebase. It is the foundation for all user-owned data (resumes, job history, skills, role models, academic transcripts, target goals).

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Application Layer                               │
│  ResumeContext • JobContext • SkillContext • CoachContext • UserContext     │
│  (optimistic updates + Storage.saveXxx / getXxx calls)                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Storage Orchestrator                               │
│  storageService.ts (Storage object = merged domain stores + syncLocalToCloud)│
│  • syncLocalToCloud() — parallel vault fetch + cloud metadata → syncTasks    │
│  • clearAllData(), signOut(), submitFeedback()                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│   Domain Stores      │   │   Domain Stores      │   │   Domain Stores      │
│  jobStorage.ts       │   │  resumeStorage.ts    │   │  skillStorage.ts     │
│  coachStorage.ts     │   │  transcriptStorage.ts│   │  (blockUtils.ts)     │
│  (addJob, updateJob, │   │  (block-aware merge) │   │                      │
│   getJobs + self-heal)│   │                      │   │                      │
└──────────────────────┘   └──────────────────────┘   └──────────────────────┘
                    │                 │                 │
                    └─────────────────┼─────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Vault + Encryption Layer                           │
│  storageCore.ts (Vault object)                                               │
│  • ensureInit() → encryptionService.init(seed)                               │
│  • getSecure<T>() / setSecure() / modifySecure<T>() — all serialized via     │
│    OperationQueue                                                            │
│  • migrateVaultData() — time-budgeted (5s) PBKDF2 re-encryption              │
│  • Legacy plain-text migration on the fly                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EncryptionService                                  │
│  encryptionService.ts                                                        │
│  • PBKDF2 (600k iterations, SHA-256) → AES-GCM (12-byte IV)                  │
│  • Dual-key support during migration (legacy 100k iter key + current key)    │
│  • Device-bound seed (`jobfit_vault_seed` + salt)                            │
│  • Lazy + global migration paths with graceful degradation                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
            localStorage (encrypted)   Supabase (jobs, resumes, 
                                        user_skills, role_models, 
                                        target_jobs, transcripts, 
                                        canonical_roles)
```

**Key Design Tenets** (inferred from code):
1. **Never lose user data on decryption failure** — return `[]`, default profile, or `undefined` and log loudly rather than throwing.
2. **Serialize all vault mutations** to prevent localStorage corruption under concurrent edits (analysis finishing while user edits, multiple tabs rare but considered).
3. **Optimistic local + background cloud** with best-effort sync and self-healing.
4. **Client-side encryption for "at rest" privacy on shared devices**, not full E2EE.

---

## 2. Encryption & Key Management (encryptionService.ts + storageCore.ts)

### Parameters (lines 8-18)
- `ITERATIONS = 600000` (hardened in v2.25 from `LEGACY_ITERATIONS = 100_000`)
- `SALT_SIZE = 16`, `IV_SIZE = 12`
- AES-GCM + PBKDF2 + SHA-256 (Web Crypto)
- Storage format: `base64(iv):base64(ciphertext)`

### Key Derivation Flow (`init`, lines 39-110)
1. Load or generate per-device salt (`jobfit_vault_salt`).
2. Read previous iteration count from `jobfit_vault_iterations`.
3. If previous < current → derive **both** `legacyKey` and `key`.
4. New vaults immediately write the current iteration count.

### Migration Strategy (very thoughtful)
- **Global migration** (`migrateVaultData` in storageCore.ts:43-83): On first load after hardening, walks **every** localStorage key, attempts legacy decrypt + re-encrypt. Hard 5-second budget (`MIGRATION_TIMEOUT_MS`). Leftover items lazily migrated on next access.
- **Lazy per-item migration** inside `getSecure` (lines 139-147) and `modifySecure`.
- **Plain-text legacy migration** (lines 119-131): Detects old `{...}` or `[...]` JSON and re-encrypts.
- `markMigrationComplete()` clears the legacy key from memory and bumps the stored iteration count.

**Strengths**:
- Extremely defensive against "I upgraded the app and all my resumes disappeared."
- Clear separation of concerns and documented constants.
- `needsMigration()` / `isLegacyAvailable()` API is clean.

**Risks & Observations** (line-level):
- `storageCore.ts:58` — 5s hard cutoff is reasonable for UI but means partial migration state is normal. The code handles it, but there is no UI indicator to the user that "your vault is still upgrading in background."
- `encryptionService.ts:45` — Salt stored as comma-separated string of numbers. Works but fragile (no validation on load).
- No password-derived key. The seed is `crypto.randomUUID()` or device fingerprint (see `getVaultSeed`). This is **device-bound**, not user-portable. If user clears site data or switches browsers/devices without export, the vault is lost (by design for this threat model).
- `decrypt` throws on final failure (`encryptionService.ts:178`), but callers in Vault mostly swallow it and return `undefined`.
- **No server-side encryption at rest beyond Supabase's disk encryption**. Once data reaches Supabase it is plaintext from the service's perspective (normal for this architecture; user can see their own data in Supabase dashboard if they have the keys).

---

## 3. Concurrency Control — OperationQueue (promiseUtils.ts + storageCore.ts)

`OperationQueue` (promiseUtils.ts:27-48) is a tiny but critical primitive:

```ts
class OperationQueue {
    private queue: Promise<any> = Promise.resolve();
    async enqueue<T>(task) {
        const nextTask = this.queue.then(async () => { ... });
        this.queue = nextTask.catch(() => {});   // ← swallows errors so queue never stalls
        return nextTask;
    }
}
```

Used as the single global `vaultQueue` for **all** `getSecure`, `setSecure`, `modifySecure`, and internal `_setSecureInternal`.

**Why it matters**:
- Prevents two concurrent `addJob` + `updateJob` (or analysis completion + manual edit) from both reading the same old array and writing conflicting versions.
- `modifySecure` (storageCore.ts:178-206) is the atomic "read-modify-write" primitive that higher-level code is supposed to prefer for mutations.

**Findings**:
- Error swallowing (`catch(() => {})`) ensures the queue continues even if one operation fails. Correct for availability, but means individual callers must still handle their own errors.
- Nested `enqueue` calls are explicitly avoided via the private `_setSecureInternal` (comment at line 125-126 acknowledges the deadlock risk).
- `withTimeout` wrapper (used heavily on Supabase calls) is a simple `Promise.race` with a 10s default.

---

## 4. Domain Storage Patterns & Inconsistency Analysis

### Job Storage (richest merge logic)
`jobStorage.ts` has the most sophisticated conflict handling:
- Per-field healing (analysis, description length, status) — lines 75-84.
- Timestamp comparison with 1s tolerance.
- Self-healing writes (`updateJob` called from within `getJobs` on line 87).
- `_synced` marker to avoid re-uploading.
- Both batched `syncLocalToCloud` (orchestrator) **and** per-item `syncLocalToCloud` methods exist (inconsistent API surface).

### Resume Storage (coarser)
`resumeStorage.ts`:
- Treats the entire `resumes` array as one atomic blob stored in a single `content` JSON column.
- Timestamp comparison at array level.
- Falls back to a default primary profile on decryption failure (line 13).
- Much less per-block healing than jobs (relies on `areBlocksEqual` only for dedup elsewhere).

### Other Stores
- Skills, Coach/RoleModels, TargetJobs, Transcripts follow similar "fetch cloud IDs → compute missing → upsert" patterns with varying degrees of field mapping.
- **Duplication**: The "get cloud IDs, filter missing, build payload, insert/upsert, handle error" logic is repeated with small variations in `storageService.ts:57-168` and inside each `*Storage.syncLocalToCloud`.

### Block Deduplication (`blockUtils.ts`)
Simple normalized title+org comparison used by resume editing to avoid exact duplicates.

---

## 5. Sync Philosophy & Fire-and-Forget Pattern

**Core loop** (most common in domain stores):
1. Optimistic local `Vault.modifySecure` or `setSecure` (queued).
2. UI updates immediately.
3. Background `withTimeout(supabase...).catch(err => console.error(...))` — **no await, no retry, no user notification on transient failure**.

Examples:
- `jobStorage.ts:157-176` (addJob cloud write)
- `jobStorage.ts:193-210` (updateJob)
- Many places in `storageService.ts`

**Consequences**:
- Excellent perceived performance and offline support.
- Silent data loss possible on long network blips or Supabase temporary issues (only logged to console).
- The orchestrator `syncLocalToCloud` is the main recovery mechanism (called on various app loads / auth events).

**Positive mitigations present**:
- `withTimeout` on most cloud calls.
- Timestamp + field healing on next read.
- `Promise.allSettled` + failure counting in the orchestrator (lines 170-175).

---

## 6. Error Handling & Data Safety Posture

**Defensive Stance** (very consistent):
- Decryption failure in `getJobs` / `getResumes` → log error, return safe empty/default data, **abort further cloud sync for that domain** to avoid overwriting good local data with nothing.
- Many paths treat `undefined` (decryption failure) differently from `null` (key absent).
- Schema evolution tolerance: explicit checks for `PGRST204` / missing columns (jobStorage.ts:32-33).

**Gaps**:
- No structured error events surfaced to the user or to observability (Sentry etc.) when vault operations degrade.
- `clearAllData()` removes the encryption seed — irreversible vault loss (intentional for "sign out + wipe").
- No automated integrity / checksum verification of vault contents beyond "can we JSON.parse after decrypt?"

---

## 7. Test Coverage

Existing tests (`storageCore.test.ts`, `jobStorage.test.ts`, `resumeStorage.test.ts`, `coachStorage.test.ts`, etc.) exist and are exercised.

However, from the samples reviewed:
- Heavy focus on `areBlocksEqual` and happy-path block logic.
- EncryptionService and the full migration paths are mocked in core tests rather than exercised with real Web Crypto vectors.
- Very few adversarial tests (corrupt ciphertext, legacy + new key coexistence, concurrent modifySecure callers, timeout on Supabase during sync, etc.).

**Gap**: The most complex and dangerous code paths have the least realistic test coverage.

---

## 8. Specific Line-Level Findings & Recommendations

### High Priority / Concrete Issues

1. **Inconsistent Sync Logic Duplication** (storageService.ts + per-domain files)
   - Recommendation: Extract a `createDeltaSyncTask(domain, localItems, idExtractor, payloadBuilder, supabaseTable)` helper. This was called out in the original technical roadmap as well.

2. **Fire-and-Forget Cloud Writes Everywhere**
   - Many critical writes have zero retry and only `console.error`.
   - Recommendation: Introduce a small `backgroundSupabaseWrite(promise, context)` helper that at minimum logs structured events (once observability exists) and possibly queues a later retry.

3. **Unbounded Bucket Cache** (`bucketStorage.ts:14`)
   - Confirmed in the technical roadmap. `Map` grows for the life of the session.
   - Easy LRU or TTL fix.

4. **Resume Storage Uses Stringified JSON in One Column**
   - `resumes.content` contains the entire nested block structure.
   - Makes incremental sync and conflict resolution coarser than jobs. Consider whether this is still the right shape now that block-level editing is mature.

5. **OperationQueue Error Swallowing**
   - Correct for liveness, but consider adding an optional `onError` hook for monitoring.

6. **Migration UX**
   - 5s budget is good, but there is no user-visible "vault upgrade in progress" state or progress.

7. **any Typing**
   - `storageService.ts:55`: `syncTasks: (Promise<any> | PromiseLike<any>)[]`
   - Several domain stores cast liberally when merging.

8. **No Vault Integrity Check**
   - Add a cheap structural validation pass on load (e.g., count expected top-level keys, basic shape checks) that can warn the user if something looks corrupted.

### Lower Priority Polish

- Centralize the "build job payload for Supabase" transformation (appears in 4-5 places with slight differences).
- Make the 1-second timestamp tolerance a named constant (`TIMESTAMP_TOLERANCE_MS`).
- Consider a small `VaultHealth` or `VaultDiagnostics` export for admin/debug screens (current migration state, last successful decrypt, number of items, etc.).

---

## 9. Security & Threat Model Assessment

**What it protects well**:
- Local device theft / shared computer scenarios (data is encrypted at rest in localStorage).
- Accidental leakage via browser devtools or extensions reading localStorage (ciphertext only).
- Transparent upgrade of crypto parameters without data loss.

**What it does NOT protect**:
- Malicious or compromised Supabase service (data is plaintext server-side).
- User who loses the device seed (no recovery key / export flow visible in this layer).
- Sophisticated local attacker who can also compromise the JS runtime (they can hook Web Crypto or read decrypted memory).

**One subtle point**: The vault seed is stored in plain localStorage (`jobfit_vault_seed`). Combined with the salt, an attacker who can read localStorage can derive the key if they also have the ciphertext. This is acceptable for the "local device at-rest" threat model but worth documenting.

---

## 10. Recommended Deep Actions for This Subsystem

**Short term (high confidence wins)**:
1. Fix the unbounded `bucketCache` (one-line LRU or `maxSize`).
2. Extract shared sync delta logic to kill duplication.
3. Add structured logging (once the global logger exists) around all vault operations and failed cloud writes.
4. Increase test coverage on the Vault class with real encryption vectors and simulated legacy states.

**Medium term (architecture)**:
- Evaluate whether a library (e.g., WatermelonDB, RxDB, or even a thin wrapper around IndexedDB + encryption) could replace the custom vault while preserving the same guarantees. The custom code is impressive but maintenance-heavy.
- Consider an explicit "export vault" / "import vault" flow for users who want to move between devices (would require user-provided passphrase or QR code).

**Long term (platform)**:
- Once NextGen embeddings and style models become first-class user data, decide whether they live inside the encrypted vault or as Supabase rows (with appropriate sensitivity classification).

---

## Conclusion

The Storage & Vault subsystem is **one of the strongest pieces of engineering** in Navigator. It demonstrates real thought about data durability, privacy on shared devices, crypto upgrades, and offline usability — rare in web career tools.

Its weaknesses are classic for a custom-built layer of this complexity:
- Duplication of sync/orchestration logic
- Inconsistent merge sophistication across domains
- Limited realistic test coverage on the hardest paths
- Fire-and-forget background writes with only console logging

Addressing the duplication and adding observability around this layer would be high-leverage work before the data model grows further with NextGen features.

This subsystem deserves its own dedicated test suite, a small internal design doc, and periodic adversarial testing (corrupt data, concurrent writers, migration races).

---

**Related Documents**:
- [Audit.md](./Audit.md)
- [Audit-Deep-Dive.md](./Audit-Deep-Dive.md)
- [ROADMAP_TECHNICAL.md](./ROADMAP_TECHNICAL.md) (many past storage fixes documented there)

*Produced via exhaustive reading of all 14 storage-related files, encryption service, promise utilities, usage sites in contexts, and relevant schema migrations.*
