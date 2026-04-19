'use client';

import React, { useState, useEffect } from 'react';
import { ActionQueueService } from '../../../src/services/queue/ActionQueueService';
import { InvoicesService } from '../../../src/services/invoices/InvoicesService';
import { getCurrentAccount, supabase } from '../../../src/lib/supabase/client';
import { type ActionQueueItem, type ActionQueueStatus } from '../../../packages/shared/src/types/contracts';

/**
 * ACTION QUEUE PAGE (Phase 3 - Human Review Operating Surface)
 * Main interface for reviewing and approving AI-generated actions.
 */

type FilterStatus = ActionQueueStatus | 'all';
type FilterType = 'all' | 'classify_reply' | 'send_email';
type FilterPriority = 'all' | 'low' | 'medium' | 'high' | 'urgent';
type FilterReview = 'all' | 'required' | 'optional';

export default function ActionQueuePage() {
  const [items, setItems] = useState<ActionQueueItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ActionQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ActionQueueItem | null>(null);
  const [auditLog, setAuditLog] = useState<any[]>([]);

  const [accountId, setAccountId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isResolvingAccount, setIsResolvingAccount] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [filterReview, setFilterReview] = useState<FilterReview>('all');

  // Edit state
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [editedPromiseDate, setEditedPromiseDate] = useState('');

  // 1. Resolve Account Context
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

  // 2. Load Queue Data
  useEffect(() => {
    if (accountId) {
      loadQueue(accountId);
    }
  }, [accountId]);

  useEffect(() => {
    applyFilters();
  }, [items, filterStatus, filterType, filterPriority, filterReview]);

  const loadQueue = async (accId: string) => {
    try {
      setLoading(true);
      const data = await ActionQueueService.getQueue(accId);
      setItems(data);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.action_type === filterType);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(item => {
        const priorityValue = item.priority;
        const priority = typeof priorityValue === 'number'
          ? priorityValue
          : priorityValue === 'urgent'
            ? 10
            : priorityValue === 'high'
              ? 7
              : priorityValue === 'medium'
                ? 5
                : 3;

        if (filterPriority === 'urgent') return priority >= 10;
        if (filterPriority === 'high') return priority >= 7 && priority < 10;
        if (filterPriority === 'medium') return priority >= 4 && priority < 7;
        if (filterPriority === 'low') return priority < 4;
        return true;
      });
    }

    if (filterReview !== 'all') {
      filtered = filtered.filter(item =>
        filterReview === 'required' ? item.requires_human_review : !item.requires_human_review
      );
    }

    setFilteredItems(filtered);
  };

  const handleSelect = async (item: ActionQueueItem) => {
    setSelectedItem(item);

    // Initialize edit fields
    const payload = item.payload || {};
    setEditedSubject(payload.subject || '');
    setEditedBody(payload.body_text || '');
    setEditedPromiseDate(payload.promised_date || '');

    // Load audit log for this item
    try {
      const { data } = await supabase
        .from('audit_log')
        .select('*')
        .eq('entity_type', 'action_queue')
        .eq('entity_id', item.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setAuditLog(data || []);
    } catch (err) {
      console.error('Failed to load audit log:', err);
      setAuditLog([]);
    }
  };

  const handleApprove = async () => {
    if (!selectedItem || !accountId) return;
    try {
      await ActionQueueService.updateStatus(selectedItem.id, accountId, 'approved');
      await loadQueue(accountId);
      setSelectedItem(null);
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  const handleEdit = async () => {
    if (!selectedItem || !accountId) return;
    try {
      const newPayload = {
        ...selectedItem.payload,
        subject: editedSubject,
        body_text: editedBody,
        promised_date: editedPromiseDate
      };
      await ActionQueueService.updatePayload(selectedItem.id, accountId, newPayload);
      await loadQueue(accountId);
      setSelectedItem(null);
    } catch (err: any) {
      alert(`Edit failed: ${err.message}`);
    }
  };

  const handleSkip = async () => {
    if (!selectedItem || !accountId) return;
    try {
      await ActionQueueService.updateStatus(selectedItem.id, accountId, 'skipped');
      await loadQueue(accountId);
      setSelectedItem(null);
    } catch (err: any) {
      alert(`Skip failed: ${err.message}`);
    }
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 10) return 'URGENT';
    if (priority >= 7) return 'HIGH';
    if (priority >= 4) return 'MEDIUM';
    return 'LOW';
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 10) return 'bg-red-100 text-red-800 border-red-200';
    if (priority >= 7) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (priority >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  if (isResolvingAccount) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Loading account...</p>
      </div>
    );
  }

  if (authError || !accountId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-md text-center border border-red-200">
          <h2 className="font-bold text-lg mb-2">Access Denied</h2>
          <p className="text-sm">{authError || 'Missing account context.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Action Queue</h1>
          <p className="text-sm text-gray-600 mt-1">Review and approve AI-generated actions</p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending_review">Pending Review</option>
                <option value="edited">Edited</option>
                <option value="approved">Approved</option>
                <option value="skipped">Skipped</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="classify_reply">Classify Reply</option>
                <option value="send_email">Send Email</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Review Required</label>
              <select
                value={filterReview}
                onChange={(e) => setFilterReview(e.target.value as FilterReview)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Items</option>
                <option value="required">Review Required</option>
                <option value="optional">Review Optional</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Queue List */}
          <div className="flex-1">
            {loading ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500">
                Loading queue...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500">
                No items match the current filters.
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Priority</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Confidence</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Review</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Invoice/Client</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredItems.map((item) => {
                      const priorityValue = item.priority;
                      const priority = typeof priorityValue === 'number'
                        ? priorityValue
                        : priorityValue === 'urgent'
                          ? 10
                          : priorityValue === 'high'
                            ? 7
                            : priorityValue === 'medium'
                              ? 5
                              : 3;
                      const isSelected = selectedItem?.id === item.id;
                      const isDispute = item.payload?.classification?.category === 'dispute';

                      return (
                        <tr
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className={`cursor-pointer hover:bg-gray-50 transition ${
                            isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                          } ${isDispute ? 'bg-red-50' : ''} ${
                            item.requires_human_review && priority >= 7 ? 'font-semibold' : ''
                          }`}
                        >
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 text-xs font-bold uppercase rounded bg-blue-100 text-blue-700">
                              {item.action_type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm capitalize text-gray-700">
                            {item.status.replace('_', ' ')}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs font-bold uppercase rounded border ${getPriorityColor(priority)}`}>
                              {getPriorityLabel(priority)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`font-semibold ${
                              item.ai_confidence < 0.8 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {Math.round((item.ai_confidence || 0) * 100)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {item.requires_human_review ? (
                              <span className="px-2 py-1 text-xs font-bold uppercase rounded bg-yellow-100 text-yellow-800">
                                Required
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">Optional</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="space-y-0.5">
                              <div className="font-medium text-gray-900">
                                {item.invoice?.invoice_number || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.contact?.name || 'Unknown'}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {new Date(item.created_at).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="w-96 bg-white border border-gray-200 rounded-lg shadow-sm sticky top-6 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
            {selectedItem ? (
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="border-b pb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    Review {selectedItem.action_type.replace('_', ' ')}
                  </h2>
                  <div className="mt-2 space-y-1">
                    <div className="text-sm">
                      <span className="text-gray-600">Confidence:</span>{' '}
                      <span className={`font-bold ${
                        selectedItem.ai_confidence < 0.8 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {Math.round((selectedItem.ai_confidence || 0) * 100)}%
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Status:</span>{' '}
                      <span className="font-medium capitalize">{selectedItem.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Invoice Context */}
                {selectedItem.invoice && (
                  <div className="bg-gray-50 border border-gray-200 rounded p-3">
                    <div className="text-xs font-semibold text-gray-700 uppercase mb-2">Invoice Context</div>
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Number:</span> {selectedItem.invoice.invoice_number}</div>
                      <div><span className="font-medium">Amount:</span> ${(selectedItem.invoice.amount_cents / 100).toFixed(2)} {selectedItem.invoice.currency}</div>
                      <div><span className="font-medium">Status:</span> <span className="capitalize">{selectedItem.invoice.status}</span></div>
                      <div><span className="font-medium">Due:</span> {selectedItem.invoice.due_date}</div>
                    </div>
                  </div>
                )}

                {/* Contact Context */}
                {selectedItem.contact && (
                  <div className="bg-gray-50 border border-gray-200 rounded p-3">
                    <div className="text-xs font-semibold text-gray-700 uppercase mb-2">Contact Context</div>
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Name:</span> {selectedItem.contact.name}</div>
                      {selectedItem.contact.email && (
                        <div><span className="font-medium">Email:</span> {selectedItem.contact.email}</div>
                      )}
                      {selectedItem.contact.phone && (
                        <div><span className="font-medium">Phone:</span> {selectedItem.contact.phone}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Output - Classification */}
                {selectedItem.action_type === 'classify_reply' && selectedItem.payload?.classification && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="text-xs font-semibold text-blue-900 uppercase mb-2">Classification Result</div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Category:</span>{' '}
                        <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-blue-200 text-blue-900">
                          {selectedItem.payload.classification.category}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Confidence:</span>{' '}
                        {Math.round(selectedItem.payload.classification.confidence * 100)}%
                      </div>
                      {selectedItem.payload.email_body && (
                        <div className="mt-3">
                          <div className="font-medium mb-1">Email Body:</div>
                          <div className="text-xs bg-white border border-blue-200 rounded p-2 max-h-32 overflow-y-auto">
                            {selectedItem.payload.email_body}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Output - Draft Email */}
                {selectedItem.action_type === 'send_email' && selectedItem.payload?.draft && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Body
                      </label>
                      <textarea
                        value={editedBody}
                        onChange={(e) => setEditedBody(e.target.value)}
                        rows={12}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      />
                    </div>
                    {selectedItem.payload.draft.rationale && (
                      <div className="text-xs text-gray-600 italic bg-gray-50 border border-gray-200 rounded p-2">
                        <span className="font-semibold">Rationale:</span> {selectedItem.payload.draft.rationale}
                      </div>
                    )}
                  </div>
                )}

                {/* AI Output - Promise Extraction */}
                {selectedItem.payload?.promised_date && (
                  <div className="bg-orange-50 border border-orange-200 rounded p-3">
                    <div className="text-xs font-semibold text-orange-900 uppercase mb-2">Extracted Promise</div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Promised Date
                        </label>
                        <input
                          type="date"
                          value={editedPromiseDate}
                          onChange={(e) => setEditedPromiseDate(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      {selectedItem.payload.amount_cents && (
                        <div>
                          <span className="font-medium">Amount:</span> ${(selectedItem.payload.amount_cents / 100).toFixed(2)}
                        </div>
                      )}
                      {selectedItem.payload.rationale && (
                        <div className="text-xs text-gray-600 italic mt-2">
                          <span className="font-semibold">Rationale:</span> {selectedItem.payload.rationale}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Audit Log */}
                {auditLog.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="text-xs font-semibold text-gray-700 uppercase mb-2">Recent Activity</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {auditLog.map((log, idx) => (
                        <div key={idx} className="text-xs bg-gray-50 border border-gray-200 rounded p-2">
                          <div className="font-semibold text-gray-900">{log.action}</div>
                          <div className="text-gray-600 mt-0.5">
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="text-gray-500 mt-1 font-mono text-[10px]">
                              {JSON.stringify(log.metadata, null, 2)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t pt-4 space-y-3">
                  {selectedItem.status === 'pending_review' && (
                    <>
                      <button
                        onClick={handleEdit}
                        className="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition"
                      >
                        Save Edits & Mark as Edited
                      </button>
                      <button
                        onClick={handleApprove}
                        className="w-full py-2.5 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-700 transition"
                      >
                        Approve (No Changes)
                      </button>
                      <button
                        onClick={handleSkip}
                        className="w-full py-2.5 bg-gray-200 text-gray-700 text-sm font-bold rounded hover:bg-gray-300 transition"
                      >
                        Skip This Action
                      </button>
                    </>
                  )}
                  {selectedItem.status === 'edited' && (
                    <button
                      onClick={handleApprove}
                      className="w-full py-2.5 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-700 transition"
                    >
                      Approve Edited Version
                    </button>
                  )}
                  {(selectedItem.status === 'approved' || selectedItem.status === 'sent') && (
                    <div className="text-sm text-gray-600 text-center py-4">
                      This item has been {selectedItem.status}.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400">
                <p className="text-sm">Select an item from the queue to review.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
