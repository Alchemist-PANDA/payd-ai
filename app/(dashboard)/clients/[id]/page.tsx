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
        <div className="flex justify-center items-center py-12">
          <span className="text-gray-400">Loading promise timeline...</span>
        </div>
      </AppShell>
    );
  }

  if (!timeline) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <p className="text-gray-500">Client not found.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{timeline.contact_name}</h1>
          <p className="text-gray-500 mt-1">{timeline.contact_email}</p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-sm font-medium text-gray-500">Total Promises</h2>
            <p className="text-3xl font-bold mt-2">{timeline.total_promises}</p>
          </div>
          <div className="p-6 bg-white border border-green-200 rounded-lg shadow-sm bg-green-50">
            <h2 className="text-sm font-medium text-green-700">Kept</h2>
            <p className="text-3xl font-bold mt-2 text-green-600">{timeline.kept_promises}</p>
          </div>
          <div className="p-6 bg-white border border-red-200 rounded-lg shadow-sm bg-red-50">
            <h2 className="text-sm font-medium text-red-700">Broken</h2>
            <p className="text-3xl font-bold mt-2 text-red-600">{timeline.broken_promises}</p>
          </div>
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-sm font-medium text-gray-500">Reliability</h2>
            <p className="text-3xl font-bold mt-2">{timeline.reliability_percentage}%</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium">Promise History</h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete record of payment commitments and outcomes.
            </p>
          </div>
          <div className="p-6">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {/* Timeline events */}
              <div className="space-y-8">
                {timeline.events.map((event, index) => (
                  <div key={event.id} className="relative flex gap-6">
                    {/* Timeline dot */}
                    <div className={`flex-shrink-0 w-16 h-16 rounded-full border-4 border-white flex items-center justify-center text-2xl z-10 ${
                      event.status === 'kept' ? 'bg-green-500' :
                      event.status === 'broken' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}>
                      <span className="text-white">{getPromiseStatusIcon(event.status)}</span>
                    </div>

                    {/* Event card */}
                    <div className="flex-1 pb-8">
                      <div className={`border rounded-lg p-4 ${
                        event.status === 'kept' ? 'border-green-200 bg-green-50' :
                        event.status === 'broken' ? 'border-red-200 bg-red-50' :
                        'border-blue-200 bg-blue-50'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-gray-900">{event.invoice_number}</h3>
                            <p className="text-sm text-gray-600">{formatCurrency(event.promised_amount_cents)}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${getPromiseStatusColor(event.status)}`}>
                            {event.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Promised:</span>
                            <span className="ml-2 font-medium">{formatDate(event.promised_date)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Actual:</span>
                            <span className="ml-2 font-medium">{formatDate(event.actual_payment_date)}</span>
                          </div>
                          {event.days_late !== null && event.days_late > 0 && (
                            <div className="col-span-2">
                              <span className="text-red-600 font-medium">
                                {event.days_late} days late
                              </span>
                            </div>
                          )}
                          {event.days_late === 0 && (
                            <div className="col-span-2">
                              <span className="text-green-600 font-medium">
                                Paid on time
                              </span>
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
