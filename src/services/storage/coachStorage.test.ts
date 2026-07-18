import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CoachStorage } from './coachStorage';
import { Vault, getUserId } from './storageCore';
import type { RoleModelProfile, TargetJob } from '../../types';

vi.mock('./storageCore', () => ({
    Vault: {
        getSecure: vi.fn(),
        setSecure: vi.fn(),
    },
    getUserId: vi.fn(),
}));

vi.mock('../../lib/data-client', () => {
    const chain: any = {
        select: vi.fn(),
        insert: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(),
    };
    Object.values(chain).forEach(fn => (fn as any).mockReturnValue(chain));
    // Default resolution
    chain.order.mockResolvedValue({ data: [], error: null });
    chain.insert.mockResolvedValue({ error: null });
    chain.upsert.mockResolvedValue({ error: null });
    chain.delete.mockResolvedValue({ error: null });
    chain.eq.mockResolvedValue({ error: null });

    return { dataClient: { from: vi.fn(() => chain) } };
});

vi.mock('../../utils/promiseUtils', () => ({
    withTimeout: vi.fn((p: Promise<any>) => p),
}));

const mockRoleModel = (id: string): RoleModelProfile => ({
    id,
    name: 'Model ' + id,
} as RoleModelProfile);

const mockTargetJob = (id: string): TargetJob => ({
    id,
    title: 'Job ' + id,
    description: 'desc',
    type: 'goal',
    strictMode: true,
    dateAdded: Date.now(),
} as TargetJob);

describe('CoachStorage — Role Models', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getUserId).mockResolvedValue(null); // logged out by default
    });

    it('returns empty array when local store is empty and no cloud user', async () => {
        vi.mocked(Vault.getSecure).mockResolvedValue(null);

        const result = await CoachStorage.getRoleModels();

        expect(result).toEqual([]);
    });

    it('returns locally stored role models when not logged in', async () => {
        const models = [mockRoleModel('rm-1'), mockRoleModel('rm-2')];
        vi.mocked(Vault.getSecure).mockResolvedValue(models);

        const result = await CoachStorage.getRoleModels();

        expect(result).toEqual(models);
    });

    it('returns empty array on decryption failure', async () => {
        vi.mocked(Vault.getSecure).mockResolvedValue(undefined as any);

        const result = await CoachStorage.getRoleModels();

        expect(result).toEqual([]);
    });

    it('adds a role model and persists locally', async () => {
        const existing = [mockRoleModel('rm-1')];
        const newModel = mockRoleModel('rm-2');
        vi.mocked(Vault.getSecure).mockResolvedValue(existing);

        const result = await CoachStorage.addRoleModel(newModel);

        expect(result[0]).toEqual(newModel); // prepended
        expect(Vault.setSecure).toHaveBeenCalledWith(
            expect.any(String),
            expect.arrayContaining([newModel, existing[0]])
        );
    });

    it('addRoleModel throws when decryption fails', async () => {
        vi.mocked(Vault.getSecure).mockResolvedValue(undefined as any);

        await expect(CoachStorage.addRoleModel(mockRoleModel('rm-x'))).rejects.toThrow('Storage unavailable');
    });

    it('deletes a role model by id', async () => {
        const models = [mockRoleModel('rm-1'), mockRoleModel('rm-2')];
        vi.mocked(Vault.getSecure).mockResolvedValue(models);

        const result = await CoachStorage.deleteRoleModel('rm-1');

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('rm-2');
        expect(Vault.setSecure).toHaveBeenCalledWith(expect.any(String), [models[1]]);
    });
});

describe('CoachStorage — Target Jobs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getUserId).mockResolvedValue(null);
    });

    it('returns empty array when no local target jobs', async () => {
        vi.mocked(Vault.getSecure).mockResolvedValue(null);

        const result = await CoachStorage.getTargetJobs();

        expect(result).toEqual([]);
    });

    it('returns locally stored target jobs', async () => {
        const jobs = [mockTargetJob('tj-1')];
        vi.mocked(Vault.getSecure).mockResolvedValue(jobs);

        const result = await CoachStorage.getTargetJobs();

        expect(result).toEqual(jobs);
    });

    it('saves a new target job (prepend)', async () => {
        const existing = [mockTargetJob('tj-1')];
        const newJob = mockTargetJob('tj-2');
        vi.mocked(Vault.getSecure).mockResolvedValue(existing);

        const result = await CoachStorage.saveTargetJob(newJob);

        expect(result[0]).toEqual(newJob);
        expect(result).toHaveLength(2);
    });

    it('updates an existing target job in place', async () => {
        const original = mockTargetJob('tj-1');
        const updated = { ...original, title: 'Updated Title' };
        vi.mocked(Vault.getSecure).mockResolvedValue([original]);

        const result = await CoachStorage.saveTargetJob(updated);

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('Updated Title');
    });

    it('saveTargetJob throws when decryption fails', async () => {
        vi.mocked(Vault.getSecure).mockResolvedValue(undefined as any);

        await expect(CoachStorage.saveTargetJob(mockTargetJob('tj-x'))).rejects.toThrow('Storage unavailable');
    });

    it('deletes a target job by id', async () => {
        const jobs = [mockTargetJob('tj-1'), mockTargetJob('tj-2')];
        vi.mocked(Vault.getSecure).mockResolvedValue(jobs);

        const result = await CoachStorage.deleteTargetJob('tj-1');

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('tj-2');
    });
});
