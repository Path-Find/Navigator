import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobStorage } from './jobStorage';
import { Vault, getUserId } from './storageCore';
import { STORAGE_KEYS } from '../../constants';
import type { SavedJob } from '../../types';

vi.mock('./storageCore', () => ({
    Vault: {
        getSecure: vi.fn(),
        setSecure: vi.fn()
    },
    getUserId: vi.fn()
}));

vi.mock('../supabase', () => {
    const mockQueryBuilder: any = {
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        select: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(),
        then: vi.fn()
    };

    // Make mockQueryBuilder methods chainable by default
    mockQueryBuilder.insert.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.update.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.delete.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.select.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.order.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.then.mockImplementation((callback: any) =>
        Promise.resolve(callback({ data: [], error: null }))
    );

    return {
        supabase: {
            from: vi.fn(() => mockQueryBuilder),
            auth: {
                getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null }))
            }
        }
    };
});

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

const createMockJob = (id: string, status: SavedJob['status'] = 'saved'): SavedJob => ({
    id,
    position: 'Developer',
    company: 'Tech',
    status,
    dateAdded: Date.now(),
    description: 'A test job description',
    resumeId: 'resume-1'
});

describe('JobStorage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should add a job to local storage', async () => {
        const mockJob = createMockJob(VALID_UUID);
        vi.mocked(Vault.getSecure).mockResolvedValue([]);
        vi.mocked(getUserId).mockResolvedValue('test-user');

        await JobStorage.addJob(mockJob);

        expect(Vault.setSecure).toHaveBeenCalledWith(STORAGE_KEYS.JOBS_HISTORY, [mockJob]);
    });

    it('should update a job in local storage', async () => {
        const oldJob = createMockJob(VALID_UUID);
        const updatedJob: SavedJob = { ...oldJob, status: 'applied' };
        vi.mocked(Vault.getSecure).mockResolvedValue([oldJob]);
        vi.mocked(getUserId).mockResolvedValue('test-user');

        await JobStorage.updateJob(updatedJob);

        expect(Vault.setSecure).toHaveBeenCalledWith(STORAGE_KEYS.JOBS_HISTORY, [updatedJob]);
    });

    it('should delete a job from local storage', async () => {
        const mockJob = createMockJob(VALID_UUID);
        vi.mocked(Vault.getSecure).mockResolvedValue([mockJob]);
        vi.mocked(getUserId).mockResolvedValue('test-user');

        await JobStorage.deleteJob(VALID_UUID);

        expect(Vault.setSecure).toHaveBeenCalledWith(STORAGE_KEYS.JOBS_HISTORY, []);
    });
});
