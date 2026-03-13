import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno"

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const ALLOWED_ORIGINS = [
    Deno.env.get('SITE_URL') ?? '',
    'http://localhost:5173',
    'http://localhost:4173',
].filter(Boolean);

const getCorsHeaders = (req: Request) => {
    const origin = req.headers.get('Origin') ?? '';
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : '';
    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
};

console.log("Create Portal Session function up and running!")

serve(async (req) => {

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: getCorsHeaders(req) })
    }

    try {
        const body = await req.json()
        const { returnUrl } = body

        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing Authorization header')
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            throw new Error('Unauthorized')
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .maybeSingle()

        if (profileError) {
            console.error("Profile fetch error:", profileError)
        }

        if (!profile?.stripe_customer_id) {
            throw new Error('No billing account found for this user')
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: returnUrl || `${req.headers.get('origin')}/settings`,
        })

        return new Response(
            JSON.stringify({ url: session.url }),
            {
                headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error: any) {
        console.error("Function error:", error)
        return new Response(JSON.stringify({
            error: "Portal session failed",
            message: error.message || "We encountered an issue opening the billing portal. Please try again or contact support."
        }), {
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
