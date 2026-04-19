import { supabase } from './supabase/client';

/**
 * LIGHTWEIGHT BETA INSTRUMENTATION
 * Captures session-level UI events for controlled beta sessions.
 */

const SESSION_STORAGE_KEY = 'payd_beta_session_id';

/**
 * Gets or creates a stable session ID for the current browser session.
 * Uses sessionStorage to persist across refreshes but clear on tab close.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server-side';

  let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Tracks a UI event to the audit_log table.
 */
export async function trackEvent(
  accountId: string,
  action: string,
  metadata: Record<string, any> = {}
) {
  const sessionId = getOrCreateSessionId();

  const { error } = await supabase
    .from('audit_log')
    .insert({
      account_id: accountId,
      action,
      entity_type: 'ui_session',
      entity_id: '00000000-0000-0000-0000-000000000000', // Nil UUID for session-level events
      metadata: {
        ...metadata,
        session_id: sessionId,
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      }
    });

  if (error) {
    console.error(`[Telemetry] Failed to track ${action}:`, error);
  }
}
