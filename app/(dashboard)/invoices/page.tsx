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

// Lazy load heavy components
const InvoiceTable = dynamic(() => import('../../../components/invoice/InvoiceTable').then(mod => ({ default: mod.InvoiceTable })), {
  loading: () => (
    <table className="w-full">
      <tbody>
        {[...Array(8)].map((_, i) => <SkeletonTableRow key={i} />)}
      </tbody>
    </table>
  ),
  ssr: false
});

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

  const handleFileSelect = async (file: File) => {
    if (!accountId) return;

    try {
      addToast('info', 'Processing CSV file...');
      trackEvent(accountId, 'csv_file_selected', { fileName: file.name, fileSize: file.size });

      const rawRows = await CsvIngestionService.parseFile(file);
      const preview = await CsvIngestionService.validateImport(rawRows, accountId);

      const errorCount = preview.filter(r => !r.is_valid).length;
      trackEvent(accountId, 'csv_preview_rendered', {
        totalRows: preview.length,
        validRows: preview.length - errorCount,
        errorCount
      });

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
    trackEvent(accountId, 'csv_import_started', { rowCount: previewRows.length });

    try {
      const result = await CsvIngestionService.commitImport(previewRows, accountId);
      trackEvent(accountId, 'csv_import_succeeded', { successCount: result.count });

      addToast('success', `Successfully imported ${result.count} invoices`);
      setImportStatus('complete');
      setShowUploadModal(false);
      loadInvoices(accountId);
    } catch (err: any) {
      console.error('[CSV] Commit failed:', err);
      trackEvent(accountId, 'csv_import_failed', { error: err.message });
      addToast('error', 'Import failed: ' + err.message);
      setImportStatus('previewing');
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1">Invoices</h1>
            <p className="text-body mt-2" style={{ color: 'var(--text-secondary)' }}>
              {invoices.length} total invoices
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowUploadModal(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import CSV
          </Button>
        </div>

        {/* Invoices Table */}
        <div
          className="rounded-xl p-6"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <InvoiceTable invoices={invoices} />
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
      >
        {importStatus === 'idle' && (
          <div className="space-y-6">
            <UploadZone onFileSelect={handleFileSelect} />
            <div
              className="p-4 rounded-lg"
              style={{
                background: 'var(--info-bg)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              <p className="text-small" style={{ color: 'var(--text-primary)' }}>
                <strong>CSV Format Requirements:</strong> Your CSV must include headers:
                <code className="mx-1 px-2 py-0.5 rounded" style={{ background: 'var(--bg-elevated)' }}>
                  invoice_number
                </code>,
                <code className="mx-1 px-2 py-0.5 rounded" style={{ background: 'var(--bg-elevated)' }}>
                  contact_name
                </code>,
                <code className="mx-1 px-2 py-0.5 rounded" style={{ background: 'var(--bg-elevated)' }}>
                  amount
                </code>,
                <code className="mx-1 px-2 py-0.5 rounded" style={{ background: 'var(--bg-elevated)' }}>
                  due_date
                </code>,
                <code className="mx-1 px-2 py-0.5 rounded" style={{ background: 'var(--bg-elevated)' }}>
                  issued_date
                </code>
              </p>
            </div>
          </div>
        )}

        {(importStatus === 'previewing' || importStatus === 'committing') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-h3">Preview Import</h3>
                <p className="text-small mt-1" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success)' }}>
                    {previewRows.filter(r => r.is_valid).length} valid
                  </span>
                  {previewRows.filter(r => !r.is_valid).length > 0 && (
                    <span style={{ color: 'var(--danger)' }} className="ml-2">
                      {previewRows.filter(r => !r.is_valid).length} errors
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setImportStatus('idle')}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCommit}
                  loading={importStatus === 'committing'}
                  disabled={previewRows.filter(r => r.is_valid).length === 0}
                >
                  Confirm Import
                </Button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto rounded-lg border" style={{ borderColor: 'var(--border-subtle)' }}>
              <table className="w-full">
                <thead className="sticky top-0" style={{ background: 'var(--bg-elevated)' }}>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <th className="px-4 py-3 text-left text-label" style={{ color: 'var(--text-secondary)' }}>Invoice #</th>
                    <th className="px-4 py-3 text-left text-label" style={{ color: 'var(--text-secondary)' }}>Contact</th>
                    <th className="px-4 py-3 text-right text-label" style={{ color: 'var(--text-secondary)' }}>Amount</th>
                    <th className="px-4 py-3 text-left text-label" style={{ color: 'var(--text-secondary)' }}>Due Date</th>
                    <th className="px-4 py-3 text-left text-label" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: row.is_valid ? 'transparent' : 'var(--danger-bg)',
                      }}
                    >
                      <td className="px-4 py-3 text-small" style={{ color: 'var(--text-primary)' }}>
                        {row.data.invoice_number || '-'}
                      </td>
                      <td className="px-4 py-3 text-small" style={{ color: 'var(--text-secondary)' }}>
                        {row.data.contact_name || '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-mono" style={{ color: 'var(--text-primary)' }}>
                        ${row.data.amount !== undefined ? Number(row.data.amount).toFixed(2) : '-'}
                      </td>
                      <td className="px-4 py-3 text-small" style={{ color: 'var(--text-secondary)' }}>
                        {row.data.due_date || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {row.is_valid ? (
                          <Badge status="paid">Ready</Badge>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <Badge status="overdue">{row.is_duplicate ? 'Duplicate' : 'Invalid'}</Badge>
                            <span className="text-small" style={{ color: 'var(--danger)' }}>
                              {row.errors[0]}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
