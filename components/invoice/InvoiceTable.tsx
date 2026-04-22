'use client';

import React, { useState } from 'react';
import { Badge, BadgeStatus } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { EmptyState } from '../ui/EmptyState';

export interface Invoice {
  id: string;
  company: string;
  contact: string;
  amount: number;
  dueDate: string;
  status: BadgeStatus;
}

export interface InvoiceTableProps {
  invoices: Invoice[];
  onRowClick?: (invoice: Invoice) => void;
  onBulkAction?: (action: string, selectedIds: string[]) => void;
}

export function InvoiceTable({ invoices, onRowClick, onBulkAction }: InvoiceTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | BadgeStatus>('all');

  const filteredInvoices = invoices.filter(inv =>
    activeFilter === 'all' || inv.status === activeFilter
  );

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredInvoices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredInvoices.map(inv => inv.id)));
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const filters: Array<{ label: string; value: 'all' | BadgeStatus }> = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Sent', value: 'sent' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Paid', value: 'paid' },
  ];

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        title="No invoices yet"
        description="Import your first CSV to start tracking your receivables and AI automated reminders."
        ctaLabel="Import CSV"
        ctaAction={() => (document.querySelector('[data-testid="import-button"]') as HTMLElement)?.click()}
      />
    );
  }

  return (
    <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] shadow-xl overflow-hidden flex flex-col">
      <div className="p-4 border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex bg-[var(--bg-base)] p-1 rounded-lg border border-[var(--border-default)]">
          {filters.map(filter => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`
                px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200
                ${activeFilter === filter.value
                  ? 'bg-[var(--brand-primary)] text-black'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-xs font-bold text-[var(--brand-primary)] px-2">
                {selectedIds.size} selected
              </span>
              <Button
                variant="brand-cta"
                size="sm"
                onClick={() => onBulkAction?.('approve', Array.from(selectedIds))}
              >
                Approve & Send
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-base)]/50">
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredInvoices.length && filteredInvoices.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/20"
                />
              </th>
              <th className="p-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Company</th>
              <th className="p-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Contact</th>
              <th className="p-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] text-right">Amount</th>
              <th className="p-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Due Date</th>
              <th className="p-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Status</th>
              <th className="p-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center">
                  <p className="text-[var(--text-secondary)] italic">No {activeFilter === 'all' ? '' : activeFilter} invoices found</p>
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <React.Fragment key={invoice.id}>
                  <tr
                    className={`
                      group transition-colors duration-150 cursor-pointer
                      ${selectedIds.has(invoice.id) ? 'bg-[var(--brand-primary)]/[0.03]' : 'hover:bg-[var(--bg-overlay)]'}
                      ${expandedId === invoice.id ? 'bg-[var(--bg-overlay)]/50' : ''}
                    `}
                    onClick={() => setExpandedId(expandedId === invoice.id ? null : invoice.id)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(invoice.id)}
                        onChange={() => toggleSelect(invoice.id)}
                        className="w-4 h-4 rounded bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/20"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                          {invoice.company}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-disabled)] uppercase tracking-wider">
                          ID: {invoice.id.split('-')[0]}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">{invoice.contact}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-mono font-bold text-[var(--text-primary)]">
                        {formatCurrency(invoice.amount)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-[var(--text-secondary)]">{invoice.dueDate}</span>
                    </td>
                    <td className="p-4">
                      <Badge status={invoice.status} />
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip content="Quick Send">
                          <button className="p-2 rounded-lg hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </button>
                        </Tooltip>
                        <Tooltip content="View Details">
                          <button
                            onClick={() => onRowClick?.(invoice)}
                            className="p-2 rounded-lg hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                  {expandedId === invoice.id && (
                    <tr className="bg-[var(--bg-base)]/30 border-l-2 border-[var(--brand-primary)] animate-fade-in">
                      <td colSpan={7} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-subtle)]">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-disabled)] mb-3">AI Predictions</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-[var(--text-secondary)]">Probability to Pay</span>
                                <span className="text-sm font-bold text-[var(--status-success)]">92%</span>
                              </div>
                              <div className="w-full h-1.5 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--status-success)] rounded-full" style={{ width: '92%' }} />
                              </div>
                              <p className="text-[10px] text-[var(--text-tertiary)] italic">High confidence: client usually pays within 3 days of reminder.</p>
                            </div>
                          </div>

                          <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-subtle)]">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-disabled)] mb-3">Recent Activity</h4>
                            <div className="space-y-3">
                              <div className="flex gap-3 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--status-info)] mt-1.5" />
                                <div className="text-xs">
                                  <div className="font-bold text-[var(--text-primary)]">AI Reminder Sent</div>
                                  <div className="text-[10px] text-[var(--text-tertiary)]">Yesterday, 2:45 PM</div>
                                </div>
                              </div>
                              <div className="flex gap-3 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-disabled)] mt-1.5" />
                                <div className="text-xs text-[var(--text-disabled)]">
                                  <div className="font-bold">Invoice Uploaded</div>
                                  <div className="text-[10px]">3 days ago</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                             <Button variant="secondary" size="sm" className="w-full">
                               Manual Reminder
                             </Button>
                             <Button variant="ghost" size="sm" className="w-full">
                               Pause AI Follow-ups
                             </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
