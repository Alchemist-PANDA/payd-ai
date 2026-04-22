'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AppShell } from '../../../components/layout/AppShell';
import { CsvIngestionService, type ImportPreviewRow } from '../../../src/services/ingestion/CsvIngestionService';
import { InvoicesService } from '../../../src/services/invoices/InvoicesService';
import { getCurrentAccount } from '../../../src/lib/supabase/client';
import { trackEvent } from '../../../src/lib/telemetry';
import { Button } from '../../../components/ui/Button';
import { Badge, BadgeStatus } from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';
import { SkeletonTableRow } from '../../../components/ui/Skeleton';
import { InvoiceTable, type Invoice } from '../../../components/invoice/InvoiceTable';

// Lazy load heavy components
const Modal = dynamic(() => import('../../../components/ui/Modal').then(mod => ({ default: mod.Modal })), {
  ssr: false
});

const UploadZone = dynamic(() => import('../../../components/upload/UploadZone').then(mod => ({ default: mod.UploadZone })), {
  loading: () => <div className="skeleton h-64 rounded-lg" />,
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
          loadInvoices(account.id);
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[#00D4AA] border-t-transparent rounded-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 space-y-8 bg-[#0A0B0E] min-h-screen text-white">
        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0F1115] p-6 rounded-2xl border border-[#1F242F] shadow-lg hover:border-[#00D4AA] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Total Outstanding</span>
              <span className="text-xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-white">{formatCurrency(totals.pending + totals.overdue)}</div>
            <div className="mt-2 text-xs text-[#00D4AA] font-medium bg-[#00D4AA]/10 inline-block px-2 py-1 rounded-full">
              {invoices.length} total invoices
            </div>
          </div>

          <div className="bg-[#0F1115] p-6 rounded-2xl border border-[#1F242F] shadow-lg hover:border-[#FF4D4F] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Overdue</span>
              <span className="text-xl">⚠️</span>
            </div>
            <div className="text-3xl font-bold text-[#FF4D4F]">{formatCurrency(totals.overdue)}</div>
            <div className="mt-2 text-xs text-[#FF4D4F] font-medium bg-[#FF4D4F]/10 inline-block px-2 py-1 rounded-full">
              Action required
            </div>
          </div>

          <div className="bg-[#0F1115] p-6 rounded-2xl border border-[#1F242F] shadow-lg hover:border-[#30D158] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Paid (MTD)</span>
              <span className="text-xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-[#30D158]">{formatCurrency(totals.paid)}</div>
            <div className="mt-2 text-xs text-[#30D158] font-medium bg-[#30D158]/10 inline-block px-2 py-1 rounded-full">
              Recovered by AI
            </div>
          </div>

          <div className="bg-[#0F1115] p-6 rounded-2xl border border-[#1F242F] shadow-lg hover:border-[#00D4AA] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Efficiency</span>
              <span className="text-xl">📈</span>
            </div>
            <div className="text-3xl font-bold text-[#00D4AA]">94%</div>
            <div className="mt-2 text-xs text-[#00D4AA] font-medium bg-[#00D4AA]/10 inline-block px-2 py-1 rounded-full">
              Optimal health
            </div>
          </div>
        </div>

        {/* Main Table Section */}
        <div className="bg-[#0F1115] rounded-2xl border border-[#1F242F] shadow-xl overflow-hidden">
          <div className="p-6 border-b border-[#1F242F] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Invoice Portfolio</h2>
              <p className="text-sm text-gray-400 mt-1">Manage and track your global receivables</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" className="bg-[#1F242F] border-none hover:bg-[#2D3441] text-white">
                Download PDF
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowUploadModal(true)} className="bg-[#00D4AA] hover:bg-[#00B894] text-black font-bold">
                Import CSV
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <InvoiceTable
              invoices={invoices}
              onBulkAction={(action, ids) => {
                console.log('Bulk action:', action, ids);
                addToast('info', `Bulk ${action} for ${ids.length} items`);
              }}
            />
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setImportStatus('idle');
          setPreviewRows([]);
        }}
        title="Import Invoices"
        size="xl"
        footer={
          (importStatus === 'previewing' || importStatus === 'committing') && (
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={() => setImportStatus('idle')} className="text-gray-400 hover:text-white">
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCommit}
                loading={importStatus === 'committing'}
                disabled={previewRows.filter(r => r.is_valid).length === 0}
                className="bg-[#00D4AA] hover:bg-[#00B894] text-black font-bold px-6"
              >
                Confirm Import
              </Button>
            </div>
          )
        }
      >
        <div className="p-6 bg-[#0F1115]">
          {importStatus === 'idle' && (
            <div className="space-y-6">
              <UploadZone onFileSelect={handleFileSelect} />
              <div className="bg-[#0A0B0E] p-4 rounded-xl border border-[#1F242F]">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <span className="text-[#00D4AA]">ℹ️</span>
                  <strong>CSV Requirements:</strong> invoice_number, contact_name, amount, due_date
                </p>
              </div>
            </div>
          )}

          {(importStatus === 'previewing' || importStatus === 'committing') && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between bg-[#0A0B0E] p-4 rounded-xl border border-[#1F242F]">
                <div>
                  <h3 className="text-lg font-bold text-white">Preview Import</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-medium text-[#30D158] bg-[#30D158]/10 px-2 py-0.5 rounded-full">
                      {previewRows.filter(r => r.is_valid).length} valid
                    </span>
                    <span className="text-xs font-medium text-[#FF4D4F] bg-[#FF4D4F]/10 px-2 py-0.5 rounded-full">
                      {previewRows.filter(r => !r.is_valid).length} errors
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0A0B0E] rounded-xl border border-[#1F242F] overflow-hidden">
                <div className="overflow-x-auto max-h-[450px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-20 bg-[#1F242F]">
                      <tr>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#2D3441]">Invoice #</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#2D3441]">Contact</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#2D3441] text-right">Amount</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#2D3441]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F242F]">
                      {previewRows.map((row, i) => {
                        const invNum = row.data.invoice_number || (row.data as any)['Invoice Number'] || (row.data as any)['Invoice #'] || '-';
                        const contactName = row.data.contact_name || (row.data as any)['Contact Name'] || (row.data as any)['Contact'] || (row.data as any)['Name'] || '-';
                        const amount = row.data.amount || (row.data as any)['Amount'] || (row.data as any)['Total'] || 0;

                        return (
                          <tr key={i} className={`hover:bg-[#1F242F]/50 transition-colors ${!row.is_valid ? 'bg-[#FF4D4F]/5' : ''}`}>
                            <td className="p-4 text-sm font-medium text-white">{invNum}</td>
                            <td className="p-4 text-sm text-gray-400">{contactName}</td>
                            <td className="p-4 text-sm font-bold text-white text-right">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount))}
                            </td>
                            <td className="p-4">
                              {row.is_valid ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#30D158]/10 text-[#30D158]">
                                  Ready
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF4D4F]/10 text-[#FF4D4F]">
                                  {row.is_duplicate ? 'Duplicate' : 'Invalid'}
                                </span>
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
