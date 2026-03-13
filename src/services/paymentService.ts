import { supabase } from './supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';

export const paymentService = {
    async createCheckoutSession(priceId: string, returnUrl?: string): Promise<{ url: string }> {
        // Use getUser() to force a server-side token validation & refresh
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        // TEMP: Kill switch for new checkouts
        throw new Error("Navigator is currently invite-only. Please join the waitlist in your account settings or on the plans page.");

        // Get fresh session with valid access token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: { priceId, returnUrl }
        });


        if (error) {
            console.error('[PaymentService] Edge function error:', error);

            // Extract detailed error from FunctionsHttpError response body
            if (error instanceof FunctionsHttpError) {
                try {
                    const errorBody = await error.context.json();
                    console.error('[PaymentService] Error body:', errorBody);
                    const message = errorBody?.details || errorBody?.error || errorBody?.message || errorBody?.msg || error.message;
                    throw new Error(message);
                } catch {
                    // If we can't parse the body, we just fall through to the default error
                }
            }

            throw new Error(error.message || 'Checkout failed');
        }



        if (!data?.url) {
            throw new Error('No checkout URL returned from server');
        }

        return data;
    },


    async getPortalUrl(returnUrl?: string): Promise<string> {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase.functions.invoke('create-portal-session', {
            body: { returnUrl }
        });

        if (error) {
            console.error('[PaymentService] Portal session error:', error);

            if (error instanceof FunctionsHttpError) {
                try {
                    const errorBody = await error.context.json();
                    const message = errorBody?.message || errorBody?.error || error.message;
                    throw new Error(message);
                } catch {
                    // fall through
                }
            }

            throw new Error(error.message || 'Failed to open billing portal');
        }

        if (!data?.url) {
            throw new Error('No portal URL returned from server');
        }

        return data.url;
    }
};
