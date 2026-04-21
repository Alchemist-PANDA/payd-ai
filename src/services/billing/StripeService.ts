import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Stripe Billing Service
 * Phase 4: Stripe integration for $249 Growth and $549 Agency Pro tiers
 * No $49 tier per masterplan requirements
 */

export interface PricingTier {
  id: string;
  name: string;
  price_cents: number;
  stripe_price_id: string;
  features: string[];
  limits: {
    active_clients?: number;
    invoices_per_month?: number;
    user_seats: number;
    integrations: string[];
  };
}

export const PRICING_TIERS: Record<string, PricingTier> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price_cents: 9900, // $99/mo
    stripe_price_id: process.env.STRIPE_PRICE_STARTER || 'price_starter',
    features: [
      '30 active invoices',
      '1 user seat',
      'CSV import only',
      'All AI features',
      'Action Queue',
      'Client Reliability Scores'
    ],
    limits: {
      active_clients: 30,
      invoices_per_month: 50,
      user_seats: 1,
      integrations: ['csv']
    }
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    price_cents: 24900, // $249/mo
    stripe_price_id: process.env.STRIPE_PRICE_GROWTH || 'price_growth',
    features: [
      'Unlimited active invoices',
      '3 user seats',
      'Xero + QuickBooks sync',
      'Multi-contact per invoice',
      'All AI features + full email drafting',
      'Client Reliability Score + Promise Timeline',
      'Broken Promise Escalation alerts',
      'Priority support'
    ],
    limits: {
      user_seats: 3,
      integrations: ['csv', 'xero', 'quickbooks']
    }
  },
  agency_pro: {
    id: 'agency_pro',
    name: 'Agency Pro',
    price_cents: 54900, // $549/mo
    stripe_price_id: process.env.STRIPE_PRICE_AGENCY_PRO || 'price_agency_pro',
    features: [
      'Unlimited invoices, unlimited clients',
      '10 user seats',
      'All integrations + API access',
      'White-label email branding per client',
      'Quarterly CRS Reports per client',
      'Sequence customization per client',
      'Dedicated onboarding call',
      'SSO support'
    ],
    limits: {
      user_seats: 10,
      integrations: ['csv', 'xero', 'quickbooks', 'api']
    }
  }
};

export class StripeService {
  /**
   * Create a Stripe customer for a new account
   */
  static async createCustomer(email: string, accountName: string, accountId: string): Promise<string> {
    const customer = await stripe.customers.create({
      email,
      name: accountName,
      metadata: {
        account_id: accountId
      }
    });

    return customer.id;
  }

  /**
   * Create a checkout session for subscription
   */
  static async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    return session.url || '';
  }

  /**
   * Create a billing portal session for managing subscription
   */
  static async createPortalSession(customerId: string, returnUrl: string): Promise<string> {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl
    });

    return session.url;
  }

  /**
   * Get subscription details
   */
  static async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      return null;
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.cancel(subscriptionId);
  }

  /**
   * Update subscription (change plan)
   */
  static async updateSubscription(
    subscriptionId: string,
    newPriceId: string
  ): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId
        }
      ],
      proration_behavior: 'create_prorations'
    });
  }

  /**
   * Verify webhook signature
   */
  static constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
