
import { supabase } from './supabase';

export interface UsageOutlier {
    user_id: string;
    email: string;
    subscription_tier: string;
    total_input_tokens: number;
    total_output_tokens: number;
    total_operations: number;
    last_active: string;
    tier_average: number;
    x_times_normal: number;
}

export const getUsageOutliers = async (): Promise<UsageOutlier[]> => {
    const { data, error } = await supabase
        .from('usage_outliers')
        .select('*');

    if (error) {
        console.error('Error fetching usage outliers:', error);
        throw error;
    }

    return data || [];
};

export interface AdminUser {
    id: string;
    email: string;
    subscription_tier: string;
    is_admin: boolean;
    is_tester: boolean;
    total_ai_calls: number;
    job_analyses_count: number;
    created_at: string;
}

export const getAdminUsers = async (): Promise<AdminUser[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, subscription_tier, is_admin, is_tester, total_ai_calls, job_analyses_count, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching admin users:', error);
        throw error;
    }

    return data || [];
};

export interface DailyPulse {
    date: string;
    count: number;
}

export const getDailyPulse = async (): Promise<DailyPulse[]> => {
    // Attempt to get logs count grouped by day for the last 28 days
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);
    
    try {
        const { data: logData, error: logError } = await supabase
            .from('logs')
            .select('created_at')
            .gte('created_at', twentyEightDaysAgo.toISOString());

        if (logError) throw logError;

        const counts: Record<string, number> = {};
        logData?.forEach(log => {
            const date = log.created_at.split('T')[0];
            counts[date] = (counts[date] || 0) + 1;
        });

        const result = Object.entries(counts)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
            
        return result;
    } catch (err) {
        console.error('Error fetching daily pulse:', err);
        return [];
    }
};
