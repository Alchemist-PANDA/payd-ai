'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAccount, getCurrentSession, supabase } from '../../src/lib/supabase/client';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSessionAndAccount() {
      const session = await getCurrentSession();
      if (!session) {
        if (mounted) router.replace('/login');
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

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Map route to page title
  const getPageTitle = () => {
    if (pathname?.startsWith('/dashboard')) return 'Dashboard';
    if (pathname?.startsWith('/invoices')) return 'Invoices';
    if (pathname?.startsWith('/action-queue')) return 'Action Queue';
    if (pathname?.startsWith('/crs')) return 'CRS Dashboard';
    if (pathname?.startsWith('/alerts')) return 'Alerts';
    if (pathname?.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="app-shell">
      {/* Mobile Overlay */}
      <div
        className={`overlay ${isSidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
      />

      <Sidebar
        user={user || undefined}
        onSignOut={handleLogout}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      <div className="main-content">
        {/* Top bar */}
        <header className="topbar">
          <button
            className="topbar__icon-btn lg:hidden"
            onClick={toggleSidebar}
            aria-label="Menu"
          >
            ☰
          </button>

          <div className="topbar__search">
            <span className="topbar__search-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <input className="topbar__search-input" type="search" placeholder="Search invoices, clients…" />
          </div>

          <div className="topbar__actions">
            <button className="topbar__icon-btn hidden sm:flex" aria-label="Notifications">
              🔔
              <span className="topbar__notif-dot"></span>
            </button>
            <Link className="btn btn-primary btn-sm" href="/invoices/new">+ New Invoice</Link>
            <div
              className="sidebar__user-avatar cursor-pointer"
              onClick={handleLogout}
              title="Sign out"
            >
              {user?.name.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content animate-fade-up">
          <div className="page-header">
            <div>
              <h1 className="page-header__title">{getPageTitle()}</h1>
              <p className="page-header__sub">
                {user ? `Welcome back, ${user.name} 👋` : 'Loading account details...'}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm">Export</button>
              <button className="btn btn-primary btn-sm">+ New Action</button>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
