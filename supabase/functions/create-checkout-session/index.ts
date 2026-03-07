import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno"

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Create Checkout Session function up and running!")


serve(async (req) => {

    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    let priceId = '';
    try {
        const body = await req.json()
        priceId = body.priceId
        const { returnUrl } = body

        // 1. Authorization
        const authHeader = req.headers.get('Authorization')

        if (!authHeader) {
            console.error("[Function] Missing Authorization header")
            throw new Error('Missing Authorization header')
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            console.error("[Function] Auth error or no user:", authError)
            throw new Error('Unauthorized')
        }


        // 2. Get user profile for email/customer ID
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('stripe_customer_id, email')
            .eq('id', user.id)
            .maybeSingle()

        if (profileError) {
            console.error("Profile fetch error (non-fatal):", profileError)
        }

        let customerId = profile?.stripe_customer_id

        // 3. Create Customer if not exists
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    supabase_uid: user.id
                }
            })
            customerId = customer.id

            // Save customer ID to profile (optional, webhook will also do it but good for immediate consistency)
            // Note: This requires the user to have permission to update this field or use service role.
            // For now, we rely on webhook or assume user can update their own row if policies allow, 
            // but 'stripe_customer_id' might be protected. 
            // Safest is to let the webhook handle the syncing or use service role here if needed.
        }

        // 4. Create Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            ui_mode: 'hosted',
            allow_promotion_codes: true,
            success_url: returnUrl || `${req.headers.get('origin')}/plans?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/plans?canceled=true`,
            metadata: {
                supabase_uid: user.id
            }
        })

        return new Response(
            JSON.stringify({ url: session.url }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )


    } catch (error: any) {
        console.error("Function error:", error)
        const message = error.message || String(error)
        const details = error.raw?.message || error.type || "unknown_error"

        return new Response(JSON.stringify({
            error: "Checkout failed",
            message: "We encountered an issue creating your checkout session. Please try again or contact support."
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})


