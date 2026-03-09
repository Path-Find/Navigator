import { describe, it, expect, beforeEach } from 'vitest';
import { encryptionService } from './encryptionService';

/**
 * Tests for the PBKDF2 iteration-count migration logic.
 *
 * The Web Crypto API is mocked in src/test/setup.ts:
 *   - deriveKey always returns {}
 *   - encrypt wraps data with an "encrypted:" prefix
 *   - decrypt strips the "encrypted:" prefix
 *
 * These tests verify the *detection and control-flow* of the migration —
 * the actual cryptographic correctness is guaranteed by the Web Crypto
 * implementation, not by the application code.
 */
describe('EncryptionService - PBKDF2 iteration migration', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('does not flag migration for a brand-new vault (no salt)', async () => {
        await encryptionService.init('test-seed');
        expect(encryptionService.needsMigration()).toBe(false);
    });

    it('records the current iteration count for a brand-new vault', async () => {
        await encryptionService.init('test-seed');
        expect(localStorage.getItem('jobfit_vault_iterations')).toBe('600000');
    });

    it('flags migration for an existing vault with no stored iteration count', async () => {
        // Simulate a vault created before iteration versioning was introduced:
        // salt exists, but no iteration count key was ever written.
        localStorage.setItem('jobfit_vault_salt', '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16');

        await encryptionService.init('test-seed');

        expect(encryptionService.needsMigration()).toBe(true);
    });

    it('flags migration for an existing vault explicitly storing the old iteration count', async () => {
        localStorage.setItem('jobfit_vault_salt', '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16');
        localStorage.setItem('jobfit_vault_iterations', '100000');

        await encryptionService.init('test-seed');

        expect(encryptionService.needsMigration()).toBe(true);
    });

    it('does not flag migration for a vault already at the current iteration count', async () => {
        localStorage.setItem('jobfit_vault_salt', '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16');
        localStorage.setItem('jobfit_vault_iterations', '600000');

        await encryptionService.init('test-seed');

        expect(encryptionService.needsMigration()).toBe(false);
    });

    it('markMigrationComplete stores the current iteration count', async () => {
        localStorage.setItem('jobfit_vault_salt', '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16');
        await encryptionService.init('test-seed');

        encryptionService.markMigrationComplete();

        expect(localStorage.getItem('jobfit_vault_iterations')).toBe('600000');
    });

    it('markMigrationComplete clears the migration flag', async () => {
        localStorage.setItem('jobfit_vault_salt', '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16');
        await encryptionService.init('test-seed');
        expect(encryptionService.needsMigration()).toBe(true);

        encryptionService.markMigrationComplete();

        expect(encryptionService.needsMigration()).toBe(false);
    });
});
