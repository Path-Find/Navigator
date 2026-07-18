import { authClient } from '../../lib/auth-client';
import { encryptionService } from '../encryptionService';
import { Logger } from '../../utils/logger';
import { OperationQueue } from '../../utils/promiseUtils';

// Helper: Get User ID if logged in — cached for 30s to avoid repeated session reads
let cachedUserIdPromise: Promise<string | undefined> | null = null;

// Serialization queue for all vault operations to prevent race conditions
const vaultQueue = new OperationQueue();

export const getUserId = async (): Promise<string | undefined> => {
    if (!cachedUserIdPromise) {
        cachedUserIdPromise = authClient.getSession()
            .then(({ data: { session } }) => session?.user?.id)
            .catch(() => undefined);
        setTimeout(() => { cachedUserIdPromise = null; }, 5_000);
    }
    return cachedUserIdPromise;
};

// Call this on auth state changes to immediately invalidate the cache
export const invalidateUserIdCache = () => { cachedUserIdPromise = null; };

// --- Private Vault (Encryption) Logic ---

const getVaultSeed = () => {
    let seed = localStorage.getItem('jobfit_vault_seed');
    if (!seed) {
        seed = crypto.randomUUID();
        localStorage.setItem('jobfit_vault_seed', seed);
    }
    return seed;
};

/**
 * Re-encrypts every vault item in localStorage using the new (hardened) key.
 *
 * Called once per device when the app first loads after a PBKDF2 iteration
 * count increase.  Any item that cannot be decrypted with the legacy key is
 * silently skipped — it is either a non-vault entry or already corrupted.
 */
async function migrateVaultData(): Promise<void> {
    // Snapshot the keys first to avoid mutating the collection mid-loop
    const keysToCheck: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) keysToCheck.push(k);
    }

    const startTime = Date.now();
    const MIGRATION_TIMEOUT_MS = 5000; // 5s budget for migration

    let allFinished = true;
    for (const key of keysToCheck) {
        // Break if we exceed the budget to prevent long UI blocks
        if (Date.now() - startTime > MIGRATION_TIMEOUT_MS) {
            console.warn(`[Vault] Migration budget exceeded after processing ${keysToCheck.indexOf(key)}/${keysToCheck.length} items. Remainder will be lazy-migrated.`);
            allFinished = false;
            break;
        }

        const raw = localStorage.getItem(key);
        if (!raw) continue;

        // Vault entries have the form ivBase64:ciphertextBase64.
        if (!/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/.test(raw)) continue;

        try {
            const decrypted = await encryptionService.decryptLegacy(raw);
            const reEncrypted = await encryptionService.encrypt(decrypted);
            localStorage.setItem(key, reEncrypted);
        } catch (err) {
            // Not vault data (e.g. already migrated or different key) — leave untouched
            Logger.log(`[Vault] Skipping key "${key}" during migration (not legacy vault data):`, err);
        }
    }

    if (allFinished) {
        encryptionService.markMigrationComplete();
        Logger.log("[Vault] Global migration complete.");
    }
}

export const Vault = {
    initialized: false,
    initPromise: null as Promise<void> | null,

    async ensureInit() {
        if (this.initialized) return;
        if (!this.initPromise) {
            this.initPromise = (async () => {
                const seed = getVaultSeed();
                await encryptionService.init(seed);
                if (encryptionService.needsMigration()) {
                    await migrateVaultData();
                }
                this.initialized = true;
            })();
        }
        await this.initPromise;
    },

    /**
     * Retrieves and decrypts data from secure storage.
     * 
     * Returns:
     * - T: The parsed data if success.
     * - null: If the key does not exist.
     * - undefined: If the key exists but could NOT be decrypted (error state).
     */
    async getSecure<T = unknown>(key: string): Promise<T | null | undefined> {
        return vaultQueue.enqueue(async () => {
            await this.ensureInit();
            const raw = localStorage.getItem(key);
            if (!raw) return null;

            // Compatibility/Cleanup migrator for ancient plain-text storage
            if (raw.startsWith('{') || raw.startsWith('[')) {
                Logger.log(`[Vault] Migrating legacy content for key: ${key}`);
                try {
                    const data = JSON.parse(raw);
                    // Internal call to setSecure is also queued, but since we are already inside the queue
                    // loop, we call a private version or just execute the logic.
                    // Actually, nesting enqueue calls on the same OperationQueue will cause a DEADLOCK.
                    // We need a non-queued version for internal use.
                    await this._setSecureInternal(key, data);
                    return data;
                } catch {
                    return undefined;
                }
            }

            try {
                const decrypted = await encryptionService.decrypt(raw);
                return JSON.parse(decrypted);
            } catch {
                // Primary decryption failed. If we have a legacy key available, retry.
                if (encryptionService.isLegacyAvailable()) {
                    try {
                        const decryptedLegacy = await encryptionService.decryptLegacy(raw);
                        const data = JSON.parse(decryptedLegacy);
                        
                        // Lazy Migration: re-encrypt now to prevent future failures
                        await this._setSecureInternal(key, data);
                        Logger.log(`[Vault] Lazy-migrated item: ${key}`);
                        return data;
                    } catch {
                        // Even legacy failed
                    }
                }
                
                console.error(`[Vault] Decryption failed for ${key}. Data may be corrupted or key mismatch.`);
                return undefined;
            }
        });
    },

    async setSecure(key: string, data: unknown) {
        return vaultQueue.enqueue(async () => {
            await this._setSecureInternal(key, data);
        });
    },

    // Internal non-queued version to avoid deadlocks within getSecure
    async _setSecureInternal(key: string, data: unknown) {
        await this.ensureInit();
        const serialized = JSON.stringify(data);
        const encrypted = await encryptionService.encrypt(serialized);
        localStorage.setItem(key, encrypted);
    },

    /**
     * Atomically modifies a vault entry. 
     * Reads the current value, passes it to the callback, and writes the returned value back.
     * The entire operation is queued on vaultQueue to prevent race conditions.
     */
    async modifySecure<T = unknown>(key: string, modifier: (current: T | null) => T | Promise<T>): Promise<T> {
        return vaultQueue.enqueue(async () => {
            await this.ensureInit();
            const raw = localStorage.getItem(key);
            let current: T | null = null;

            if (raw) {
                try {
                    // Try standard decryption first
                    const decrypted = await encryptionService.decrypt(raw);
                    current = JSON.parse(decrypted);
                } catch {
                    // Fallback to legacy if available (mirrors getSecure logic)
                    if (encryptionService.isLegacyAvailable()) {
                        try {
                            const decryptedLegacy = await encryptionService.decryptLegacy(raw);
                            current = JSON.parse(decryptedLegacy);
                        } catch {
                            // Silently fail to null if double-corrupted
                        }
                    }
                }
            }

            const updated = await modifier(current);
            await this._setSecureInternal(key, updated);
            return updated;
        });
    }
};

export { areBlocksEqual } from './blockUtils';
