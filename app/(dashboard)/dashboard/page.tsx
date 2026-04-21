'use client';

import React from 'react';
import { AppShell } from '../../../components/layout/AppShell';
import { StatCard } from '../../../components/ui/StatCard';
import { Button } from '../../../components/ui/Button';

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-8 page-enter">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-h1">Dashboard</h1>
          <Button variant="primary">
            Upload Invoices
          </Button>
        </div>

        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Outstanding"
            value="$48,320"
            delta="+12% this month"
            deltaType="positive"
          />
          <StatCard
            label="Reminders Sent"
            value="127"
            delta="+8 this week"
            deltaType="positive"
          />
          <StatCard
            label="Response Rate"
            value="68%"
            delta="+5% vs last month"
            deltaType="positive"
          />
          <StatCard
            label="Overdue"
            value="$12,450"
            delta="-3% this week"
            deltaType="positive"
          />
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Invoices Table (Left - 2 columns) */}
          <div className="lg:col-span-2">
            <div
              className="rounded-xl p-6"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-h3">Recent Invoices</h2>
                <Button variant="ghost">View All</Button>
              </div>

              <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                <p className="text-body mb-4">No invoices yet</p>
                <Button variant="secondary">Upload your first CSV</Button>
              </div>
            </div>
          </div>

          {/* Activity Feed (Right - 1 column) */}
          <div>
            <div
              className="rounded-xl p-6"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <h2 className="text-h3 mb-6">Recent Activity</h2>

              <div className="space-y-4">
                <div className="text-small" style={{ color: 'var(--text-muted)' }}>
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
