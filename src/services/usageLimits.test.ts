import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAnalysisLimit, getUsageStats, incrementAnalysisCount } from './usageLimits';
import { supabase } from './supabase';

vi.mock('./supabase', () => ({
    supabase: {
        rpc: vi.fn(),
        from: vi.fn(),
    },
}));

describe('checkAnalysisLimit', () => {
    const userId = 'user-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return allowed=true when usage limit is not reached', async () => {
        vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: { allowed: true }, error: null } as any);

        const result = await checkAnalysisLimit(userId);

        expect(result).toEqual({ allowed: true });
        expect(supabase.rpc).toHaveBeenCalledWith('check_analysis_limit', { p_user_id: userId });
    });

    it('should return denial reason when usage limit is reached', async () => {
        const deniedResponse = { allowed: false, reason: 'daily_limit_reached' };
        vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: deniedResponse, error: null } as any);

        const result = await checkAnalysisLimit(userId);

        expect(result).toEqual(deniedResponse);
    });

    it('should fail open (allow=true) when Supabase returns an error', async () => {
        const error = { message: 'Database error' };
        vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: null, error } as any);

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const result = await checkAnalysisLimit(userId);

        expect(result).toEqual({ allowed: true });
        expect(consoleSpy).toHaveBeenCalledWith('Error checking usage limit:', error);

        consoleSpy.mockRestore();
    });

    it('should fail open (allow=true) when an exception occurs', async () => {
        const error = new Error('Network failure');
        vi.mocked(supabase.rpc).mockRejectedValueOnce(error);

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const result = await checkAnalysisLimit(userId);

        expect(result).toEqual({ allowed: true });
        expect(consoleSpy).toHaveBeenCalledWith('Exception checking usage limit:', error);

        consoleSpy.mockRestore();
    });
});

describe('incrementAnalysisCount', () => {
    const userId = 'user-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call rpc with correct arguments', async () => {
        vi.mocked(supabase.rpc).mockResolvedValueOnce({ error: null } as any);

        await incrementAnalysisCount(userId);

        expect(supabase.rpc).toHaveBeenCalledWith('increment_analysis_count', { p_user_id: userId });
    });

    it('should log error when Supabase returns error', async () => {
        const error = { message: 'Database error' };
        vi.mocked(supabase.rpc).mockResolvedValueOnce({ error } as any);

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        await incrementAnalysisCount(userId);

        expect(consoleSpy).toHaveBeenCalledWith('Error incrementing analysis count:', error);

        consoleSpy.mockRestore();
    });

    it('should log exception when rpc throws', async () => {
        const error = new Error('Network failure');
        vi.mocked(supabase.rpc).mockRejectedValueOnce(error);

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        await incrementAnalysisCount(userId);

        expect(consoleSpy).toHaveBeenCalledWith('Exception incrementing analysis count:', error);

        consoleSpy.mockRestore();
    });
});

describe('getUsageStats', () => {
    const userId = 'user-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return usage stats correctly for pro tier', async () => {
        // Mock chain for profiles query
        const mockSingle = vi.fn().mockResolvedValue({
            data: {
                subscription_tier: 'pro',
                is_admin: false,
                is_tester: false,
                job_analyses_count: 50,
                total_ai_calls: 100,
                inbound_email_token: 'token-123'
            }
        });
        const mockSelectProfile = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockSingle }) });

        // Mock chain for jobs query (count) using recursive approach
        const mockGte = vi.fn().mockResolvedValue({ count: 5 });
        const jobsChain = {
            eq: vi.fn(),
            gte: mockGte
        };
        // Make eq return the chain itself to support multiple .eq().eq()
        jobsChain.eq.mockReturnValue(jobsChain);

        const mockSelectJobs = vi.fn().mockReturnValue({ eq: jobsChain.eq });

        vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'profiles') return { select: mockSelectProfile } as any;
            if (table === 'jobs') return { select: mockSelectJobs } as any;
            const defaultChain = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), in: vi.fn().mockReturnThis(), gte: vi.fn().mockResolvedValue({ count: 0 }) };
            return defaultChain as any;
        });

        const result = await getUsageStats(userId);

        expect(result).toEqual({
            tier: 'pro',
            todayAnalyses: 5,
            weekAnalyses: 5,
            todayEmails: 5,
            monthInterviews: 0,
            roleModelCount: 0,
            totalAICalls: 100,
            lifetimeAnalyses: 50,
            analysisLimit: 100,
            analysisPeriod: 'daily',
            emailLimit: 25,
            roleModelLimit: 25,
            interviewLimit: 5,
            inboundEmailToken: 'token-123',
            isFallback: false
        });
    });

    it('should return admin tier and unlimited limit for admin users', async () => {
        const mockSingle = vi.fn().mockResolvedValue({
            data: {
                subscription_tier: 'free',
                is_admin: true,
                is_tester: false,
                job_analyses_count: 5,
                total_ai_calls: 10,
                inbound_email_token: 'admin-token'
            }
        });
        const mockSelectProfile = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockSingle }) });

        const mockGte = vi.fn().mockResolvedValue({ count: 0 });
        const jobsChain = {
            eq: vi.fn(),
            gte: mockGte
        };
        jobsChain.eq.mockReturnValue(jobsChain);

        const mockSelectJobs = vi.fn().mockReturnValue({ eq: jobsChain.eq });

        vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'profiles') return { select: mockSelectProfile } as any;
            if (table === 'jobs') return { select: mockSelectJobs } as any;
            const defaultChain = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), in: vi.fn().mockReturnThis(), gte: vi.fn().mockResolvedValue({ count: 0 }) };
            return defaultChain as any;
        });

        const result = await getUsageStats(userId);

        expect(result.tier).toBe('admin');
        expect(result.analysisLimit).toBe(Infinity);
        expect(result.emailLimit).toBe(100);
    });

    it('should return tester tier and unlimited limit for tester users', async () => {
        const mockSingle = vi.fn().mockResolvedValue({
            data: {
                subscription_tier: 'free',
                is_admin: false,
                is_tester: true,
                job_analyses_count: 5,
                total_ai_calls: 10,
                inbound_email_token: 'tester-token'
            }
        });
        const mockSelectProfile = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockSingle }) });

        const mockGte = vi.fn().mockResolvedValue({ count: 0 });
        const jobsChain = {
            eq: vi.fn(),
            gte: mockGte
        };
        jobsChain.eq.mockReturnValue(jobsChain);

        const mockSelectJobs = vi.fn().mockReturnValue({ eq: jobsChain.eq });

        vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'profiles') return { select: mockSelectProfile } as any;
            if (table === 'jobs') return { select: mockSelectJobs } as any;
            const defaultChain = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), in: vi.fn().mockReturnThis(), gte: vi.fn().mockResolvedValue({ count: 0 }) };
            return defaultChain as any;
        });

        const result = await getUsageStats(userId);

        expect(result.tier).toBe('tester');
        expect(result.analysisLimit).toBe(Infinity);
        expect(result.emailLimit).toBe(100);
    });

    it('should return default stats on error', async () => {
        vi.mocked(supabase.from).mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            single: vi.fn().mockRejectedValue(new Error('DB Error'))
        } as any);

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        const result = await getUsageStats(userId);

        expect(result).toEqual({
            tier: 'free',
            todayAnalyses: 0,
            weekAnalyses: 0,
            todayEmails: 0,
            monthInterviews: 0,
            roleModelCount: 0,
            totalAICalls: 0,
            lifetimeAnalyses: 0,
            analysisLimit: 3,
            analysisPeriod: 'lifetime',
            emailLimit: 0,
            roleModelLimit: 0,
            interviewLimit: 0,
            inboundEmailToken: undefined,
            isFallback: true
        });
        expect(consoleSpy).toHaveBeenCalledWith('Profile fetch failed, using fallback usage stats');

        consoleSpy.mockRestore();
    });
});
