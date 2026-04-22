'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export interface SidebarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onSignOut?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ user, onSignOut, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Keyboard shortcut to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const mainNav: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      label: 'Invoices',
      href: '/invoices',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      badge: 3
    },
    {
      label: 'Action Queue',
      href: '/action-queue',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      label: 'CRS Dashboard',
      href: '/crs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      label: 'Alerts',
      href: '/alerts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
  ];

  const accountNav: NavItem[] = [
    {
      label: 'Integrations',
      href: '/integrations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    return (
      <li>
        <Link
          href={item.href}
          onClick={onClose}
          className={`
            flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] transition-all duration-200
            ${active
              ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]'}
            ${isCollapsed ? 'justify-center px-2' : ''}
          `}
          title={isCollapsed ? item.label : undefined}
        >
          <span className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
            {item.icon}
          </span>
          {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
          {!isCollapsed && item.badge && (
            <span className="bg-[var(--brand-primary)] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
              {item.badge}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-[100] flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border-subtle)]
        transition-all duration-300 ease-[var(--ease-out)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Header */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center px-4' : 'justify-between'}`}>
        {!isCollapsed && (
          <Link className="flex items-center gap-2 font-bold text-xl tracking-tighter" href="/dashboard">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-cta)] flex items-center justify-center text-black">
              P
            </div>
            <span>Payd<span className="text-[var(--brand-primary)]">AI</span></span>
          </Link>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-cta)] flex items-center justify-center text-black font-bold">
            P
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1 rounded-md hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)]"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        <div>
          {!isCollapsed && <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-disabled)] mb-4 ml-3">Main</div>}
          <ul className="space-y-1">
            {mainNav.map((item) => <NavLink key={item.href} item={item} />)}
          </ul>
        </div>

        <div>
          {!isCollapsed && <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-disabled)] mb-4 ml-3">Account</div>}
          <ul className="space-y-1">
            {accountNav.map((item) => <NavLink key={item.href} item={item} />)}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        {user ? (
          <div
            className={`
              flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors hover:bg-[var(--bg-overlay)]
              ${isCollapsed ? 'justify-center' : ''}
            `}
            onClick={onSignOut}
            title={isCollapsed ? `Sign out ${user.name}` : "Sign out"}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-cta)] flex items-center justify-center font-bold text-black flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[var(--text-primary)] truncate">{user.name}</div>
                <div className="text-[10px] text-[var(--text-secondary)] truncate">{user.email}</div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className={`
              flex items-center justify-center p-2 rounded-xl bg-[var(--brand-primary)] text-black font-bold text-sm
              ${isCollapsed ? 'w-10 h-10 px-0' : 'w-full'}
            `}
          >
            {isCollapsed ? '→' : 'Sign In'}
          </Link>
        )}
      </div>
    </aside>
  );
}
