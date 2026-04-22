'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../../components/layout/AppShell';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { BrokenPromiseDetail } from '@/packages/shared/src/types/broken-promise';

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
          <div className="spin w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto space-y-8 page-enter py-8 px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--border-subtle)] pb-8">
          <div>
            <h1 className="text-hero !text-3xl font-bold text-white tracking-tight">Alerts</h1>
            <p className="text-body mt-2 text-secondary font-medium">
              Welcome back, Test Validation Account <span className="text-[var(--brand-secondary)] inline-block w-2 h-2 rounded-full bg-[var(--brand-secondary)] ml-1" />
            </p>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-small text-[var(--brand-danger)] font-bold bg-[rgba(255,77,79,0.1)] px-3 py-1 rounded-full border border-[rgba(255,77,79,0.2)]">2 urgent alerts</span>
              <span className="text-small text-[var(--brand-accent)] font-bold bg-[rgba(255,159,10,0.1)] px-3 py-1 rounded-full border border-[rgba(255,159,10,0.2)]">1 watchlist</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="btn-comfort !bg-[#111317] border border-[#2A2F3A] hover:border-[#4B5563] text-white">Export</Button>
            <Button variant="primary" className="btn-comfort shadow-[0_8px_32px_rgba(0,212,170,0.15)]">+ New Action</Button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { label: 'All', count: 3 },
            { label: 'Broken Promise', count: 2 },
            { label: 'CRS Drop', count: 1 },
            { label: 'Escalated', count: 0 }
          ].map((f) => (
            <button
              key={f.label}
              className={`px-5 py-2.5 rounded-full text-small font-semibold transition-all flex items-center gap-3 whitespace-nowrap ${
                f.label === 'All'
                  ? 'bg-[var(--brand-primary)] text-[#0A0B0E]'
                  : 'bg-[#111317] text-secondary border border-[#2A2F3A] hover:border-[var(--brand-primary)] hover:text-white'
              }`}
            >
              {f.label}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${f.label === 'All' ? 'bg-[rgba(0,0,0,0.15)]' : 'bg-[#1F242F]'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Spacious Alert Cards */}
        <div className="grid gap-6">
          {alerts.length === 0 ? (
            <div className="comfort-card p-16 text-center">
              <div className="text-5xl mb-6">🏝️</div>
              <h3 className="text-headline !text-2xl mb-3 text-white">All caught up!</h3>
              <p className="text-body text-secondary">No broken promises or urgent alerts found. Enjoy the calm.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="comfort-card group">
                {/* Card Top: Client & Badge */}
                <div className="flex items-start justify-between mb-10">
                  <div>
                    <h3 className="text-hero !text-4xl font-bold text-white group-hover:text-[var(--brand-primary)] transition-colors mb-2">
                      {alert.contact_name}
                    </h3>
                    <p className="text-body-lg text-secondary tracking-tight">{alert.contact_email}</p>
                    <p className="text-small text-[var(--brand-danger)] font-bold mt-2 tracking-wide uppercase">Broken Promise</p>
                  </div>
                  <div className={`px-5 py-2 rounded-full text-caption font-bold tracking-widest uppercase border shadow-sm ${
                    alert.status === 'pending' ? 'bg-[rgba(255,77,79,0.1)] border-[rgba(255,77,79,0.2)] text-[var(--brand-danger)]' : 'bg-[rgba(255,159,10,0.1)] border-[rgba(255,159,10,0.2)] text-[var(--brand-accent)]'
                  }`}>
                    Urgent
                  </div>
                </div>

                {/* Metric Grid: No Cramping, High Spacing */}
                <div className="metric-grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 !gap-6">
                  <div className="metric-item shadow-sm">
                    <span className="text-label text-[11px] text-tertiary">Amount</span>
                    <span className="text-hero !text-2xl text-white font-bold tracking-tighter">{formatCurrency(alert.invoice_amount_cents)}</span>
                  </div>
                  <div className="metric-item shadow-sm">
                    <span className="text-label text-[11px] text-tertiary">Invoice</span>
                    <span className="text-body font-mono font-bold text-white text-lg">{alert.invoice_number}</span>
                  </div>
                  <div className="metric-item shadow-sm">
                    <span className="text-label text-[11px] text-tertiary">CRS Change</span>
                    <div className="flex items-center gap-3">
                       <span className="text-title text-white font-bold">{alert.previous_crs_score} → {alert.new_crs_score}</span>
                       <span className={`text-caption font-black ${alert.crs_delta < 0 ? 'text-[var(--brand-danger)]' : 'text-[var(--brand-primary)]'}`}>
                         {alert.crs_delta < 0 ? '▼' : '▲'} {Math.abs(alert.crs_delta)}
                       </span>
                    </div>
                  </div>
                  <div className="metric-item shadow-sm">
                    <span className="text-label text-[11px] text-tertiary">Timeline</span>
                    <div className="space-y-2 py-1">
                       <div className="flex justify-between items-center text-small">
                         <span className="text-secondary font-medium">Promised:</span>
                         <span className="text-white font-bold">04/15/26</span>
                       </div>
                       <div className="flex justify-between items-center text-small">
                         <span className="text-[var(--brand-danger)] font-medium">Broken:</span>
                         <span className="text-[var(--brand-danger)] font-bold">04/16/26</span>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Warning Box: Clean stacking, no overcrowding */}
                <div className="warning-box border border-[rgba(255,159,10,0.15)] shadow-xl !bg-[#15181E]">
                   <div className="flex items-start gap-4">
                     <span className="text-2xl mt-1">⚠️</span>
                     <div className="space-y-4 flex-1">
                       <div className="flex flex-wrap items-center gap-4">
                         <div className="flex items-center gap-2 bg-[#0A0B0E] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
                            <span className="text-[10px] uppercase font-black text-tertiary">Total Broken</span>
                            <span className="text-white font-bold">{alert.total_broken_promises}</span>
                         </div>
                         <div className="text-secondary font-medium italic border-l border-[var(--border-subtle)] pl-4">
                           "2nd broken promise in 3 months"
                         </div>
                       </div>

                       <div className="pt-2 border-t border-[var(--border-subtle)]/50">
                         <span className="text-[10px] font-black uppercase text-[var(--brand-accent)] tracking-widest block mb-1">AI Recommendation</span>
                         <p className="text-body font-bold text-white text-lg">Escalate to Manager</p>
                       </div>
                     </div>
                   </div>
                </div>

                {/* Card Actions: Large targets */}
                <div className="flex items-center justify-between pt-8 border-t border-[#1F242F] mt-6">
                  <button className="flex items-center gap-2 text-small font-bold text-secondary hover:text-white transition-colors group/btn">
                    <span className="w-10 h-10 rounded-full bg-[#111317] border border-[#2A2F3A] flex items-center justify-center group-hover/btn:border-[var(--brand-primary)] group-hover/btn:text-[var(--brand-primary)] transition-all">💬</span>
                    Discussions
                  </button>
                  <Button variant="primary" className="btn-comfort !px-10 shadow-[0_0_20px_rgba(0,212,170,0.2)]">
                    Take Action
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
