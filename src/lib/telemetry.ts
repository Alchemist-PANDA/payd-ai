import posthog from 'posthog-js';

// Ensure this only runs on the client side
if (typeof window !== 'undefined') {
  // Use env vars for PostHog config, fallback to dummy values for local dev if not set
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_dummy_key', {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.debug();
      }
    },
    capture_pageview: false, // We'll handle this manually if needed, or rely on Next.js routing
    capture_pageleave: false
  });
}

/**
 * Identify a user in PostHog
 */
export const identifyUser = (userId: string, email: string, accountId: string, role: string) => {
  if (typeof window === 'undefined') return;

  posthog.identify(userId, {
    email,
    account_id: accountId,
    role
  });

  // Group by account for B2B tracking
  posthog.group('company', accountId, {
    name: `Account ${accountId}`, // Can be updated with real company name
    plan: 'growth' // Or fetch real plan
  });
};

/**
 * Core application events
 */
export const trackEvent = {
  // Activation events
  userSignedUp: () => {
    if (typeof window !== 'undefined') posthog.capture('user_signed_up');
  },
  csvUploaded: (rowCount: number, successCount: number) => {
    if (typeof window !== 'undefined') {
      posthog.capture('csv_uploaded', {
        row_count: rowCount,
        success_count: successCount
      });
    }
  },
  firstDraftPreviewed: () => {
    if (typeof window !== 'undefined') posthog.capture('first_draft_previewed');
  },
  accountActivated: (timeToValueMs: number) => {
    if (typeof window !== 'undefined') {
      posthog.capture('account_activated', {
        time_to_value_ms: timeToValueMs
      });
    }
  },

  // Queue & Approval events
  actionApproved: (actionType: string, invoiceId: string, isFallback: boolean) => {
    if (typeof window !== 'undefined') {
      posthog.capture('action_approved', {
        action_type: actionType,
        invoice_id: invoiceId,
        is_fallback: isFallback
      });
    }
  },
  actionEdited: (actionType: string, invoiceId: string) => {
    if (typeof window !== 'undefined') {
      posthog.capture('action_edited', {
        action_type: actionType,
        invoice_id: invoiceId
      });
    }
  },
  actionSkipped: (actionType: string, invoiceId: string, reason: string) => {
    if (typeof window !== 'undefined') {
      posthog.capture('action_skipped', {
        action_type: actionType,
        invoice_id: invoiceId,
        reason
      });
    }
  },

  // CRS & Core loop events
  replyClassified: (category: string, confidence: number, requiresHumanReview: boolean) => {
    if (typeof window !== 'undefined') {
      posthog.capture('reply_classified', {
        category,
        confidence,
        requires_human_review: requiresHumanReview
      });
    }
  },
  promiseExtracted: (hasDate: boolean, confidence: number) => {
    if (typeof window !== 'undefined') {
      posthog.capture('promise_extracted', {
        has_date: hasDate,
        confidence
      });
    }
  },
  crsUpdated: (clientId: string, oldScore: number, newScore: number, delta: number) => {
    if (typeof window !== 'undefined') {
      posthog.capture('crs_updated', {
        client_id: clientId,
        old_score: oldScore,
        new_score: newScore,
        delta
      });
    }
  },
  brokenPromiseDetected: (clientId: string, invoiceAmountCents: number) => {
    if (typeof window !== 'undefined') {
      posthog.capture('broken_promise_detected', {
        client_id: clientId,
        invoice_amount_cents: invoiceAmountCents
      });
    }
  }
};

export default trackEvent;
