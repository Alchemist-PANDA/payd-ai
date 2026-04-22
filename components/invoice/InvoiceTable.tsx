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
    <div className="glass-card data-card">
      <div className="data-card__header">
        <div className="flex gap-2">
          {filters.map(filter => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`navbar__link ${
                activeFilter === filter.value
                  ? 'navbar__link--active bg-[var(--border-subtle)]'
                  : ''
              }`}
              style={{ cursor: 'pointer', border: 'none' }}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
           {selectedIds.size > 0 && (
             <Button variant="ghost" size="sm" onClick={() => onBulkAction?.('approve', Array.from(selectedIds))}>
               Approve Selected ({selectedIds.size})
             </Button>
           )}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredInvoices.length && filteredInvoices.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded"
                />
              </th>
              <th>Company</th>
              <th>Contact</th>
              <th className="text-right">Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-secondary">
                  No invoices found
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <React.Fragment key={invoice.id}>
                  <tr
                    className="cursor-pointer"
                    onClick={() => setExpandedId(expandedId === invoice.id ? null : invoice.id)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(invoice.id)}
                        onChange={() => toggleSelect(invoice.id)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                    <td><strong>{invoice.company}</strong></td>
                    <td className="text-secondary">{invoice.contact}</td>
                    <td className="text-right"><strong>{formatCurrency(invoice.amount)}</strong></td>
                    <td className="text-secondary">{invoice.dueDate}</td>
                    <td>
                      <Badge status={invoice.status} />
                    </td>
                    <td className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        onRowClick?.(invoice);
                      }}>
                        View
                      </Button>
                    </td>
                  </tr>
                  {expandedId === invoice.id && (
                    <tr className="bg-[var(--surface-bg)]">
                      <td colSpan={7} className="px-8 py-4">
                         <div className="glass-card p-4 animate-fade-in">
                            <div className="text-label mb-2">Internal Notes</div>
                            <div className="text-small text-secondary">
                              Invoice ID: {invoice.id} • Last reminded: N/A
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
