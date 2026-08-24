import { dataClient } from '../lib/data-client';
import type { UserTier } from '../types/app';
import { PLAN_LIMITS } from '../constants';

type PlanLimitValues = {
    DAILY_EMAILS: number;
    WEEKLY_ANALYSES?: number;
    DAILY_ANALYSES?: number;
    TOTAL_ANALYSES?: number;
    ANALYSES_PERIOD?: string;
    ROLE_MODELS?: number;
    SKILLS_INTERVIEWS?: number;
};

export interface UsageLimitResult {
    allowed: boolean;
    reason?: 'free_limit_reached' | 'daily_limit_reached' | 'weekly_limit_reached' | 'rate_limit';
    used?: number;
    limit?: number;
}

export interface UsageStats {
    tier: UserTier;
    todayAnalyses: number;
    weekAnalyses: number;
    todayEmails: number;
    monthInterviews: number;
    roleModelCount: number;
    totalAICalls: number;
    lifetimeAnalyses: number;
    analysisLimit: number;
    analysisPeriod: string;
    emailLimit: number;
    roleModelLimit: number;
    interviewLimit: number;
    inboundEmailToken?: string;
    isFallback: boolean;
}

/**
 * Check if user can create a new job analysis
 */
export const checkAnalysisLimit = async (userId: string): Promise<UsageLimitResult> => {
    try {
        const { data, error } = await dataClient.rpc('check_analysis_limit', {
            p_user_id: userId
        });

        if (error) {
            console.error('Error checking usage limit:', error);
            return { allowed: true }; // Fail open - don't block users on error
        }

        return data as UsageLimitResult;
    } catch (err) {
        console.error('Exception checking usage limit:', err);
        return { allowed: true }; // Fail open
    }
};

/**
 * Increment the analysis count after successful job creation
 */
export const incrementAnalysisCount = async (userId: string): Promise<void> => {
    try {
        const { error } = await dataClient.rpc('increment_analysis_count', {
            p_user_id: userId
        });

        if (error) {
            console.error('Error incrementing analysis count:', error);
        }
    } catch (err) {
        console.error('Exception incrementing analysis count:', err);
    }
};

/**
 * Check if user can start a new interview
 */
export const checkInterviewLimit = async (userId: string): Promise<UsageLimitResult> => {
    try {
        const stats = await getUsageStats(userId);
        if (stats.tier === 'admin' || stats.tier === 'tester') return { allowed: true };

        if (stats.monthInterviews >= stats.interviewLimit) {
            return {
                allowed: false,
                reason: 'rate_limit',
                used: stats.monthInterviews,
                limit: stats.interviewLimit
            };
        }
        return { allowed: true };
    } catch (err) {
        console.error('Exception checking interview limit:', err);
        return { allowed: true };
    }
};

/**
 * Check if user can add a new role model
 */
export const checkRoleModelLimit = async (userId: string): Promise<UsageLimitResult> => {
    try {
        const stats = await getUsageStats(userId);
        if (stats.tier === 'admin' || stats.tier === 'tester') return { allowed: true };

        if (stats.roleModelCount >= stats.roleModelLimit) {
            return {
                allowed: false,
                reason: 'free_limit_reached',
                used: stats.roleModelCount,
                limit: stats.roleModelLimit
            };
        }
        return { allowed: true };
    } catch (err) {
        console.error('Exception checking role model limit:', err);
        return { allowed: true };
    }
};

/**
 * Get current usage statistics for display
 */
export const getUsageStats = async (userId: string): Promise<UsageStats> => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const firstOfMonth = new Date();
        firstOfMonth.setDate(1);
        firstOfMonth.setHours(0, 0, 0, 0);

        const results = await Promise.allSettled([
            // Attempt to fetch all profile columns, but handle potential missing columns gracefully
            (async () => {
                const { data, error } = await dataClient
                    .from('profiles')
                    .select('subscription_tier, is_admin, is_tester, job_analyses_count, total_ai_calls, inbound_email_token')
                    .eq('id', userId)
                    .single();

                // PGRST116 = no row found (e.g. a brand new user with no profile row yet) — expected, not an error.
                if (error && error.code !== 'PGRST116') {
                    console.error(`Error fetching profile for user ${userId}:`, error);
                    throw error;
                }
                return { data, error: null };
            })(),
            // Analysis usage is kept separately from saved jobs so deleting a
            // job cannot erase usage history or make quotas appear unused.
            (async () => dataClient
                .from('logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('event_type', 'job_extraction')
                .eq('status', 'success')
                .gte('created_at', today))(),
            (async () => dataClient
                .from('logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('event_type', 'job_extraction')
                .eq('status', 'success')
                .gte('created_at', weekAgo.toISOString()))(),
            // Monthly interview count: count the START of sessions, not individual analyses
            (async () => dataClient
                .from('logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .in('event_type', ['interview_generation', 'interview_generation_general', 'profile_interview_summary', 'resume_interview_generation', 'unified_skill_interview_generation', 'skill_interview_generation'])
                .gte('created_at', firstOfMonth.toISOString()))(),
            (async () => dataClient
                .from('role_models')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId))(),
            (async () => dataClient
                .from('jobs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('source_type', 'email')
                .gte('date_added', today))(),
        ]);

        const getData = <T>(result: PromiseSettledResult<{ data: T }>) =>
            result.status === 'fulfilled' ? result.value.data : null;

        const getCount = (result: PromiseSettledResult<{ count: number | null }>) =>
            result.status === 'fulfilled' ? result.value.count : 0;

        const profileResult = results[0] as PromiseSettledResult<{
            data: {
                subscription_tier?: string;
                is_admin?: boolean;
                is_tester?: boolean;
                job_analyses_count?: number;
                total_ai_calls?: number;
                inbound_email_token?: string;
            }
        }>;
        const todayCountResult = results[1] as PromiseSettledResult<{ count: number | null }>;
        const weekCountResult = results[2] as PromiseSettledResult<{ count: number | null }>;
        const monthInterviewCountResult = results[3] as PromiseSettledResult<{ count: number | null }>;
        const roleModelCountResult = results[4] as PromiseSettledResult<{ count: number | null }>;
        const todayEmailCountResult = results[5] as PromiseSettledResult<{ count: number | null }>;

        // If even the profile fetch failed or was rejected, we should treat this as a fallback scenario
        if (profileResult.status === 'rejected' || !getData(profileResult)) {
            console.warn('Profile fetch failed, using fallback usage stats');
            return {
                tier: 'free' as UserTier,
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
            };
        }

        const profile = getData(profileResult);
        const todayCount = getCount(todayCountResult);
        const weekCount = getCount(weekCountResult);
        const monthInterviewCount = getCount(monthInterviewCountResult);
        const roleModelCount = getCount(roleModelCountResult);
        const todayEmailCount = getCount(todayEmailCountResult);

        let tier = profile?.subscription_tier || 'free';
        if (profile?.is_admin) tier = 'admin';
        else if (profile?.is_tester) tier = 'tester';

        const totalAICalls = profile?.total_ai_calls || 0;

        const limits = (PLAN_LIMITS[tier as keyof typeof PLAN_LIMITS] || PLAN_LIMITS['free']) as PlanLimitValues;

        const analysisLimit = limits.WEEKLY_ANALYSES ?? limits.DAILY_ANALYSES ?? limits.TOTAL_ANALYSES ?? 0;

        return {
            tier: tier as UserTier,
            todayAnalyses: todayCount || 0,
            weekAnalyses: weekCount || 0,
            lifetimeAnalyses: profile?.job_analyses_count || 0,
            todayEmails: todayEmailCount || 0,
            monthInterviews: monthInterviewCount || 0,
            roleModelCount: roleModelCount || 0,
            totalAICalls,
            analysisLimit,
            analysisPeriod: limits.ANALYSES_PERIOD || 'weekly',
            emailLimit: limits.DAILY_EMAILS,
            roleModelLimit: limits.ROLE_MODELS ?? 0,
            interviewLimit: limits.SKILLS_INTERVIEWS ?? 0,
            inboundEmailToken: tier === 'free' ? undefined : profile?.inbound_email_token,
            isFallback: false
        };
    } catch (err) {
        console.error('Error fetching usage stats:', err);
        return {
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
        };
    }
};
