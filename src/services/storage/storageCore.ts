import { supabase } from '../supabase';
import { encryptionService } from '../encryptionService';
import { Logger } from '../../utils/logger';

// Helper: Get User ID if logged in — cached for 30s to avoid repeated session reads
let cachedUserIdPromise: Promise<string | undefined> | null = null;

export const getUserId = async (): Promise<string | undefined> => {
    if (!cachedUserIdPromise) {
        cachedUserIdPromise = supabase.auth.getSession()
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

    for (const key of keysToCheck) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;

        // Vault entries have the form ivBase64:ciphertextBase64.
        // Base64 characters are A-Z, a-z, 0-9, +, / and = (padding).
        // Characters like '{', '[', spaces, or hyphens are never valid base64,
        // so this regex efficiently rejects JSON, plain strings, and UUIDs
        // while matching potential vault ciphertext.
        if (!/^[A-Za-z0-9+/].*:[A-Za-z0-9+/]/.test(raw)) continue;

        try {
            const decrypted = await encryptionService.decryptLegacy(raw);
            const reEncrypted = await encryptionService.encrypt(decrypted);
            localStorage.setItem(key, reEncrypted);
        } catch {
            // Not vault data, or already corrupted — leave untouched
        }
    }

    encryptionService.markMigrationComplete();
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

    async getSecure<T = unknown>(key: string): Promise<T | null> {
        await this.ensureInit();
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        // Migration/Compatibility check
        if (raw.startsWith('{') || raw.startsWith('[')) {
            Logger.log(`[Vault] Migrating legacy content for key: ${key}`);
            try {
                const data = JSON.parse(raw);
                await this.setSecure(key, data);
                return data;
            } catch {
                return null;
            }
        }

        try {
            const decrypted = await encryptionService.decrypt(raw);
            return JSON.parse(decrypted);
        } catch {
            console.error(`[Vault] Decryption failed for ${key}. Data may be corrupted.`);
            return null;
        }
    },

    async setSecure(key: string, data: unknown) {
        await this.ensureInit();
        const serialized = JSON.stringify(data);
        const encrypted = await encryptionService.encrypt(serialized);
        localStorage.setItem(key, encrypted);
    }
};

export { areBlocksEqual } from './blockUtils';
