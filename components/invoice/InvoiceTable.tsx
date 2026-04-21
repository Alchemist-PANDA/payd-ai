'use client';

import React, { useState } from 'react';
import { Badge, BadgeStatus } from '../ui/Badge';
import { Button } from '../ui/Button';

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

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        {filters.map(filter => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-4 py-2 text-small font-medium transition-all duration-200 border-b-2 ${
              activeFilter === filter.value
                ? 'border-[var(--accent)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredInvoices.length && filteredInvoices.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded accent-[var(--accent)]"
                />
              </th>
              <th className="text-left px-4 py-3 text-label" style={{ color: 'var(--text-secondary)' }}>
                Company
              </th>
              <th className="text-left px-4 py-3 text-label" style={{ color: 'var(--text-secondary)' }}>
                Contact
              </th>
              <th className="text-right px-4 py-3 text-label" style={{ color: 'var(--text-secondary)' }}>
                Amount
              </th>
              <th className="text-left px-4 py-3 text-label" style={{ color: 'var(--text-secondary)' }}>
                Due Date
              </th>
              <th className="text-left px-4 py-3 text-label" style={{ color: 'var(--text-secondary)' }}>
                Status
              </th>
              <th className="text-right px-4 py-3 text-label" style={{ color: 'var(--text-secondary)' }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div style={{ color: 'var(--text-muted)' }}>
                    <p className="text-body mb-4">No invoices found</p>
                    <Button variant="secondary">Upload CSV</Button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <React.Fragment key={invoice.id}>
                  <tr
                    className="cursor-pointer transition-all duration-200"
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: selectedIds.has(invoice.id) ? 'var(--bg-highlight)' : 'transparent',
                      borderLeft: selectedIds.has(invoice.id) ? '2px solid var(--accent)' : '2px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedIds.has(invoice.id)) {
                        e.currentTarget.style.background = 'var(--bg-highlight)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedIds.has(invoice.id)) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                    onClick={() => setExpandedId(expandedId === invoice.id ? null : invoice.id)}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(invoice.id)}
                        onChange={() => toggleSelect(invoice.id)}
                        className="w-4 h-4 rounded accent-[var(--accent)]"
                      />
                    </td>
                    <td className="px-4 py-4 text-body" style={{ color: 'var(--text-primary)' }}>
                      {invoice.company}
                    </td>
                    <td className="px-4 py-4 text-small" style={{ color: 'var(--text-secondary)' }}>
                      {invoice.contact}
                    </td>
                    <td className="px-4 py-4 text-right text-mono" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="px-4 py-4 text-small" style={{ color: 'var(--text-secondary)' }}>
                      {invoice.dueDate}
                    </td>
                    <td className="px-4 py-4">
                      <Badge status={invoice.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="ghost" onClick={(e) => {
                        e.stopPropagation();
                        onRowClick?.(invoice);
                      }}>
                        View Draft
                      </Button>
                    </td>
                  </tr>
                  {expandedId === invoice.id && (
                    <tr>
                      <td colSpan={7} className="px-4 py-0">
                        <div className="row-expand open py-4">
                          <div
                            className="p-4 rounded-lg"
                            style={{
                              background: 'var(--bg-elevated)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
                              Email preview would appear here
                            </p>
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

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4 flex items-center justify-between slide-in-right"
          style={{
            background: 'var(--bg-elevated)',
            borderTop: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-modal)',
          }}
        >
          <span className="text-body" style={{ color: 'var(--text-primary)' }}>
            {selectedIds.size} invoice{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
            <Button variant="secondary" onClick={() => onBulkAction?.('export', Array.from(selectedIds))}>
              Export
            </Button>
            <Button variant="primary" onClick={() => onBulkAction?.('approve', Array.from(selectedIds))}>
              Approve All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
