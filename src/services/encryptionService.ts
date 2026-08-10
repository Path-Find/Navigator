/**
 * EncryptionService
 * 
 * Provides client-side AES-256-GCM encryption for the "Privacy Vault".
 * Uses the Web Crypto API to ensure data remains secure on-device.
 */

const ENCRYPTION_ALGO = 'AES-GCM';
const KEY_DERIVATION_ALGO = 'PBKDF2';
const ITERATIONS = 600000;
const SALT_SIZE = 16;
const IV_SIZE = 12;
const BASE64_CHUNK_SIZE = 0x8000;

/**
 * Converts bytes to Base64 without spreading a large buffer into one
 * function call. The vault can contain a full job history, which can exceed
 * the browser's argument-count limit.
 */
function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';

    for (let offset = 0; offset < bytes.length; offset += BASE64_CHUNK_SIZE) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + BASE64_CHUNK_SIZE));
    }

    return btoa(binary);
}

/**
 * The iteration count used before the security hardening in v2.25.
 * Kept as a constant so the migration path is clearly documented.
 */
const LEGACY_ITERATIONS = 100_000;

/** localStorage key that records which PBKDF2 iteration count was used to derive the vault key. */
const ITERATIONS_KEY = 'jobfit_vault_iterations';

class EncryptionService {
    private key: CryptoKey | null = null;
    private salt: Uint8Array | null = null;
    /** Derived with the old iteration count; present only during a migration window. */
    private legacyKey: CryptoKey | null = null;

    /**
     * Initializes the service with a user-specific secret or device identifier.
     * In a full E2EE setup, this would be a user-provided password.
     * For V1, we'll use a stable device-bound string combined with a local salt.
     *
     * Migration: if an existing vault was created with a lower iteration count
     * (either legacy 100k iterations or an explicitly stored older value), a
     * legacyKey is derived so that storageCore can transparently re-encrypt
     * existing data before the session starts.
     */
    async init(secretSeed: string): Promise<void> {
        // 1. Check for existing salt in localStorage
        const storedSalt = localStorage.getItem('jobfit_vault_salt');
        const isExistingVault = !!storedSalt;

        if (storedSalt) {
            this.salt = new Uint8Array(storedSalt.split(',').map(Number));
        } else {
            // New vault: generate and store salt
            this.salt = window.crypto.getRandomValues(new Uint8Array(SALT_SIZE));
            localStorage.setItem('jobfit_vault_salt', this.salt.toString());
        }

        // 2. Determine the iteration count previously used for this vault.
        //    An existing vault with no stored count was created before iteration
        //    versioning was introduced, so it used LEGACY_ITERATIONS (100,000).
        const storedIterationsRaw = localStorage.getItem(ITERATIONS_KEY);
        const previousIterations = isExistingVault
            ? (storedIterationsRaw ? parseInt(storedIterationsRaw, 10) : LEGACY_ITERATIONS)
            : ITERATIONS;

        const migrationNeeded = previousIterations !== ITERATIONS;

        // 3. Derive base key material
        const encoder = new TextEncoder();
        const baseKey = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(secretSeed),
            KEY_DERIVATION_ALGO,
            false,
            ['deriveKey']
        );

        // 4. If the vault needs upgrading, derive a legacy key so callers can
        //    decrypt existing ciphertext before re-encrypting with the new key.
        if (migrationNeeded) {
            this.legacyKey = await window.crypto.subtle.deriveKey(
                {
                    name: KEY_DERIVATION_ALGO,
                    salt: this.salt as BufferSource,
                    iterations: previousIterations,
                    hash: 'SHA-256'
                },
                baseKey,
                { name: ENCRYPTION_ALGO, length: 256 },
                false,
                ['encrypt', 'decrypt']
            );
        } else {
            this.legacyKey = null;
        }

        // 5. Derive the current (hardened) key
        this.key = await window.crypto.subtle.deriveKey(
            {
                name: KEY_DERIVATION_ALGO,
                salt: this.salt as BufferSource,
                iterations: ITERATIONS,
                hash: 'SHA-256'
            },
            baseKey,
            { name: ENCRYPTION_ALGO, length: 256 },
            false,
            ['encrypt', 'decrypt']
        );

        // For a brand-new vault, record the iteration count immediately
        // (existing vaults get it written by markMigrationComplete).
        if (!isExistingVault) {
            localStorage.setItem(ITERATIONS_KEY, String(ITERATIONS));
        }
    }

    /**
     * Returns true when the vault was created with an older iteration count and
     * the stored data must be re-encrypted before use.
     */
    needsMigration(): boolean {
        return this.legacyKey !== null;
    }

    /**
     * Returns true if a legacy key is currently derived and available for use
     * (meaning a migration is in progress or was requested).
     */
    isLegacyAvailable(): boolean {
        return this.legacyKey !== null;
    }

    /**
     * Decrypts a vault entry that was encrypted with the legacy (pre-hardening) key.
     * Only available while needsMigration() is true.
     */
    async decryptLegacy(vaultData: string): Promise<string> {
        if (!this.legacyKey) throw new Error("No legacy key available; decryptLegacy can only be called when needsMigration() is true");
        return this.decryptWithKey(this.legacyKey, vaultData);
    }

    /**
     * Records that migration is complete: persists the current iteration count
     * and releases the legacy key from memory.
     */
    markMigrationComplete(): void {
        localStorage.setItem(ITERATIONS_KEY, String(ITERATIONS));
        this.legacyKey = null;
    }

    /**
     * Encrypts a string of data.
     * Returns a Base64 string containing: [iv]:[ciphertext]
     */
    async encrypt(plainText: string): Promise<string> {
        if (!this.key) throw new Error("Encryption key not initialized");

        const encoder = new TextEncoder();
        const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE));

        const encryptedContent = await window.crypto.subtle.encrypt(
            { name: ENCRYPTION_ALGO, iv },
            this.key,
            encoder.encode(plainText)
        );

        // Package as Base64 for storage
        const ivBase64 = bytesToBase64(iv);
        const contentBase64 = bytesToBase64(new Uint8Array(encryptedContent));

        return `${ivBase64}:${contentBase64}`;
    }

    /**
     * Decrypts a previously encrypted Base64 string.
     */
    async decrypt(vaultData: string): Promise<string> {
        if (!this.key) throw new Error("Encryption key not initialized");
        try {
            return await this.decryptWithKey(this.key, vaultData);
        } catch {
            console.error("Decryption failed. Data may be corrupted or key is incorrect.");
            throw new Error("Failed to decrypt vault data. Data may be corrupted or the key is incorrect.");
        }
    }

    private async decryptWithKey(key: CryptoKey, vaultData: string): Promise<string> {
        const [ivBase64, contentBase64] = vaultData.split(':');
        if (!ivBase64 || !contentBase64) throw new Error("Invalid vault data format");

        const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
        const ciphertext = Uint8Array.from(atob(contentBase64), c => c.charCodeAt(0));

        const decryptedContent = await window.crypto.subtle.decrypt(
            { name: ENCRYPTION_ALGO, iv },
            key,
            ciphertext
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedContent);
    }
}

export const encryptionService = new EncryptionService();
