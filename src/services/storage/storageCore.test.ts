
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { areBlocksEqual, Vault } from './storageCore';
import { encryptionService } from '../encryptionService';

vi.mock('../supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(() => Promise.resolve({ data: { session: null } }))
        }
    }
}));

vi.mock('../encryptionService', () => ({
    encryptionService: {
        init: vi.fn(),
        needsMigration: vi.fn(),
        decryptLegacy: vi.fn(),
        encrypt: vi.fn(),
        decrypt: vi.fn(),
        markMigrationComplete: vi.fn(),
    }
}));

describe('areBlocksEqual (exported from storageCore)', () => {
    it('should correctly compare two equal blocks', () => {
        const a = { type: 'work', title: 'Developer', organization: 'Company A' };
        const b = { type: 'work', title: 'Developer', organization: 'Company A' };
        expect(areBlocksEqual(a, b)).toBe(true);
    });

    it('should correctly compare two different blocks', () => {
        const a = { type: 'work', title: 'Developer', organization: 'Company A' };
        const b = { type: 'work', title: 'Manager', organization: 'Company A' };
        expect(areBlocksEqual(a, b)).toBe(false);
    });
});

describe('Vault - PBKDF2 iteration migration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Vault.initialized = false;
        localStorage.clear();
        localStorage.setItem('jobfit_vault_seed', 'test-seed-123');
    });

    it('skips migration when encryptionService reports none needed', async () => {
        vi.mocked(encryptionService.needsMigration).mockReturnValue(false);

        await Vault.ensureInit();

        expect(encryptionService.markMigrationComplete).not.toHaveBeenCalled();
    });

    it('re-encrypts vault items and marks migration complete when migration is needed', async () => {
        vi.mocked(encryptionService.needsMigration).mockReturnValue(true);
        vi.mocked(encryptionService.decryptLegacy).mockResolvedValue('{"resumes":[]}');
        vi.mocked(encryptionService.encrypt).mockResolvedValue('newIv:newCiphertext');

        // Simulate vault data encrypted with the old key
        localStorage.setItem('navigator_resumes_v2', 'oldIv:oldCiphertext');

        await Vault.ensureInit();

        expect(encryptionService.decryptLegacy).toHaveBeenCalledWith('oldIv:oldCiphertext');
        expect(encryptionService.encrypt).toHaveBeenCalledWith('{"resumes":[]}');
        expect(localStorage.getItem('navigator_resumes_v2')).toBe('newIv:newCiphertext');
        expect(encryptionService.markMigrationComplete).toHaveBeenCalled();
    });

    it('silently skips plain-JSON items during migration', async () => {
        vi.mocked(encryptionService.needsMigration).mockReturnValue(true);

        localStorage.setItem('navigator_resumes_v2', '{"already":"plain"}');

        await Vault.ensureInit();

        // JSON items are excluded from migration without attempting decryption
        expect(encryptionService.decryptLegacy).not.toHaveBeenCalledWith('{"already":"plain"}');
        expect(encryptionService.markMigrationComplete).toHaveBeenCalled();
    });

    it('silently skips non-vault items (no colon) during migration', async () => {
        vi.mocked(encryptionService.needsMigration).mockReturnValue(true);

        localStorage.setItem('navigator_theme', 'dark');

        await Vault.ensureInit();

        expect(encryptionService.decryptLegacy).not.toHaveBeenCalledWith('dark');
        expect(encryptionService.markMigrationComplete).toHaveBeenCalled();
    });

    it('skips items that fail legacy decryption without aborting the migration', async () => {
        vi.mocked(encryptionService.needsMigration).mockReturnValue(true);
        vi.mocked(encryptionService.decryptLegacy).mockResolvedValueOnce('{"valid":"data"}');
        vi.mocked(encryptionService.decryptLegacy).mockRejectedValueOnce(new Error('bad ciphertext'));
        vi.mocked(encryptionService.encrypt).mockResolvedValue('newIv:newCiphertext');

        localStorage.setItem('navigator_resumes_v2', 'validIv:validCiphertext');
        localStorage.setItem('navigator_jobs_history', 'corruptIv:corruptCiphertext');

        await Vault.ensureInit();

        // Valid item was migrated
        expect(localStorage.getItem('navigator_resumes_v2')).toBe('newIv:newCiphertext');
        // Migration still completed despite the error on the second item
        expect(encryptionService.markMigrationComplete).toHaveBeenCalled();
    });

    it('sets initialized=true after migration', async () => {
        vi.mocked(encryptionService.needsMigration).mockReturnValue(true);

        await Vault.ensureInit();

        expect(Vault.initialized).toBe(true);
    });
});
