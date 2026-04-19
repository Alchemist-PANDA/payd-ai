import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * CORE AUTH & TENANCY ADAPTER
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }
  return session;
}

export async function getCurrentAccount() {
  const session = await getCurrentSession();

  if (!session || !session.user) {
    return null; // Null session states handled
  }

  // Query memberships for the authenticated user
  const { data: memberships, error } = await supabase
    .from('memberships')
    .select('account_id, role, accounts(name)')
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error fetching membership:', error);
    return null;
  }

  if (!memberships || memberships.length === 0) {
    console.warn('User has no memberships.');
    return null; // Edge case: authenticated but no membership
  }

  // TEMPORARY CONSTRAINT: single-account membership only.
  if (memberships.length > 1) {
    throw new Error('Multiple memberships detected. Multi-account switching is not implemented yet.');
  }

  const membership = memberships[0];
  const accountName = membership.accounts
    ? (Array.isArray(membership.accounts) ? membership.accounts[0]?.name : (membership.accounts as any).name)
    : 'Unknown Account';

  return {
    id: membership.account_id,
    name: accountName,
    role: membership.role
  };
}
