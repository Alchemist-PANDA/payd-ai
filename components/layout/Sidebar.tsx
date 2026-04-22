'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: string;
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

  const mainNav: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: '⊞' },
    { label: 'Invoices', href: '/invoices', icon: '📄', badge: 3 },
    { label: 'Action Queue', href: '/action-queue', icon: '🤖' },
    { label: 'CRS Dashboard', href: '/crs', icon: '📈' },
    { label: 'Alerts', href: '/alerts', icon: '🔔' },
  ];

  const accountNav: NavItem[] = [
    { label: 'Integrations', href: '/integrations', icon: '🔗' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  const NavLink = ({ item }: { item: NavItem }) => (
    <li>
      <Link
        href={item.href}
        onClick={onClose}
        className={`sidebar__nav-link ${isActive(item.href) ? 'active' : ''}`}
      >
        <span className="sidebar__nav-icon">{item.icon}</span>
        {item.label}
        {item.badge && <span className="sidebar__nav-badge">{item.badge}</span>}
      </Link>
    </li>
  );

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar__header">
        <Link className="sidebar__logo" href="/dashboard">
          <div className="sidebar__logo-mark">P</div>
          Payd<span style={{ color: 'var(--brand-primary)' }}>AI</span>
        </Link>
      </div>

      <nav className="sidebar__nav">
        {/* Main */}
        <div>
          <div className="sidebar__group-label">Main</div>
          <ul className="sidebar__nav-list">
            {mainNav.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <div className="sidebar__group-label">Account</div>
          <ul className="sidebar__nav-list">
            {accountNav.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </ul>
        </div>
      </nav>

      <div className="sidebar__footer">
        {user ? (
          <div className="sidebar__user" onClick={onSignOut} title="Sign out">
            <div className="sidebar__user-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="sidebar__user-name truncate">{user.name}</div>
              <div className="sidebar__user-role truncate">{user.email}</div>
            </div>
            <span className="sidebar__user-more">⋯</span>
          </div>
        ) : (
          <Link href="/login" className="btn btn-secondary btn-sm w-full">
            Sign In
          </Link>
        )}
      </div>
    </aside>
  );
}
