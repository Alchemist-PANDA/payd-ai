'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AppShell } from '../../../components/layout/AppShell';
import { Button } from '../../../components/ui/Button';
import { SkeletonStatCard, SkeletonTableRow } from '../../../components/ui/Skeleton';
import { Badge } from '../../../components/ui/Badge';
import { Tooltip } from '../../../components/ui/Tooltip';
import { InvoicesService } from '../../../src/services/invoices/InvoicesService';
import { getCurrentAccount } from '../../../src/lib/supabase/client';

// Lazy load heavy components
const InvoiceTable = dynamic(() => import('../../../components/invoice/InvoiceTable').then(mod => ({ default: mod.InvoiceTable })), {
  loading: () => <div className="space-y-2 p-4">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-[var(--bg-overlay)] rounded-lg animate-pulse" />)}</div>,
  ssr: false
});

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    outstanding: 0,
    reminders: 127,
    rate: 68,
    overdue: 0
  });

  useEffect(() => {
    async function init() {
      try {
        const account = await getCurrentAccount();
        if (account) {
          const data = await InvoicesService.getByAccount(account.id);
          const mapped = data.map((inv: any) => ({
            id: inv.id,
            company: inv.contacts?.[0]?.contact?.name || 'Unknown',
            contact: inv.contacts?.[0]?.contact?.email || 'No email',
            amount: inv.amount_cents,
            dueDate: new Date(inv.due_date).toLocaleDateString(),
            status: inv.status,
          }));
          setInvoices(mapped.slice(0, 5)); // Only show top 5

          // Calculate real stats
          const outstanding = mapped.reduce((sum, inv) =>
            (inv.status === 'pending' || inv.status === 'sent' || inv.status === 'overdue') ? sum + inv.amount : sum, 0);
          const overdue = mapped.reduce((sum, inv) =>
            inv.status === 'overdue' ? sum + inv.amount : sum, 0);

          setStats(prev => ({ ...prev, outstanding, overdue }));
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-6 border border-[var(--border-subtle)] group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--brand-primary)]/5 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-[10px] font-bold text-[var(--text-disabled)] uppercase tracking-widest">Total Outstanding</span>
              <div className="p-2 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-[var(--text-primary)] relative z-10">
              {isLoading ? '---' : formatCurrency(stats.outstanding)}
            </div>
            <div className="mt-4 flex items-center gap-2 relative z-10">
               <Badge status="success" className="text-[9px]">+12%</Badge>
               <span className="text-[10px] text-[var(--text-disabled)]">vs. last month</span>
            </div>
          </div>

          <div className="glass-card p-6 border border-[var(--border-subtle)] group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--status-info)]/5 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-[10px] font-bold text-[var(--text-disabled)] uppercase tracking-widest">Reminders Sent</span>
              <div className="p-2 rounded-lg bg-[var(--status-info)]/10 text-[var(--status-info)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-[var(--text-primary)] relative z-10">{stats.reminders}</div>
            <div className="mt-4 flex items-center gap-2 relative z-10">
               <Badge status="info" className="text-[9px]">+8</Badge>
               <span className="text-[10px] text-[var(--text-disabled)]">this week</span>
            </div>
          </div>

          <div className="glass-card p-6 border border-[var(--border-subtle)] group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--status-success)]/5 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-[10px] font-bold text-[var(--text-disabled)] uppercase tracking-widest">Efficiency Rate</span>
              <div className="p-2 rounded-lg bg-[var(--status-success)]/10 text-[var(--status-success)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-[var(--text-primary)] relative z-10">{stats.rate}%</div>
            <div className="mt-4 flex items-center gap-2 relative z-10">
               <Badge status="success" className="text-[9px]">+5.2%</Badge>
               <span className="text-[10px] text-[var(--text-disabled)]">AI optimization</span>
            </div>
          </div>

          <div className="glass-card p-6 border border-[var(--border-subtle)] group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--status-error)]/5 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-[10px] font-bold text-[var(--text-disabled)] uppercase tracking-widest">Critical Overdue</span>
              <div className="p-2 rounded-lg bg-[var(--status-error)]/10 text-[var(--status-error)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-[var(--status-error)] relative z-10">
              {isLoading ? '---' : formatCurrency(stats.overdue)}
            </div>
            <div className="mt-4 flex items-center gap-2 relative z-10">
               <Badge status="danger" className="text-[9px]">Action</Badge>
               <span className="text-[10px] text-[var(--text-disabled)]">Needs review</span>
            </div>
          </div>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Chart Placeholder */}
            <div className="glass-card p-8 border border-[var(--border-subtle)] relative overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Cashflow Forecast</h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">AI-projected collections for the next 30 days</p>
                  </div>
                  <div className="flex bg-[var(--bg-base)] p-1 rounded-lg border border-[var(--border-default)]">
                    <button className="px-3 py-1 text-[10px] font-bold bg-[var(--brand-primary)] text-black rounded-md">30D</button>
                    <button className="px-3 py-1 text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">90D</button>
                  </div>
               </div>

               <div className="h-64 flex items-end justify-between gap-4 px-2">
                  {[40, 70, 45, 90, 65, 80, 50, 85, 60, 95, 75, 100].map((h, i) => (
                    <div key={i} className="flex-1 group relative">
                       <Tooltip content={`$${(h * 120).toLocaleString()} (est)`}>
                         <div
                           className="w-full bg-gradient-to-t from-[var(--brand-primary)] to-[var(--brand-cta)] rounded-t-sm transition-all duration-500 hover:brightness-125 cursor-pointer"
                           style={{ height: `${h}%`, opacity: 0.3 + (h/100) * 0.7 }}
                         />
                       </Tooltip>
                    </div>
                  ))}
               </div>
               <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-[var(--text-disabled)] uppercase tracking-widest">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
               </div>
            </div>

            {/* Recent Invoices */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Priority Invoices</h3>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/invoices'}>
                  View All Portfolio
                </Button>
              </div>
              <InvoiceTable
                invoices={invoices}
                onRowClick={(inv) => window.location.href = `/invoices/${inv.id}`}
              />
            </div>
          </div>

          {/* Sidebar Content (Right 1 column) */}
          <div className="space-y-8">
            <div className="glass-card p-6 border border-[var(--border-subtle)]">
               <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                 <span className="p-1.5 rounded-lg bg-[var(--brand-cta)]/10 text-[var(--brand-cta)]">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                   </svg>
                 </span>
                 AI Action Queue
               </h3>

               <div className="space-y-4">
                  {[
                    { title: 'Approve Follow-up', client: 'Acme Corp', urgency: 'high' },
                    { title: 'Review Dispute', client: 'Global Tech', urgency: 'medium' },
                    { title: 'Draft Settlement', client: 'Stark Ind', urgency: 'low' }
                  ].map((task, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] hover:border-[var(--brand-primary)]/50 transition-colors cursor-pointer group">
                       <div className="flex justify-between items-start mb-2">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            task.urgency === 'high' ? 'bg-[var(--status-error)]/10 text-[var(--status-error)]' :
                            task.urgency === 'medium' ? 'bg-[var(--status-warning)]/10 text-[var(--status-warning)]' :
                            'bg-[var(--status-info)]/10 text-[var(--status-info)]'
                          }`}>
                            {task.urgency}
                          </span>
                          <span className="text-[10px] text-[var(--text-disabled)] font-mono">#TQ-{248 - i}</span>
                       </div>
                       <div className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">{task.title}</div>
                       <div className="text-xs text-[var(--text-secondary)] mt-1">{task.client}</div>
                    </div>
                  ))}
               </div>

               <Button variant="brand-cta" size="md" className="w-full mt-6" onClick={() => window.location.href = '/action-queue'}>
                 Open Action Queue
               </Button>
            </div>

            <div className="glass-card p-6 border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-base)]">
               <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Integrations</h3>
               <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
                 Connect your ERP or Accounting software to sync invoices automatically.
               </p>

               <div className="flex flex-wrap gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-overlay)] flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer border border-[var(--border-default)]" title="QuickBooks">QB</div>
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-overlay)] flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer border border-[var(--border-default)]" title="Xero">X</div>
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-overlay)] flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer border border-[var(--border-default)]" title="Stripe">S</div>
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-overlay)] flex items-center justify-center border-2 border-dashed border-[var(--border-strong)] text-[var(--text-disabled)] cursor-pointer hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
               </div>

               <div className="p-4 rounded-xl bg-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/20 text-center">
                  <div className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-widest mb-1">New Feature</div>
                  <div className="text-xs font-medium text-[var(--text-primary)]">Stripe Auto-Sync now available</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
