/**
 * LocalStorage — centralized access to window.localStorage.
 *
 * All direct localStorage reads/writes outside of the Vault (encrypted storage)
 * must go through this utility. This is the single point for future
 * observability, encryption migration, and cross-tab sync.
 *
 * Infrastructure files (storageCore, encryptionService, secureStorage) are
 * exempt — they implement the storage layer itself and must use raw APIs.
 */
export const LocalStorage = {
    get(key: string): string | null {
        try {
            return window.localStorage.getItem(key);
        } catch {
            return null;
        }
    },

    set(key: string, value: string): void {
        try {
            window.localStorage.setItem(key, value);
        } catch {
            // Ignore (e.g. private browsing quota exceeded)
        }
    },

    remove(key: string): void {
        try {
            window.localStorage.removeItem(key);
        } catch {
            // Ignore
        }
    },
};
