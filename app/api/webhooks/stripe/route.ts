import { NextResponse } from 'next/server';
import { StripeService } from '../../../../../src/services/billing/StripeService';
import { supabase } from '../../../../../src/lib/supabase/client';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return new NextResponse('Missing signature or webhook secret', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = StripeService.constructWebhookEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Error verifying signature: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Ensure customer and subscription exist
        if (!session.customer || !session.subscription) {
          console.warn('[Stripe Webhook] Missing customer or subscription in session');
          break;
        }

        // Get account_id from customer metadata or session client_reference_id
        // Usually we set account_id in the customer metadata during creation
        const customer = await StripeService.getSubscription(session.subscription as string);
        // We'll need to fetch the customer object to get the metadata if not available
        // For now, let's assume we can query by stripe_customer_id

        // Update account in DB
        const { error } = await supabase
          .from('accounts')
          .update({
            metadata: {
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              plan: 'growth', // We should map this from the price ID
              payment_status: 'active'
            },
            updated_at: new Date().toISOString()
          })
          .eq('metadata->>stripe_customer_id', session.customer); // Ensure this matches how we query

        if (error) {
          console.error('[Stripe Webhook] Error updating account subscription:', error);
        } else {
          console.log(`[Stripe Webhook] Subscription completed for customer ${session.customer}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        if (!invoice.customer) break;

        const { error } = await supabase
          .from('accounts')
          .update({
            metadata: {
              payment_status: 'failed',
              payment_failed_at: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
          .eq('metadata->>stripe_customer_id', invoice.customer);

        if (error) {
          console.error('[Stripe Webhook] Error marking payment failed:', error);
        } else {
          console.log(`[Stripe Webhook] Payment failed for customer ${invoice.customer}`);
          // Send notification to user here (via email or in-app alert)
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const { error } = await supabase
          .from('accounts')
          .update({
            metadata: {
              stripe_subscription_id: null,
              plan: 'cancelled',
              payment_status: 'cancelled',
              cancelled_at: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
          .eq('metadata->>stripe_subscription_id', subscription.id);

        if (error) {
          console.error('[Stripe Webhook] Error cancelling subscription:', error);
        } else {
          console.log(`[Stripe Webhook] Subscription deleted ${subscription.id}`);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`[Stripe Webhook] Handler error: ${error.message}`);
    return new NextResponse('Webhook Handler Error', { status: 500 });
  }
}
