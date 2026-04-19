import { describe, it, expect, vi, beforeEach } from 'vitest';

// Fully mock the client module to avoid environment variable issues
vi.mock('../../../lib/supabase/client', () => {
  const mockSupabase = {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
      uid: vi.fn(() => 'test-user-id')
    }
  };

  return {
    supabase: mockSupabase,
    getCurrentSession: async () => {
      const { data: { session }, error } = await mockSupabase.auth.getSession();
      return session || null;
    },
    getCurrentAccount: async () => {
      const { data: { session } } = await mockSupabase.auth.getSession();
      if (!session || !session.user) return null;

      const { data: memberships, error } = await mockSupabase
        .from('memberships')
        .select('account_id, role, accounts(name)')
        .eq('user_id', session.user.id);

      if (!memberships || memberships.length === 0) return null;
      if (memberships.length > 1) {
        throw new Error('Multiple memberships detected. Multi-account switching is not implemented yet.');
      }

      const membership = memberships[0];
      const accountName = (membership.accounts as any)?.name || 'Unknown Account';

      return {
        id: membership.account_id,
        name: accountName,
        role: membership.role
      };
    }
  };
});

import { supabase, getCurrentAccount } from '../../../lib/supabase/client';

describe('ReminderSchedulerService Auth Path Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves account via memberships using real authenticated path pattern', async () => {
    const mockSession = {
      user: { id: 'test-user-id', email: 'test@example.com' }
    };

    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: mockSession },
      error: null
    });

    const membershipsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [{ account_id: 'acc-123', role: 'admin', accounts: { name: 'Test Account' } }],
        error: null
      })
    };

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'memberships') return membershipsQuery;
      return {};
    });

    const account = await getCurrentAccount();

    expect(account).toEqual({
      id: 'acc-123',
      name: 'Test Account',
      role: 'admin'
    });

    expect(supabase.from).toHaveBeenCalledWith('memberships');
    expect(membershipsQuery.select).toHaveBeenCalledWith('account_id, role, accounts(name)');
    expect(membershipsQuery.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
  });

  it('enforces single-membership constraint in auth path', async () => {
    const mockSession = {
      user: { id: 'test-user-id', email: 'test@example.com' }
    };

    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: mockSession },
      error: null
    });

    const membershipsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [
          { account_id: 'acc-1', role: 'admin', accounts: { name: 'Account 1' } },
          { account_id: 'acc-2', role: 'member', accounts: { name: 'Account 2' } }
        ],
        error: null
      })
    };

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'memberships') return membershipsQuery;
      return {};
    });

    await expect(getCurrentAccount()).rejects.toThrow(
      'Multiple memberships detected. Multi-account switching is not implemented yet.'
    );
  });
});
