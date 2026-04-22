'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAccount, getCurrentSession, supabase } from '../../src/lib/supabase/client';
import { Sidebar } from './Sidebar';
import { Button } from '../ui/Button';

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

  // Breadcrumbs logic
  const getBreadcrumbs = () => {
    const paths = pathname?.split('/').filter(p => p) || [];
    return paths.map((path, idx) => {
      const href = '/' + paths.slice(0, idx + 1).join('/');
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      return { label, href, isLast: idx === paths.length - 1 };
    });
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300 animate-fade-in"
          onClick={closeSidebar}
        />
      )}

      <Sidebar
        user={user || undefined}
        onSignOut={handleLogout}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 lg:has-[aside.w-20]:ml-20 transition-[margin] duration-300">
        {/* Top bar */}
        <header
          className={`
            sticky top-0 z-50 h-16 flex items-center justify-between px-6 border-b border-[var(--border-subtle)]
            transition-all duration-200
            ${isScrolled ? 'bg-[var(--bg-surface)]/80 backdrop-blur-md shadow-md' : 'bg-transparent'}
          `}
        >
          <div className="flex items-center gap-4">
            <button
              className="p-2 -ml-2 rounded-lg hover:bg-[var(--bg-overlay)] lg:hidden text-[var(--text-secondary)]"
              onClick={toggleSidebar}
              aria-label="Toggle Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden md:flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
              <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Payd AI</Link>
              {getBreadcrumbs().map((crumb) => (
                <React.Fragment key={crumb.href}>
                  <svg className="w-3 h-3 text-[var(--text-disabled)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <Link
                    href={crumb.href}
                    className={`hover:text-[var(--text-primary)] transition-colors ${crumb.isLast ? 'text-[var(--text-primary)] font-bold' : ''}`}
                  >
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-full px-3 py-1 text-xs text-[var(--text-secondary)]">
              <span className="w-2 h-2 rounded-full bg-[var(--status-success)] mr-2 animate-pulse" />
              AI Status: Optimal
            </div>

            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-full border border-[var(--border-default)] hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] transition-all"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                className="p-2 rounded-full border border-[var(--border-default)] hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] relative transition-all"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--brand-primary)] rounded-full border border-[var(--bg-surface)]" />
              </button>
            </div>

            <div className="h-8 w-px bg-[var(--border-subtle)] mx-1" />

            <Link href="/invoices/new">
              <Button variant="brand-primary" size="sm" className="hidden sm:flex">
                + New Invoice
              </Button>
            </Link>

            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-cta)] flex items-center justify-center font-bold text-black text-xs flex-shrink-0"
              title="Sign out"
            >
              {user?.name.charAt(0).toUpperCase() || 'U'}
            </button>
          </div>
        </header>

        {/* Page Header (Mobile Optimized) */}
        <div className="px-6 py-8 border-b border-[var(--border-subtle)] animate-fade-in bg-gradient-to-b from-[var(--bg-surface)] to-transparent">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">{getPageTitle()}</h1>
              <p className="text-[var(--text-secondary)] font-medium">
                {user ? `Welcome back, ${user.name} 👋` : 'Loading account details...'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="md">
                Export Data
              </Button>
              <Button variant="brand-cta" size="md">
                + New Action
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto animate-fade-up">
          {children}
        </main>
      </div>
    </div>
  );
}
