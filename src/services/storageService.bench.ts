import { describe, bench, vi, beforeEach } from 'vitest';
import { Storage } from './storageService';
import { supabase } from './supabase';
import { Vault } from './storage/storageCore';
import { STORAGE_KEYS } from '../constants';

vi.mock('./supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    limit: vi.fn(() => ({
                        maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'resume1' } })
                    })),
                    mockResolvedValue: { data: [] }
                }))
            })),
            insert: vi.fn().mockResolvedValue({ error: null }),
            upsert: vi.fn(() => ({ select: vi.fn().mockResolvedValue({ data: [], error: null }) }))
        })),
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'user1' } } } })
        }
    }
}));

vi.mock('./storage/storageCore', () => ({
    Vault: {
        getSecure: vi.fn(),
        setSecure: vi.fn()
    },
    getUserId: vi.fn().mockResolvedValue('user1')
}));

const mockJobs = Array.from({ length: 50 }).map((_, i) => ({
    id: `job${i}`,
    position: `Role ${i}`,
    company: `Company ${i}`,
    dateAdded: Date.now()
}));

const mockSkills = Array.from({ length: 50 }).map((_, i) => ({
    name: `Skill ${i}`,
    proficiency: 'Intermediate',
    evidence: 'Evidence'
}));

const mockRoleModels = Array.from({ length: 50 }).map((_, i) => ({
    id: `rm${i}`,
    name: `Model ${i}`
}));

const mockTargetJobs = Array.from({ length: 50 }).map((_, i) => ({
    id: `tj${i}`,
    title: `Target ${i}`,
    dateAdded: Date.now()
}));

describe('Storage syncLocalToCloud Benchmark', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock Vault to return lots of items
        vi.mocked(Vault.getSecure).mockImplementation(async (key) => {
            if (key === STORAGE_KEYS.JOBS_HISTORY) return mockJobs;
            if (key === STORAGE_KEYS.SKILLS) return mockSkills;
            if (key === STORAGE_KEYS.ROLE_MODELS) return mockRoleModels;
            if (key === STORAGE_KEYS.TARGET_JOBS) return mockTargetJobs;
            return [];
        });

        const mockEq = vi.fn().mockResolvedValue({ data: [] });
        mockEq.mockImplementation((field, val) => {
            if (field === 'user_id') return Promise.resolve({ data: [] }); // return empty cloud list
            return { limit: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'resume1' } }) })) };
        });

        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

        vi.mocked(supabase.from).mockReturnValue({
            select: mockSelect,
            insert: vi.fn().mockResolvedValue({ error: null }),
            upsert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: {}, error: null }) }) })
        } as any);
    });

    bench('syncLocalToCloud with many local items', async () => {
        await Storage.syncLocalToCloud();
    }, { iterations: 10 });
});
