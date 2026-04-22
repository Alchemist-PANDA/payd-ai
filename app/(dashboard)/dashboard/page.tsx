'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AppShell } from '../../../components/layout/AppShell';
import { StatCard } from '../../../components/ui/StatCard';
import { Button } from '../../../components/ui/Button';
import { SkeletonStatCard, SkeletonTableRow } from '../../../components/ui/Skeleton';

// Lazy load heavy components
const InvoiceTable = dynamic(() => import('../../../components/invoice/InvoiceTable').then(mod => ({ default: mod.InvoiceTable })), {
  loading: () => (
    <table className="w-full">
      <tbody>
        {[...Array(5)].map((_, i) => <SkeletonTableRow key={i} />)}
      </tbody>
    </table>
  ),
  ssr: false
});

const ActivityFeed = dynamic(() => import('../../../components/dashboard/ActivityFeed').then(mod => ({ default: mod.ActivityFeed })), {
  loading: () => <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}</div>,
  ssr: false
});

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6 page-enter">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-title">Dashboard</h1>
          <Button variant="primary" size="sm" onClick={() => window.location.href = '/invoices'}>
            Upload Invoices
          </Button>
        </div>

        {/* Stat Cards Row */}
        <div className="stat-grid">
          <div className="glass-card stat-card">
            <div className="stat-card__label">
              Total Outstanding
              <span style={{ fontSize: '1rem' }}>💰</span>
            </div>
            <div className="stat-card__value">$48,320</div>
            <span className="stat-card__change stat-card__change--up">+12% this month</span>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-card__label">
              Reminders Sent
              <span style={{ fontSize: '1rem' }}>📩</span>
            </div>
            <div className="stat-card__value">127</div>
            <span className="stat-card__change stat-card__change--up">+8 this week</span>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-card__label">
              Response Rate
              <span style={{ fontSize: '1rem' }}>📈</span>
            </div>
            <div className="stat-card__value">68%</div>
            <span className="stat-card__change stat-card__change--up">+5% vs last month</span>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-card__label">
              Overdue
              <span style={{ fontSize: '1rem' }}>⚠️</span>
            </div>
            <div className="stat-card__value text-[var(--brand-danger)]">$12,450</div>
            <span className="stat-card__change stat-card__change--down">-3% this week</span>
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Invoices Table (Left - 2 columns) */}
          <div className="lg:col-span-2">
            <div className="glass-card data-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-title">Recent Invoices</h2>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/invoices'}>View All</Button>
              </div>

              <div className="text-center py-12 text-secondary">
                <div className="text-4xl mb-4">📑</div>
                <p className="text-body mb-4">No invoices yet</p>
                <Button variant="secondary" size="sm" onClick={() => window.location.href = '/invoices'}>Upload your first CSV</Button>
              </div>
            </div>
          </div>

          {/* Activity Feed (Right - 1 column) */}
          <div>
            <div className="glass-card data-card p-6">
              <h2 className="text-title mb-6">Recent Activity</h2>

              <div className="space-y-4">
                <div className="text-small text-secondary text-center py-8">
                  No recent activity
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
