'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AppShell } from '../../../components/layout/AppShell';
import { CsvIngestionService, type ImportPreviewRow } from '../../../src/services/ingestion/CsvIngestionService';
import { InvoicesService } from '../../../src/services/invoices/InvoicesService';
import { getCurrentAccount } from '../../../src/lib/supabase/client';
import { trackEvent } from '../../../src/lib/telemetry';
import { Button } from '../../../components/ui/Button';
import { BadgeStatus } from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';
import { SkeletonTableRow } from '../../../components/ui/Skeleton';
import { InvoiceTable, type Invoice } from '../../../components/invoice/InvoiceTable';

// Lazy load heavy components
const Modal = dynamic(() => import('../../../components/ui/Modal').then(mod => ({ default: mod.Modal })), {
  ssr: false
});

const UploadZone = dynamic(() => import('../../../components/upload/UploadZone').then(mod => ({ default: mod.UploadZone })), {
  loading: () => <div className="h-64 rounded-[var(--radius-xl)] bg-[var(--bg-surface)] animate-pulse" />,
  ssr: false
});

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'previewing' | 'committing' | 'complete'>('idle');
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  const loadInvoices = async (accId: string) => {
    try {
      const data = await InvoicesService.getByAccount(accId);
      const mapped: Invoice[] = data.map((inv: any) => ({
        id: inv.id,
        company: inv.contacts?.[0]?.contact?.name || 'Unknown',
        contact: inv.contacts?.[0]?.contact?.email || 'No email',
        amount: inv.amount_cents,
        dueDate: new Date(inv.due_date).toLocaleDateString(),
        status: inv.status as BadgeStatus,
      }));
      setInvoices(mapped);
    } catch (err) {
      console.error('Failed to load invoices', err);
      addToast('error', 'Failed to load invoices');
    }
  };

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const account = await getCurrentAccount();
        if (mounted && account) {
          setAccountId(account.id);
          await loadInvoices(account.id);
          trackEvent(account.id, 'invoices_page_viewed');
        }
      } catch (err: any) {
        if (mounted) {
          addToast('error', 'Failed to load account: ' + err.message);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  const handleFileSelect = async (file: File) => {
    if (!accountId) return;

    try {
      addToast('info', 'Processing CSV file...');
      const rawRows = await CsvIngestionService.parseFile(file);
      const preview = await CsvIngestionService.validateImport(rawRows, accountId);

      const errorCount = preview.filter(r => !r.is_valid).length;
      setPreviewRows(preview);
      setImportStatus('previewing');

      if (errorCount > 0) {
        addToast('warning', `${errorCount} rows have validation errors and will be skipped`);
      } else {
        addToast('success', `${preview.length} rows ready to import`);
      }
    } catch (err: any) {
      console.error('[CSV] Processing failed:', err);
      addToast('error', 'Failed to parse CSV: ' + err.message);
    }
  };

  const handleCommit = async () => {
    if (!accountId) return;
    setImportStatus('committing');

    try {
      const result = await CsvIngestionService.commitImport(previewRows, accountId);
      addToast('success', `Successfully imported ${result.count} invoices`);
      setImportStatus('complete');
      setShowUploadModal(false);
      loadInvoices(accountId);
    } catch (err: any) {
      console.error('[CSV] Commit failed:', err);
      addToast('error', 'Import failed: ' + err.message);
      setImportStatus('previewing');
    }
  };

  const totals = {
    total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter(i => i.status === 'pending' || i.status === 'sent').reduce((sum, inv) => sum + inv.amount, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
    paid: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-32 bg-[var(--bg-surface)] rounded-[var(--radius-xl)] animate-pulse border border-[var(--border-subtle)]" />
            <div className="h-32 bg-[var(--bg-surface)] rounded-[var(--radius-xl)] animate-pulse border border-[var(--border-subtle)]" />
            <div className="h-32 bg-[var(--bg-surface)] rounded-[var(--radius-xl)] animate-pulse border border-[var(--border-subtle)]" />
            <div className="h-32 bg-[var(--bg-surface)] rounded-[var(--radius-xl)] animate-pulse border border-[var(--border-subtle)]" />
          </div>
          <div className="h-96 bg-[var(--bg-surface)] rounded-[var(--radius-xl)] animate-pulse border border-[var(--border-subtle)]" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-6 border border-[var(--border-subtle)] group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-[var(--text-disabled)] uppercase tracking-widest">Total Outstanding</span>
              <div className="p-2 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-[var(--text-primary)]">{formatCurrency(totals.pending + totals.overdue)}</div>
            <div className="mt-4 flex items-center justify-between">
               <span className="text-xs text-[var(--text-secondary)]">{invoices.length} total invoices</span>
               <span className="text-[10px] font-bold text-[var(--status-info)] bg-[var(--status-info)]/10 px-2 py-0.5 rounded-full uppercase">Healthy</span>
            </div>
          </div>

          <div className="glass-card p-6 border border-[var(--border-subtle)] group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-[var(--text-disabled)] uppercase tracking-widest">Overdue</span>
              <div className="p-2 rounded-lg bg-[var(--status-error)]/10 text-[var(--status-error)] group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-[var(--status-error)]">{formatCurrency(totals.overdue)}</div>
            <div className="mt-4 flex items-center justify-between">
               <span className="text-xs text-[var(--text-secondary)]">Action required</span>
               <span className="text-[10px] font-bold text-[var(--status-error)] bg-[var(--status-error)]/10 px-2 py-0.5 rounded-full uppercase">Critical</span>
            </div>
          </div>

          <div className="glass-card p-6 border border-[var(--border-subtle)] group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-[var(--text-disabled)] uppercase tracking-widest">Paid (MTD)</span>
              <div className="p-2 rounded-lg bg-[var(--status-success)]/10 text-[var(--status-success)] group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-[var(--status-success)]">{formatCurrency(totals.paid)}</div>
            <div className="mt-4 flex items-center justify-between">
               <span className="text-xs text-[var(--text-secondary)]">AI-recovered cashflow</span>
               <span className="text-[10px] font-bold text-[var(--status-success)] bg-[var(--status-success)]/10 px-2 py-0.5 rounded-full uppercase">+12% vs last month</span>
            </div>
          </div>

          <div className="glass-card p-6 border border-[var(--border-subtle)] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-cta)]/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-[var(--text-disabled)] uppercase tracking-widest">Efficiency</span>
              <div className="p-2 rounded-lg bg-[var(--brand-cta)]/10 text-[var(--brand-cta)] relative z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-[var(--text-primary)] relative z-10">94%</div>
            <div className="mt-4 flex items-center justify-between relative z-10">
               <span className="text-xs text-[var(--text-secondary)]">Optimal UI health</span>
               <span className="text-[10px] font-bold text-[var(--brand-cta)] bg-[var(--brand-cta)]/10 px-2 py-0.5 rounded-full uppercase">Level: Pro</span>
            </div>
          </div>
        </div>

        {/* Portfolio Table */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Invoice Portfolio</h2>
                <p className="text-xs text-[var(--text-secondary)] font-medium">Manage and track your global receivables with AI precision</p>
              </div>
              <div className="flex gap-3">
                 <Button variant="ghost" size="sm" onClick={() => window.print()}>
                   Download PDF
                 </Button>
                 <Button
                   variant="brand-primary"
                   size="sm"
                   data-testid="import-button"
                   onClick={() => setShowUploadModal(true)}
                 >
                   Import CSV
                 </Button>
              </div>
           </div>

           <InvoiceTable
             invoices={invoices}
             onBulkAction={(action, ids) => {
               addToast('info', `Bulk ${action} for ${ids.length} items queued`);
             }}
           />
        </div>
      </div>

      {/* Modern Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setImportStatus('idle');
          setPreviewRows([]);
        }}
        title="Import Receivables"
        size="xl"
        footer={
          (importStatus === 'previewing' || importStatus === 'committing') && (
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setImportStatus('idle')}>
                Cancel
              </Button>
              <Button
                variant="brand-primary"
                onClick={handleCommit}
                loading={importStatus === 'committing'}
                disabled={previewRows.filter(r => r.is_valid).length === 0}
              >
                Confirm & Import
              </Button>
            </div>
          )
        }
      >
        <div className="space-y-8 p-1">
          {importStatus === 'idle' && (
            <div className="space-y-6">
              <UploadZone onFileSelect={handleFileSelect} />
              <div className="bg-[var(--bg-base)] p-4 rounded-xl border border-[var(--border-default)] flex items-start gap-4">
                <div className="p-2 rounded-lg bg-[var(--status-info)]/10 text-[var(--status-info)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">CSV Format Requirements</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Your CSV must include headers: <code className="text-[var(--brand-primary)] bg-[var(--bg-overlay)] px-1 rounded">invoice_number</code>, <code className="text-[var(--brand-primary)] bg-[var(--bg-overlay)] px-1 rounded">contact_name</code>, <code className="text-[var(--brand-primary)] bg-[var(--bg-overlay)] px-1 rounded">amount</code>, and <code className="text-[var(--brand-primary)] bg-[var(--bg-overlay)] px-1 rounded">due_date</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {(importStatus === 'previewing' || importStatus === 'committing') && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between bg-[var(--bg-base)] p-4 rounded-xl border border-[var(--border-subtle)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)] font-bold font-mono">
                    {previewRows.filter(r => r.is_valid).length}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)]">Ready to Sync</h3>
                    <p className="text-xs text-[var(--text-secondary)]">Found {previewRows.length} total rows in CSV payload</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[var(--status-success)] bg-[var(--status-success)]/10 px-2 py-1 rounded-md uppercase">
                    {previewRows.filter(r => r.is_valid).length} Valid
                  </span>
                  {previewRows.filter(r => !r.is_valid).length > 0 && (
                    <span className="text-[10px] font-bold text-[var(--status-error)] bg-[var(--status-error)]/10 px-2 py-1 rounded-md uppercase">
                      {previewRows.filter(r => !r.is_valid).length} Errors
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-20 bg-[var(--bg-surface)]">
                      <tr className="border-b border-[var(--border-default)]">
                        <th className="p-4 text-[10px] font-bold text-[var(--text-disabled)] uppercase tracking-wider">Invoice #</th>
                        <th className="p-4 text-[10px] font-bold text-[var(--text-disabled)] uppercase tracking-wider">Contact Name</th>
                        <th className="p-4 text-[10px] font-bold text-[var(--text-disabled)] uppercase tracking-wider text-right">Amount</th>
                        <th className="p-4 text-[10px] font-bold text-[var(--text-disabled)] uppercase tracking-wider text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {previewRows.map((row, i) => {
                        const data = row.data as any;
                        const invNum = data.invoice_number || data['Invoice Number'] || data['Invoice #'] || '-';
                        const contactName = data.contact_name || data['Contact Name'] || data['Contact'] || data['Name'] || '-';
                        const amount = data.amount || data['Amount'] || data['Total'] || 0;

                        return (
                          <tr key={i} className={`hover:bg-[var(--bg-overlay)]/50 transition-colors ${!row.is_valid ? 'bg-[var(--status-error)]/[0.03]' : ''}`}>
                            <td className="p-4 text-sm font-mono font-bold text-[var(--text-primary)]">{invNum}</td>
                            <td className="p-4 text-sm text-[var(--text-secondary)]">{contactName}</td>
                            <td className="p-4 text-sm font-mono font-bold text-[var(--text-primary)] text-right">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount))}
                            </td>
                            <td className="p-4 text-center">
                              {row.is_valid ? (
                                <Badge status="success">Ready</Badge>
                              ) : (
                                <Badge status="danger">{row.is_duplicate ? 'Duplicate' : 'Invalid'}</Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </AppShell>
  );
}
