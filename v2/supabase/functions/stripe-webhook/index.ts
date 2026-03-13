import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

console.log("Stripe Webhook function up and running!")

serve(async (req) => {
    const signature = req.headers.get('Stripe-Signature')

    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    try {
        const body = await req.text()
        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            endpointSecret ?? ''
        )

        console.log(`Event Type: ${event.type}`)

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const supabaseUid = session.metadata?.supabase_uid
                const customerId = session.customer as string
                const subscriptionId = session.subscription as string

                if (supabaseUid) {
                    // Retrieve subscription details to get the product/tier
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const priceId = subscription.items.data[0].price.id;

                    // Map price IDs to tiers (matching src/constants.ts)
                    let tier = 'pro'; // Default to pro if unknown paid price
                    const plusPrices = ['price_1T2KjOCgQ7xClTHZxDaMextv', 'price_1T2KlyCgQ7xClTHZrBT9Ah6'];
                    const proPrices = ['price_1T2KkOCgQ7xClTHZF9S1f1ro', 'price_1T2KmJCgQ7xClTHZnYHfcQQF'];

                    if (plusPrices.includes(priceId)) {
                        tier = 'plus';
                    } else if (proPrices.includes(priceId)) {
                        tier = 'pro';
                    }

                    await supabase
                        .from('profiles')
                        .update({
                            stripe_customer_id: customerId,
                            stripe_subscription_id: subscriptionId,
                            subscription_tier: tier
                        })
                        .eq('id', supabaseUid)
                }
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                // Find user by stripe_customer_id
                // Update status, period, etc.
                // If canceled, downgrade to free?
                if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
                    const { error } = await supabase
                        .from('profiles')
                        .update({ subscription_tier: 'free' })
                        .eq('stripe_customer_id', customerId)
                    if (error) console.error(error)
                } else {
                    // Maybe they upgraded/downgraded tiers?
                    // Should check the product/price again.
                }
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                await supabase
                    .from('profiles')
                    .update({ subscription_tier: 'free' })
                    .eq('stripe_customer_id', customerId)
                break
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`)
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }
})
