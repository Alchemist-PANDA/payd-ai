'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface SidebarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onSignOut?: () => void;
}

export function Sidebar({ user, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Invoices', href: '/invoices' },
    { label: 'Action Queue', href: '/action-queue' },
    { label: 'CRS Dashboard', href: '/crs' },
    { label: 'Alerts', href: '/alerts' },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
        }}
        aria-label="Toggle navigation menu"
        aria-expanded={isMobileOpen}
      >
        <svg className="w-6 h-6" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden fade-in"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-60 h-screen bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col
          transition-transform duration-300 ease-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[var(--border-subtle)]">
          <Link href="/dashboard" className="text-h3 text-[var(--text-primary)]">
            PayD <span className="text-[var(--accent)]">AI</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    block px-4 py-2.5 rounded-lg
                    text-body font-medium
                    transition-all duration-200
                    ${
                      isActive(item.href)
                        ? 'bg-[var(--bg-highlight)] text-[var(--accent)] border-l-2 border-[var(--accent)] pl-[14px]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        {user && (
          <div className="p-4 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--accent)] font-semibold">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-small font-medium text-[var(--text-primary)] truncate">
                  {user.name}
                </div>
                <div className="text-small text-[var(--text-muted)] truncate">
                  {user.email}
                </div>
              </div>
            </div>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="w-full px-4 py-2 text-small text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-lg transition-all duration-200"
              >
                Sign out
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
