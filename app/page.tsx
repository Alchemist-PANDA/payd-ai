'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSession } from '../src/lib/supabase/client';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    async function routeBySession() {
      const session = await getCurrentSession();
      if (session) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }

    routeBySession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Checking session...
    </div>
  );
}
