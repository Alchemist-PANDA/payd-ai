'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentAccount, getCurrentSession, supabase } from '../../src/lib/supabase/client';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [accountLabel, setAccountLabel] = useState('Loading account...');

  useEffect(() => {
    async function checkSessionAndAccount() {
      const session = await getCurrentSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      try {
        const account = await getCurrentAccount();
        if (!account) {
          router.replace('/login');
          return;
        }
        setAccountLabel(`${account.name} (${account.role})`);
      } catch {
        router.replace('/login');
      }
    }

    checkSessionAndAccount();

    // Handle session expiry in real-time
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <span className="font-bold text-xl text-blue-600">Payd AI</span>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/dashboard" className="block p-2 hover:bg-gray-100 rounded">Dashboard</Link>
          <Link href="/invoices" className="block p-2 hover:bg-gray-100 rounded">Invoices</Link>
          <Link href="/action-queue" className="block p-2 hover:bg-gray-100 rounded">Action Queue</Link>
          <hr className="my-2 border-gray-200" />
          <button
            onClick={handleLogout}
            className="w-full text-left p-2 hover:bg-gray-100 rounded text-red-600"
          >
            Logout
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="text-sm text-gray-500">{accountLabel}</div>
          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">AA</div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
