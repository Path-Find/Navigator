import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SkillStorage } from './skillStorage';
import { Vault, getUserId } from './storageCore';
import type { CustomSkill } from '../../types';

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
        single: vi.fn(),
    };
    Object.values(chain).forEach(fn => (fn as any).mockReturnValue(chain));
    chain.order.mockResolvedValue({ data: [], error: null });
    chain.upsert.mockResolvedValue({ data: [], error: null });
    chain.delete.mockResolvedValue({ error: null });
    chain.single.mockResolvedValue({ data: null, error: null });

    return { dataClient: { from: vi.fn(() => chain) } };
});

vi.mock('../../utils/promiseUtils', () => ({
    withTimeout: vi.fn((p: Promise<any>) => p),
}));

const makeSkill = (name: string): CustomSkill => ({
    id: 'skill-' + name,
    name,
    proficiency: 'Intermediate',
    evidence: 'Used at work',
    user_id: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
});

describe('SkillStorage.getSkills', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getUserId).mockResolvedValue(undefined);
    });

    it('returns empty array when vault is null', async () => {
        vi.mocked(Vault.getSecure).mockResolvedValue(null);

        const result = await SkillStorage.getSkills();

        expect(result).toEqual([]);
    });

    it('returns empty array when decryption fails', async () => {
        vi.mocked(Vault.getSecure).mockResolvedValue(undefined as any);

        const result = await SkillStorage.getSkills();

        expect(result).toEqual([]);
    });

    it('returns local skills when not logged in', async () => {
        const skills = [makeSkill('TypeScript'), makeSkill('React')];
        vi.mocked(Vault.getSecure).mockResolvedValue(skills);

        const result = await SkillStorage.getSkills();

        expect(result).toEqual(skills);
    });
});

describe('SkillStorage.saveSkill — anonymous user', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getUserId).mockResolvedValue(undefined);
    });

    it('throws when decryption fails', async () => {
        vi.mocked(Vault.getSecure).mockResolvedValue(undefined as any);

        await expect(SkillStorage.saveSkill({ name: 'Python' })).rejects.toThrow(
            'Secure storage is temporarily unavailable.'
        );
    });

    it('inserts a new skill into an empty vault', async () => {
        vi.mocked(Vault.getSecure).mockResolvedValue([]);

        const result = await SkillStorage.saveSkill({ name: 'Python', proficiency: 'Beginner' });

        expect(result.name).toBe('Python');
        expect(result.user_id).toBe('anonymous');
        expect(Vault.setSecure).toHaveBeenCalledOnce();
    });

    it('updates an existing skill in-place', async () => {
        const existing = makeSkill('Python');
        vi.mocked(Vault.getSecure).mockResolvedValue([existing]);

        const result = await SkillStorage.saveSkill({ name: 'Python', proficiency: 'Advanced' });

        expect(result.proficiency).toBe('Advanced');
        expect(result.id).toBe(existing.id); // preserves original id
        const saved = vi.mocked(Vault.setSecure).mock.calls[0][1] as CustomSkill[];
        expect(saved).toHaveLength(1);
    });

    it('stores known aliases under their canonical name', async () => {
        vi.mocked(Vault.getSecure).mockResolvedValue([]);

        const result = await SkillStorage.saveSkill({ name: 'Communications Skills', proficiency: 'learning' });

        expect(result.name).toBe('Communication');
    });
});

describe('SkillStorage.saveSkills — anonymous user', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getUserId).mockResolvedValue(undefined);
    });

    it('returns empty array for empty input', async () => {
        const result = await SkillStorage.saveSkills([]);
        expect(result).toEqual([]);
    });

    it('saves multiple new skills', async () => {
        vi.mocked(Vault.getSecure).mockResolvedValue([]);

        const result = await SkillStorage.saveSkills([
            { name: 'SQL', proficiency: 'Intermediate' },
            { name: 'Excel', proficiency: 'Advanced' },
        ]);

        expect(result).toHaveLength(2);
        expect(Vault.setSecure).toHaveBeenCalledOnce();
    });
});

describe('SkillStorage.deleteSkill', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getUserId).mockResolvedValue(undefined);
    });

    it('removes the skill from local storage', async () => {
        const skills = [makeSkill('Python'), makeSkill('SQL')];
        vi.mocked(Vault.getSecure).mockResolvedValue(skills);

        await SkillStorage.deleteSkill('Python');

        const saved = vi.mocked(Vault.setSecure).mock.calls[0][1] as CustomSkill[];
        expect(saved).toHaveLength(1);
        expect(saved[0].name).toBe('SQL');
    });

    it('handles deleting a skill that does not exist gracefully', async () => {
        vi.mocked(Vault.getSecure).mockResolvedValue([makeSkill('SQL')]);

        await expect(SkillStorage.deleteSkill('NonExistent')).resolves.not.toThrow();

        const saved = vi.mocked(Vault.setSecure).mock.calls[0][1] as CustomSkill[];
        expect(saved).toHaveLength(1);
    });
});
