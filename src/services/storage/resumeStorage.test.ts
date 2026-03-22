import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResumeStorage } from './resumeStorage';
import { Vault, getUserId, areBlocksEqual } from './storageCore';
import type { ResumeProfile } from '../../types';

vi.mock('./storageCore', () => ({
    Vault: {
        getSecure: vi.fn(),
        setSecure: vi.fn(),
    },
    getUserId: vi.fn(),
    areBlocksEqual: vi.fn(),
}));

vi.mock('../supabase', () => {
    const chain: any = {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(),
        limit: vi.fn(),
        maybeSingle: vi.fn(),
    };
    Object.values(chain).forEach(fn => (fn as any).mockReturnValue(chain));
    chain.maybeSingle.mockResolvedValue({ data: null, error: null });
    chain.insert.mockResolvedValue({ error: null });
    chain.update.mockResolvedValue({ error: null });

    return { supabase: { from: vi.fn(() => chain) } };
});

vi.mock('../../utils/promiseUtils', () => ({
    withTimeout: vi.fn((p: Promise<any>) => p),
}));

const DEFAULT_PROFILE: ResumeProfile = { id: 'primary', name: 'Primary Experience', blocks: [] };

const makeProfile = (id: string, updatedAt = 0): ResumeProfile => ({
    id,
    name: 'Profile ' + id,
    blocks: [{ id: 'b1', title: 'Dev', organization: 'Acme', dateRange: '2020', bullets: ['Built things'], isVisible: true }],
    updatedAt,
} as ResumeProfile);

describe('ResumeStorage.getResumes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getUserId).mockResolvedValue(undefined);
    });

    it('returns default profile when vault is null (no local data)', async () => {
        vi.mocked(Vault.getSecure).mockResolvedValue(null);

        const result = await ResumeStorage.getResumes();

        expect(result).toEqual([DEFAULT_PROFILE]);
    });

    it('returns default profile when decryption fails (undefined)', async () => {
        vi.mocked(Vault.getSecure).mockResolvedValue(undefined as any);

        const result = await ResumeStorage.getResumes();

        expect(result).toEqual([DEFAULT_PROFILE]);
    });

    it('returns locally stored profiles when not logged in', async () => {
        const profiles = [makeProfile('p1')];
        vi.mocked(Vault.getSecure).mockResolvedValue(profiles);

        const result = await ResumeStorage.getResumes();

        expect(result).toEqual(profiles);
    });
});

describe('ResumeStorage.saveResumes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getUserId).mockResolvedValue(undefined);
    });

    it('stamps updatedAt and persists locally', async () => {
        const profiles = [makeProfile('p1', 0)];

        await ResumeStorage.saveResumes(profiles);

        expect(Vault.setSecure).toHaveBeenCalledOnce();
        const saved = vi.mocked(Vault.setSecure).mock.calls[0][1] as ResumeProfile[];
        expect(saved[0].updatedAt).toBeGreaterThan(0);
    });

    it('does not sync to cloud when no userId', async () => {
        const { supabase } = await import('../supabase');
        vi.mocked(Vault.getSecure).mockResolvedValue(null);

        await ResumeStorage.saveResumes([makeProfile('p1')]);

        expect(supabase.from).not.toHaveBeenCalled();
    });
});

describe('ResumeStorage.addResume', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getUserId).mockResolvedValue(undefined);
    });

    it('throws when decryption fails', async () => {
        vi.mocked(Vault.getSecure).mockResolvedValue(undefined as any);

        await expect(ResumeStorage.addResume(makeProfile('new'))).rejects.toThrow('Storage unavailable');
    });

    it('stores the profile directly when vault is empty', async () => {
        vi.mocked(Vault.getSecure).mockResolvedValue([]);
        const newProfile = makeProfile('new');

        await ResumeStorage.addResume(newProfile);

        expect(Vault.setSecure).toHaveBeenCalledWith(
            expect.any(String),
            [newProfile]
        );
    });

    it('merges blocks into the master profile without duplicating', async () => {
        const master = makeProfile('primary');
        vi.mocked(Vault.getSecure).mockResolvedValue([master]);
        // areBlocksEqual returns false → treat as new block
        vi.mocked(areBlocksEqual).mockReturnValue(false);

        const incoming = makeProfile('import');
        await ResumeStorage.addResume(incoming);

        const saved = vi.mocked(Vault.setSecure).mock.calls[0][1] as ResumeProfile[];
        // Master profile should have gained the incoming block
        expect(saved[0].blocks.length).toBe(
            master.blocks.length + incoming.blocks.length
        );
    });

    it('deduplicates bullets when blocks are considered equal', async () => {
        const master = makeProfile('primary');
        const incoming = {
            ...makeProfile('import'),
            blocks: [{
                ...master.blocks[0],
                bullets: ['Built things', 'New bullet'] // 'Built things' is a dupe
            }]
        };
        vi.mocked(Vault.getSecure).mockResolvedValue([master]);
        vi.mocked(areBlocksEqual).mockReturnValue(true); // same block

        await ResumeStorage.addResume(incoming);

        const saved = vi.mocked(Vault.setSecure).mock.calls[0][1] as ResumeProfile[];
        const mergedBullets = saved[0].blocks[0].bullets;
        const unique = new Set(mergedBullets.map((b: string) => b.trim().toLowerCase()));
        expect(unique.size).toBe(mergedBullets.length);
        expect(mergedBullets).toContain('New bullet');
    });
});
