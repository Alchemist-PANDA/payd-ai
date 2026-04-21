'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../../components/layout/AppShell';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { BrokenPromiseDetail } from '../../../../packages/shared/src/types/broken-promise';

export default function BrokenPromiseAlertsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<BrokenPromiseDetail[]>([]);

  useEffect(() => {
    const mockAlerts: BrokenPromiseDetail[] = [
      {
        id: 'alert-001',
        account_id: 'acc-1',
        contact_id: 'contact-003',
        invoice_id: 'inv-003',
        promise_id: 'promise-003',
        contact_name: 'Initech',
        contact_email: 'ap@initech.example.com',
        invoice_number: 'INV-2024-045',
        invoice_amount_cents: 3800000,
        promised_date: '2026-04-15',
        broken_date: '2026-04-16',
        previous_crs_score: 62,
        new_crs_score: 55,
        crs_delta: -7,
        total_broken_promises: 2,
        promise_history_summary: '2nd broken promise in 3 months',
        recommended_action: 'escalate_contact',
        status: 'pending',
        created_at: new Date().toISOString()
      },
      {
        id: 'alert-002',
        account_id: 'acc-1',
        contact_id: 'contact-004',
        invoice_id: 'inv-004',
        promise_id: 'promise-004',
        contact_name: 'Soylent Corp',
        contact_email: 'billing@soylent.example.com',
        invoice_number: 'INV-2024-032',
        invoice_amount_cents: 850000,
        promised_date: '2026-04-10',
        broken_date: '2026-04-11',
        previous_crs_score: 45,
        new_crs_score: 38,
        crs_delta: -7,
        total_broken_promises: 5,
        promise_history_summary: '5th broken promise in 6 months',
        recommended_action: 'pause_work',
        status: 'pending',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    setTimeout(() => {
      setAlerts(mockAlerts);
      setIsLoading(false);
    }, 600);
  }, []);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getActionLabel = (action: string) => {
    const map: Record<string, string> = {
      escalate_contact: 'Escalate to Manager',
      pause_work: 'Pause Work',
      send_final_notice: 'Send Final Notice',
      monitor: 'Monitor Closely',
    };
    return map[action] || action;
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 page-enter">
        {/* Header */}
        <div>
          <h1 className="text-h1">Broken Promise Alerts</h1>
          <p className="text-body mt-2" style={{ color: 'var(--text-secondary)' }}>
            Track clients who missed payment commitments
          </p>
        </div>

        {/* Alert Cards */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div
              className="rounded-xl p-12 text-center"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-h3 mb-2">No broken promises</h3>
              <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
                All clients are meeting their payment commitments
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl p-6"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-card)',
                  borderLeft: `4px solid var(--danger)`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-h3">{alert.contact_name}</h3>
                      <Badge status="overdue">Broken Promise</Badge>
                    </div>
                    <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
                      {alert.contact_email}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-mono-lg" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(alert.invoice_amount_cents)}
                    </div>
                    <div className="text-small" style={{ color: 'var(--text-secondary)' }}>
                      {alert.invoice_number}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-label mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Promised Date
                    </div>
                    <div className="text-body" style={{ color: 'var(--text-primary)' }}>
                      {formatDate(alert.promised_date)}
                    </div>
                  </div>
                  <div>
                    <div className="text-label mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Broken Date
                    </div>
                    <div className="text-body" style={{ color: 'var(--danger)' }}>
                      {formatDate(alert.broken_date)}
                    </div>
                  </div>
                  <div>
                    <div className="text-label mb-1" style={{ color: 'var(--text-secondary)' }}>
                      CRS Change
                    </div>
                    <div className="text-body" style={{ color: 'var(--danger)' }}>
                      {alert.previous_crs_score} → {alert.new_crs_score} ({alert.crs_delta})
                    </div>
                  </div>
                  <div>
                    <div className="text-label mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Total Broken
                    </div>
                    <div className="text-body" style={{ color: 'var(--text-primary)' }}>
                      {alert.total_broken_promises}
                    </div>
                  </div>
                </div>

                <div
                  className="p-3 rounded-lg mb-4"
                  style={{
                    background: 'var(--warning-bg)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                  }}
                >
                  <p className="text-small" style={{ color: 'var(--text-primary)' }}>
                    <strong>History:</strong> {alert.promise_history_summary}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-small" style={{ color: 'var(--text-secondary)' }}>
                      Recommended:
                    </span>
                    <span className="ml-2 text-small font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {getActionLabel(alert.recommended_action)}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="ghost">Dismiss</Button>
                    <Button variant="primary">Take Action</Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
