
import { supabase } from './supabase';

export interface UsageOutlier {
    user_id: string;
    total_input_tokens: number;
    total_output_tokens: number;
    total_operations: number;
    last_active: string;
}

export const getUsageOutliers = async (): Promise<UsageOutlier[]> => {
    const { data, error } = await supabase
        .from('usage_outliers')
        .select('*')
        .order('total_output_tokens', { ascending: false });

    if (error) {
        console.error('Error fetching usage outliers:', error);
        throw error;
    }

    return data || [];
};
