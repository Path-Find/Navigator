import { dataClient } from '../lib/data-client';
import { withTimeout } from '../utils/promiseUtils';

export interface WaitlistEntry {
    email: string;
    source?: string;
    metadata?: any;
}

export const WaitlistService = {
    async joinWaitlist(email: string, source: string = 'auth_modal'): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await withTimeout(
                dataClient
                    .from('waitlist')
                    .insert({
                        email: email.toLowerCase().trim(),
                        source,
                        created_at: new Date().toISOString()
                    })
            );

            if (error) {
                // If it's a conflict (already on list), we treat as success but different UI if needed
                if (error.code === '23505') {
                    return { success: true };
                }
                console.error('Waitlist error:', error);
                throw error;
            }

            return { success: true };
        } catch (err: any) {
            console.error('Failed to join waitlist:', err);
            return {
                success: false,
                error: err.message || 'Failed to join waitlist. Please try again.'
            };
        }
    }
};
