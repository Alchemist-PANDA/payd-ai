'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../../../components/layout/AppShell';
import { ClientPromiseTimeline, getPromiseStatusColor, getPromiseStatusIcon } from '../../../../../packages/shared/src/types/promise-timeline';

export default function ClientPromiseTimelinePage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [timeline, setTimeline] = useState<ClientPromiseTimeline | null>(null);

  useEffect(() => {
    // Mock data for Phase 3 UI build (Non-AI completion)
    const mockTimeline: ClientPromiseTimeline = {
      contact_id: params.id,
      contact_name: 'Initech',
      contact_email: 'ap@initech.example.com',
      total_promises: 4,
      kept_promises: 2,
      broken_promises: 2,
      pending_promises: 0,
      reliability_percentage: 50,
      events: [
        {
          id: 'evt-001',
          promise_id: 'promise-001',
          invoice_id: 'inv-001',
          invoice_number: 'INV-2024-012',
          promised_date: '2026-01-15',
          promised_amount_cents: 1200000,
          status: 'kept',
          actual_payment_date: '2026-01-15',
          days_late: 0,
          created_at: '2026-01-10T10:00:00Z'
        },
        {
          id: 'evt-002',
          promise_id: 'promise-002',
          invoice_id: 'inv-002',
          invoice_number: 'INV-2024-023',
          promised_date: '2026-02-20',
          promised_amount_cents: 850000,
          status: 'broken',
          actual_payment_date: '2026-03-05',
          days_late: 13,
          created_at: '2026-02-15T14:30:00Z'
        },
        {
          id: 'evt-003',
          promise_id: 'promise-003',
          invoice_id: 'inv-003',
          invoice_number: 'INV-2024-034',
          promised_date: '2026-03-10',
          promised_amount_cents: 2100000,
          status: 'kept',
          actual_payment_date: '2026-03-12',
          days_late: 2,
          created_at: '2026-03-05T09:15:00Z'
        },
        {
          id: 'evt-004',
          promise_id: 'promise-004',
          invoice_id: 'inv-004',
          invoice_number: 'INV-2024-045',
          promised_date: '2026-04-15',
          promised_amount_cents: 3800000,
          status: 'broken',
          actual_payment_date: null,
          days_late: null,
          created_at: '2026-04-10T11:00:00Z'
        }
      ]
    };

    setTimeout(() => {
      setTimeline(mockTimeline);
      setIsLoading(false);
    }, 600);
  }, [params.id]);

  const formatCurrency = (cents: number | null) => {
    if (cents === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not paid';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="spin w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full" />
        </div>
      </AppShell>
    );
  }

  if (!timeline) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <p className="text-secondary">Client not found.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto pb-12 page-enter">
        {/* Header */}
        <div>
          <h1 className="text-title text-2xl">{timeline.contact_name}</h1>
          <p className="text-secondary mt-1">{timeline.contact_email}</p>
        </div>

        {/* Summary Stats */}
        <div className="stat-grid !grid-cols-2 md:!grid-cols-4">
          <div className="glass-card stat-card">
            <div className="stat-card__label">Total Promises</div>
            <div className="stat-card__value">{timeline.total_promises}</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-card__label">Kept</div>
            <div className="stat-card__value text-[var(--brand-secondary)]">{timeline.kept_promises}</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-card__label">Broken</div>
            <div className="stat-card__value text-[var(--brand-danger)]">{timeline.broken_promises}</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-card__label">Reliability</div>
            <div className="stat-card__value">{timeline.reliability_percentage}%</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="glass-card data-card overflow-hidden">
          <div className="data-card__header border-b border-[var(--border-subtle)] p-6">
            <h2 className="text-title">Promise History</h2>
            <p className="text-small text-secondary mt-1">
              Complete record of payment commitments and outcomes.
            </p>
          </div>
          <div className="p-8">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-[var(--border-subtle)]"></div>

              {/* Timeline events */}
              <div className="space-y-8">
                {timeline.events.map((event, index) => (
                  <div key={event.id} className="relative flex gap-6">
                    {/* Timeline dot */}
                    <div className={`flex-shrink-0 w-16 h-16 rounded-full border-4 border-[var(--surface-card)] flex items-center justify-center text-2xl z-10 shadow-sm ${
                      event.status === 'kept' ? 'bg-[var(--brand-secondary)]' :
                      event.status === 'broken' ? 'bg-[var(--brand-danger)]' :
                      'bg-[var(--brand-primary)]'
                    }`}>
                      <span className="text-white drop-shadow-sm">{getPromiseStatusIcon(event.status)}</span>
                    </div>

                    {/* Event card */}
                    <div className="flex-1 pb-4">
                      <div className={`glass-card p-5 !bg-[var(--surface-bg)] border border-[var(--border-glass)] ${
                        event.status === 'kept' ? 'border-l-4 border-l-[var(--brand-secondary)]' :
                        event.status === 'broken' ? 'border-l-4 border-l-[var(--brand-danger)]' :
                        'border-l-4 border-l-[var(--brand-primary)]'
                      }`}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-body font-bold">{event.invoice_number}</h3>
                            <p className="text-small text-secondary">{formatCurrency(event.promised_amount_cents)}</p>
                          </div>
                          <Badge status={event.status === 'kept' ? 'paid' : event.status === 'broken' ? 'overdue' : 'pending'}>
                            {event.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-small">
                          <div>
                            <span className="text-secondary">Promised:</span>
                            <span className="ml-2 font-medium">{formatDate(event.promised_date)}</span>
                          </div>
                          <div>
                            <span className="text-secondary">Actual:</span>
                            <span className="ml-2 font-medium">{formatDate(event.actual_payment_date)}</span>
                          </div>
                          {event.days_late !== null && (
                            <div className="col-span-full pt-2 border-t border-[var(--border-subtle)]">
                              {event.days_late > 0 ? (
                                <span className="text-[var(--brand-danger)] font-medium">
                                  ⚠️ {event.days_late} days late
                                </span>
                              ) : (
                                <span className="text-[var(--brand-secondary)] font-medium">
                                  ✅ Paid on time
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
