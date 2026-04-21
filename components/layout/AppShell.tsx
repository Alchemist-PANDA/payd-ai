'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentAccount, getCurrentSession, supabase } from '../../src/lib/supabase/client';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkSessionAndAccount() {
      const session = await getCurrentSession();
      if (!session) {
        if (mounted) {
          router.replace('/login');
        }
        return;
      }

      try {
        const account = await getCurrentAccount();
        if (!account) {
          if (mounted) router.replace('/login');
          return;
        }
        if (mounted) {
          setUser({
            name: account.name,
            email: session.user.email || '',
          });
        }
      } catch (err) {
        console.error('[AppShell] Account resolution failed:', err);
        if (mounted) router.replace('/login');
      }
    }

    checkSessionAndAccount();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (mounted) router.replace('/login');
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user || undefined} onSignOut={handleLogout} />

      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
}
