'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../../components/layout/AppShell';
import { CsvIngestionService, type ImportPreviewRow } from '../../../src/services/ingestion/CsvIngestionService';
import { InvoicesService } from '../../../src/services/invoices/InvoicesService';
import { getCurrentAccount } from '../../../src/lib/supabase/client';

/**
 * INVOICES PAGE (Hardened Phase 2 & 3)
 * Real CSV Upload -> Preview -> Commit.
 */

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'previewing' | 'committing' | 'complete'>('idle');
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [importResult, setImportResult] = useState<{ success: number, failed: number } | null>(null);

  const [accountId, setAccountId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isResolvingAccount, setIsResolvingAccount] = useState(true);

  useEffect(() => {
    async function resolveAccount() {
      try {
        const account = await getCurrentAccount();
        if (account) {
          setAccountId(account.id);
        } else {
          setAuthError('Authentication or membership missing. Please log in.');
        }
      } catch (err: any) {
        setAuthError(`Failed to resolve account: ${err.message}`);
      } finally {
        setIsResolvingAccount(false);
      }
    }
    resolveAccount();
  }, []);

  // Load invoices from DB on mount
  useEffect(() => {
    if (accountId) {
      loadInvoices(accountId);
    }
  }, [accountId, importStatus]);

  const loadInvoices = (accId: string) => {
    InvoicesService.getByAccount(accId).then(setInvoices).catch(err => console.error("Failed to load invoices", err));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !accountId) return;

    try {
      const rawRows = await CsvIngestionService.parseFile(file);
      const preview = await CsvIngestionService.validateImport(rawRows, accountId);
      setPreviewRows(preview);
      setImportStatus('previewing');
      setImportResult(null);
    } catch (err: any) {
      alert('Failed to parse CSV: ' + err.message);
    }

    // Reset file input
    event.target.value = '';
  };

  const handleCommit = async () => {
    if (!accountId) return;
    setImportStatus('committing');
    try {
      const result = await CsvIngestionService.commitImport(previewRows, accountId);
      setImportResult({
        success: result.count,
        failed: previewRows.length - result.count
      });
      alert(`Import complete: ${result.count} invoices imported, ${result.queue_items_created || 0} queue items auto-generated.`);
      setImportStatus('complete');
    } catch (err: any) {
      alert('Import failed: ' + err.message);
      setImportStatus('previewing');
    }
  };

  if (isResolvingAccount) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading account...</p>
        </div>
      </AppShell>
    );
  }

  if (authError || !accountId) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-md text-center border border-red-200">
            <h2 className="font-bold text-lg mb-2">Access Denied</h2>
            <p className="text-sm">{authError || 'Missing account context.'}</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Invoices ({invoices.length})</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your accounts receivable</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="file"
                id="csv-upload"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import CSV
              </label>
            </div>
          </div>
        </div>

        {/* Required Headers Info */}
        {importStatus === 'idle' && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold mb-1">CSV Format Requirements</p>
              <p>Your CSV must include the following headers: <code className="bg-blue-100 px-1 rounded">invoice_number</code>, <code className="bg-blue-100 px-1 rounded">contact_name</code>, <code className="bg-blue-100 px-1 rounded">amount</code>, <code className="bg-blue-100 px-1 rounded">due_date</code> (YYYY-MM-DD), <code className="bg-blue-100 px-1 rounded">issued_date</code> (YYYY-MM-DD).</p>
            </div>
          </div>
        )}

        {/* Import Summary */}
        {importStatus === 'complete' && importResult && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold text-lg">Import Successful</h3>
                <p className="text-sm">
                  Successfully imported {importResult.success} invoices.
                  {importResult.failed > 0 && ` Skipped ${importResult.failed} invalid rows.`}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <a href="/action-queue" className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700 transition">
                View Action Queue
              </a>
              <button
                onClick={() => setImportStatus('idle')}
                className="px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded hover:bg-green-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Preview Panel */}
        {importStatus === 'previewing' && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col max-h-[600px]">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-gray-900">Import Preview</h3>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-green-600">{previewRows.filter(r => r.is_valid).length} valid rows</span> ready to import.
                  {previewRows.filter(r => !r.is_valid).length > 0 && (
                    <span className="text-red-600 ml-2">{previewRows.filter(r => !r.is_valid).length} rows have errors.</span>
                  )}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded hover:bg-gray-200 transition"
                  onClick={() => setImportStatus('idle')}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCommit}
                  disabled={previewRows.filter(r => r.is_valid).length === 0}
                >
                  Confirm Import
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 text-left">Inv #</th>
                    <th className="px-6 py-3 text-left">Contact</th>
                    <th className="px-6 py-3 text-left">Amount</th>
                    <th className="px-6 py-3 text-left">Due Date</th>
                    <th className="px-6 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {previewRows.map((row, i) => (
                    <tr key={i} className={row.is_valid ? 'hover:bg-gray-50' : 'bg-red-50 hover:bg-red-100'}>
                      <td className="px-6 py-3 font-medium text-gray-900">{row.data.invoice_number || '-'}</td>
                      <td className="px-6 py-3 text-gray-600">{row.data.contact_name || '-'}</td>
                      <td className="px-6 py-3 text-gray-900">${row.data.amount !== undefined ? Number(row.data.amount).toFixed(2) : '-'}</td>
                      <td className="px-6 py-3 text-gray-600">{row.data.due_date || '-'}</td>
                      <td className="px-6 py-3">
                        {row.is_valid ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Ready
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 w-fit">
                              {row.is_duplicate ? 'Duplicate' : 'Invalid'}
                            </span>
                            <span className="text-xs text-red-600 max-w-xs truncate" title={row.errors.join(' | ')}>
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

        {/* Existing Invoices List */}
        {importStatus !== 'previewing' && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {invoices.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">Number</th>
                    <th className="px-6 py-3 text-left">Contact</th>
                    <th className="px-6 py-3 text-left">Amount</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Due Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{inv.invoice_number}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {inv.contacts?.[0]?.contact?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        ${(inv.amount_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${inv.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{new Date(inv.due_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-16 flex flex-col items-center justify-center text-center">
                <div className="bg-gray-100 rounded-full p-4 mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No invoices found</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Upload a CSV file to import your existing invoices and contacts into Payd AI.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}