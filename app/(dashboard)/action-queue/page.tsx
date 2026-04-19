'use client';

import React, { useState, useEffect } from 'react';
import { ActionQueueService } from '../../../src/services/queue/ActionQueueService';
import { InvoicesService } from '../../../src/services/invoices/InvoicesService';
import { getCurrentAccount, supabase } from '../../../src/lib/supabase/client';
import { trackEvent } from '../../../src/lib/telemetry';
import { type ActionQueueItem, type ActionQueueStatus } from '../../../packages/shared/src/types/contracts';
import { AppShell } from '../../../components/layout/AppShell';

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

  // Action state
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
    let mounted = true;
    async function resolveAccount() {
      try {
        const account = await getCurrentAccount();
        if (mounted) {
          if (account) {
            setAccountId(account.id);
          } else {
            setAuthError('Authentication or membership missing. Please log in.');
          }
        }
      } catch (err: any) {
        if (mounted) setAuthError(`Failed to resolve account: ${err.message}`);
      } finally {
        if (mounted) setIsResolvingAccount(false);
      }
    }
    resolveAccount();
    return () => { mounted = false; };
  }, []);

  // 1.1 Auto-dismiss feedback
  useEffect(() => {
    if (actionSuccess || actionError) {
      const timer = setTimeout(() => {
        setActionSuccess(null);
        setActionError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess, actionError]);

  // 2. Load Queue Data
  useEffect(() => {
    if (accountId) {
      loadQueue(accountId);
      trackEvent(accountId, 'action_queue_page_viewed');
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
    if (accountId) {
      trackEvent(accountId, 'queue_item_selected', {
        itemId: item.id,
        actionType: item.action_type,
        status: item.status
      });
    }

    // Initialize edit fields - AI drafts are nested in payload.draft
    const payload = item.payload || {};
    const draft = payload.draft || {};

    setEditedSubject(draft.subject || payload.subject || '');
    setEditedBody(draft.body_text || payload.body_text || '');
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
    if (!selectedItem || !accountId || isUpdating) return;
    setIsUpdating(true);
    setActionError(null);
    try {
      await ActionQueueService.updateStatus(selectedItem.id, accountId, 'approved');
      trackEvent(accountId, 'queue_item_approved', { itemId: selectedItem.id });
      setActionSuccess('Action approved successfully');
      await loadQueue(accountId);
      setSelectedItem(null);
    } catch (err: any) {
      setActionError(`Approval failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedItem || !accountId || isUpdating) return;
    setIsUpdating(true);
    setActionError(null);
    try {
      const newPayload = {
        ...selectedItem.payload,
        draft: {
          ...(selectedItem.payload?.draft || {}),
          subject: editedSubject,
          body_text: editedBody
        },
        promised_date: editedPromiseDate
      };
      await ActionQueueService.updatePayload(selectedItem.id, accountId, newPayload);
      trackEvent(accountId, 'queue_item_edited', { itemId: selectedItem.id });
      setActionSuccess('Edits saved successfully');
      await loadQueue(accountId);
      setSelectedItem(null);
    } catch (err: any) {
      setActionError(`Edit failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSend = async () => {
    if (!selectedItem || !accountId || isUpdating) return;
    setIsUpdating(true);
    setActionError(null);
    try {
      await ActionQueueService.updateStatus(selectedItem.id, accountId, 'sent', { method: 'manual_send' });
      trackEvent(accountId, 'queue_item_sent', { itemId: selectedItem.id });
      setActionSuccess('Action marked as completed');
      await loadQueue(accountId);
      setSelectedItem(null);
    } catch (err: any) {
      setActionError(`Send failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSkip = async () => {
    if (!selectedItem || !accountId || isUpdating) return;
    setIsUpdating(true);
    setActionError(null);
    try {
      await ActionQueueService.updateStatus(selectedItem.id, accountId, 'skipped');
      trackEvent(accountId, 'queue_item_dismissed', { itemId: selectedItem.id });
      setActionSuccess('Action dismissed');
      await loadQueue(accountId);
      setSelectedItem(null);
    } catch (err: any) {
      setActionError(`Dismiss failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusLabel = (status: ActionQueueStatus | string) => {
    switch (status) {
      case 'pending_review': return 'Needs Review';
      case 'edited': return 'Edited';
      case 'approved': return 'Approved (Pending Send)';
      case 'skipped': return 'Dismissed';
      case 'sent': return 'Completed';
      case 'failed': return 'Action Error';
      case 'archived': return 'Archived';
      default: return (status as string).replace('_', ' ');
    }
  };

  const getStatusColor = (status: ActionQueueStatus) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'edited': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'skipped': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'sent': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case 'classify_reply': return 'Reply Classification';
      case 'send_email': return 'Email Reminder';
      default: return type.replace('_', ' ');
    }
  };

  const getAuditActionLabel = (action: string) => {
    switch (action) {
      case 'scheduler.stage.triggered': return 'Reminder stage triggered';
      case 'scheduler.invoice.skipped': return 'Reminder stage skipped';
      case 'queue_item.created': return 'Action item created';
      case 'queue_item.updated': return 'Action item updated';
      case 'queue_item.approved': return 'Action approved';
      case 'queue_item.skipped': return 'Action dismissed';
      case 'queue_item.sent': return 'Email sent';
      default: return action.replace('.', ' ').replace('_', ' ');
    }
  };

  const getSkipReasonLabel = (reason: string) => {
    switch (reason) {
      case 'paid_or_void': return 'Invoice already paid or voided';
      case 'active_promise': return 'Active payment promise exists';
      case 'dispute_exists': return 'Active dispute being reviewed';
      case 'idempotent_conflict': return 'Already processed today';
      default: return reason.replace('_', ' ');
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 10) return 'bg-red-50 text-red-700 border-red-200';
    if (priority >= 7) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (priority >= 4) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 10) return 'Urgent';
    if (priority >= 7) return 'High';
    if (priority >= 4) return 'Medium';
    return 'Low';
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-bold">BETA MODE:</span> This system is in simulation mode.
                  <strong> No real emails will be delivered.</strong>
                  All workflows are manual, and AI-driven autonomous decisions are disabled.
                </p>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Action Queue</h1>
          <p className="text-sm text-gray-600 mt-1">
            <strong>Review-First Mode:</strong> All AI-generated actions must be reviewed and approved by you before being sent.
          </p>
        </div>

        {isResolvingAccount ? (
          <div className="flex items-center justify-center h-64 bg-white border border-gray-200 rounded-lg shadow-sm">
            <p className="text-gray-500">Resolving account context...</p>
          </div>
        ) : authError || !accountId ? (
          <div className="flex items-center justify-center h-64 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-md text-center border border-red-200">
              <h2 className="font-bold text-lg mb-2">Access Denied</h2>
              <p className="text-sm">{authError || 'Missing account context.'}</p>
            </div>
          </div>
        ) : (
          <>
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
                    <option value="pending_review">Needs Review</option>
                    <option value="edited">Edited</option>
                    <option value="approved">Approved</option>
                    <option value="skipped">Dismissed</option>
                    <option value="sent">Completed</option>
                    <option value="failed">Error</option>
                    <option value="archived">Archived</option>
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
                  <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Your queue is empty</h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                      New actions will appear here after you import a CSV or when the next automated reminder stage is triggered.
                    </p>
                    <div className="mt-6">
                      <a
                        href="/invoices"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Import Invoices
                      </a>
                    </div>
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
                                  className={`cursor-pointer hover:bg-gray-50 transition border-l-4 ${
                                    isSelected
                                      ? 'bg-blue-50 border-l-blue-600 shadow-sm'
                                      : 'border-l-transparent'
                                  } ${isDispute ? 'bg-red-50' : ''} ${
                                    item.requires_human_review && priority >= 7 ? 'font-semibold' : ''
                                  }`}
                                >
                              <td className="px-4 py-3 text-sm">
                                <span className="px-2 py-1 text-xs font-bold uppercase rounded bg-blue-100 text-blue-700">
                                  {getActionTypeLabel(item.action_type)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-2 py-1 text-xs font-bold uppercase rounded border ${getStatusColor(item.status)}`}>
                                  {getStatusLabel(item.status)}
                                </span>
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
                    {/* Feedback Banners */}
                    {actionSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {actionSuccess}
                      </div>
                    )}
                    {actionError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {actionError}
                      </div>
                    )}

                    {/* Header */}
                    <div className="border-b pb-4">
                      <h2 className="text-lg font-bold text-gray-900">
                        Review {getActionTypeLabel(selectedItem.action_type)}
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
                          <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded border ${getStatusColor(selectedItem.status)}`}>
                            {getStatusLabel(selectedItem.status)}
                          </span>
                        </div>
                        {selectedItem.payload?.is_fallback && (
                          <div className="mt-2">
                            <span className="px-2 py-1 text-xs font-bold uppercase rounded bg-gray-100 text-gray-600 border border-gray-200">
                              {selectedItem.payload.fallback_label || 'Auto-generated (no AI)'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Invoice Context */}
                    {selectedItem.invoice && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Invoice Context</div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500 text-xs mb-0.5">Number</div>
                            <div className="font-semibold text-gray-900">{selectedItem.invoice.invoice_number}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs mb-0.5">Amount</div>
                            <div className="font-semibold text-gray-900">
                              ${(selectedItem.invoice.amount_cents / 100).toFixed(2)} {selectedItem.invoice.currency}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs mb-0.5">Status</div>
                            <div className="capitalize font-semibold text-gray-900">{selectedItem.invoice.status}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs mb-0.5">Due Date</div>
                            <div className="font-semibold text-gray-900">{selectedItem.invoice.due_date}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contact Context */}
                    {selectedItem.contact && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Contact Context</div>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                              {selectedItem.contact.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{selectedItem.contact.name}</div>
                              {selectedItem.contact.email && (
                                <div className="text-gray-500 text-xs">{selectedItem.contact.email}</div>
                              )}
                            </div>
                          </div>
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

	                    {/* Audit Log Timeline */}
	                    {auditLog.length > 0 && (
	                      <div className="border-t pt-4">
	                        <div className="text-xs font-semibold text-gray-700 uppercase mb-4 tracking-wider">Activity History</div>
	                        <div className="relative border-l-2 border-gray-100 ml-2 pl-6 space-y-6 py-2 max-h-64 overflow-y-auto pr-2">
	                          {auditLog.map((log, idx) => (
	                            <div key={idx} className="relative group">
	                              {/* Timeline Dot */}
	                              <div className={`absolute -left-[31px] mt-1.5 h-4 w-4 rounded-full border-2 border-white shadow-sm transition-colors ${
                                  log.action.includes('sent') ? 'bg-purple-500' :
                                  log.action.includes('approved') ? 'bg-green-500' :
                                  log.action.includes('skipped') ? 'bg-gray-400' :
                                  'bg-blue-500'
                                }`} />

	                              <div className="text-xs">
	                                <div className="font-bold text-gray-900 leading-tight">{getAuditActionLabel(log.action)}</div>
	                                <div className="text-gray-500 mt-1 text-[10px]">
	                                  {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
	                                </div>

	                                {log.metadata?.skip_reason && (
	                                  <div className="mt-2 text-red-600 font-medium italic bg-red-50 px-2 py-1 rounded inline-block">
	                                    Reason: {getSkipReasonLabel(log.metadata.skip_reason)}
	                                  </div>
	                                )}

                                  {log.metadata?.method === 'manual_send' && (
                                    <div className="mt-1 text-purple-600 font-medium italic">
                                      Manual send verified
                                    </div>
                                  )}

	                                {log.metadata && Object.keys(log.metadata).filter(k => k !== 'skip_reason' && k !== 'method').length > 0 && (
	                                  <div className="mt-2 text-gray-400 font-mono text-[9px] bg-gray-50 p-1.5 rounded border border-gray-100 hidden group-hover:block transition-all">
	                                    {JSON.stringify(Object.fromEntries(Object.entries(log.metadata).filter(([k]) => k !== 'skip_reason' && k !== 'method')), null, 2)}
	                                  </div>
	                                )}
	                              </div>
	                            </div>
	                          ))}
	                        </div>
	                      </div>
	                    )}

	                    {/* Actions */}
                    <div className="border-t pt-6 space-y-4">
                      {selectedItem.status === 'pending_review' && (
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <button
                              onClick={handleApprove}
                              disabled={isUpdating}
                              className="flex-1 py-3 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isUpdating ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              onClick={handleEdit}
                              disabled={isUpdating}
                              className="flex-1 py-3 bg-white border border-blue-600 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isUpdating ? 'Saving...' : 'Save Edits'}
                            </button>
                          </div>
                          <button
                            onClick={handleSkip}
                            disabled={isUpdating}
                            className="w-full py-2 text-gray-400 text-xs font-semibold hover:text-red-500 transition uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? 'Dismissing...' : 'Dismiss This Action'}
                          </button>
                        </div>
                      )}
                      {selectedItem.status === 'edited' && (
                        <div className="space-y-3">
                          <button
                            onClick={handleApprove}
                            disabled={isUpdating}
                            className="w-full py-3 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? 'Approving...' : 'Approve Edited Version'}
                          </button>
                          <button
                            onClick={handleSkip}
                            disabled={isUpdating}
                            className="w-full py-2 text-gray-400 text-xs font-semibold hover:text-red-500 transition uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? 'Dismissing...' : 'Dismiss This Action'}
                          </button>
                        </div>
                      )}
                      {selectedItem.status === 'approved' && (
                        <div className="space-y-3">
                          <div className="text-xs text-green-700 font-bold text-center py-3 bg-green-50 rounded-lg border border-green-200 mb-2 uppercase tracking-wide">
                            Ready for manual send
                          </div>
                          <button
                            onClick={handleSend}
                            disabled={isUpdating}
                            className="w-full py-3 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? 'Sending...' : 'Mark as Sent (Simulation)'}
                          </button>
                          <button
                            onClick={handleSkip}
                            disabled={isUpdating}
                            className="w-full py-2 text-gray-400 text-xs font-semibold hover:text-red-500 transition uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? 'Dismissing...' : 'Dismiss This Action'}
                          </button>
                        </div>
                      )}
                      {selectedItem.status === 'sent' && (
                        <div className="text-xs text-purple-700 font-bold text-center py-4 bg-purple-50 rounded-lg border border-purple-200 uppercase tracking-wide">
                          Completed
                        </div>
                      )}
                      {selectedItem.status === 'skipped' && (
                        <div className="text-xs text-gray-500 font-bold text-center py-4 bg-gray-50 rounded-lg border border-gray-200 uppercase tracking-wide">
                          Dismissed
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
          </>
        )}
      </div>
    </AppShell>
  );
}
