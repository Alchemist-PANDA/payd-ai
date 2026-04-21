'use client';

import React, { useState, useEffect } from 'react';
import { ActionQueueService } from '../../../src/services/queue/ActionQueueService';
import { getCurrentAccount, supabase } from '../../../src/lib/supabase/client';
import { trackEvent } from '../../../src/lib/telemetry';
import { type ActionQueueItem, type ActionQueueStatus } from '../../../packages/shared/src/types/contracts';
import { AppShell } from '../../../components/layout/AppShell';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { EmailPreview } from '../../../components/invoice/EmailPreview';
import { useToast } from '../../../components/ui/Toast';

type FilterStatus = ActionQueueStatus | 'all';

export default function ActionQueuePage() {
  const [items, setItems] = useState<ActionQueueItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ActionQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ActionQueueItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const account = await getCurrentAccount();
        if (mounted && account) {
          setAccountId(account.id);
          loadQueue(account.id);
          trackEvent(account.id, 'action_queue_page_viewed');
        }
      } catch (err: any) {
        if (mounted) addToast('error', 'Failed to load account');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.status === filterStatus));
    }
  }, [items, filterStatus]);

  const loadQueue = async (accId: string) => {
    try {
      const data = await ActionQueueService.getQueue(accId);
      setItems(data);
    } catch (err) {
      console.error('Failed to load queue:', err);
      addToast('error', 'Failed to load queue');
    }
  };

  const handleSelect = (item: ActionQueueItem) => {
    setSelectedItem(item);
    const payload = item.payload || {};
    const draft = payload.draft || {};
    setEditedSubject(draft.subject || payload.subject || '');
    setEditedBody(draft.body_text || payload.body_text || '');

    if (accountId) {
      trackEvent(accountId, 'queue_item_selected', { itemId: item.id });
    }
  };

  const handleApprove = async () => {
    if (!selectedItem || !accountId || isUpdating) return;
    setIsUpdating(true);
    try {
      await ActionQueueService.updateStatus(selectedItem.id, accountId, 'approved');
      trackEvent(accountId, 'queue_item_approved', { itemId: selectedItem.id });
      addToast('success', 'Action approved successfully');
      await loadQueue(accountId);
      setSelectedItem(null);
    } catch (err: any) {
      addToast('error', 'Approval failed: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedItem || !accountId || isUpdating) return;
    setIsUpdating(true);
    try {
      const newPayload = {
        ...selectedItem.payload,
        draft: {
          ...(selectedItem.payload?.draft || {}),
          subject: editedSubject,
          body_text: editedBody
        }
      };
      await ActionQueueService.updatePayload(selectedItem.id, accountId, newPayload);
      trackEvent(accountId, 'queue_item_edited', { itemId: selectedItem.id });
      addToast('success', 'Edits saved successfully');
      await loadQueue(accountId);
      setSelectedItem(null);
    } catch (err: any) {
      addToast('error', 'Edit failed: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSend = async () => {
    if (!selectedItem || !accountId || isUpdating) return;
    setIsUpdating(true);
    try {
      await ActionQueueService.updateStatus(selectedItem.id, accountId, 'sent', { method: 'manual_send' });
      trackEvent(accountId, 'queue_item_sent', { itemId: selectedItem.id });
      addToast('success', 'Email marked as sent');
      await loadQueue(accountId);
      setSelectedItem(null);
    } catch (err: any) {
      addToast('error', 'Send failed: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSkip = async () => {
    if (!selectedItem || !accountId || isUpdating) return;
    setIsUpdating(true);
    try {
      await ActionQueueService.updateStatus(selectedItem.id, accountId, 'skipped');
      trackEvent(accountId, 'queue_item_dismissed', { itemId: selectedItem.id });
      addToast('success', 'Action dismissed');
      await loadQueue(accountId);
      setSelectedItem(null);
    } catch (err: any) {
      addToast('error', 'Dismiss failed: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: ActionQueueStatus) => {
    const map: Record<ActionQueueStatus, any> = {
      pending_review: { status: 'pending', label: 'Needs Review' },
      edited: { status: 'pending', label: 'Edited' },
      approved: { status: 'sent', label: 'Approved' },
      skipped: { status: 'overdue', label: 'Dismissed' },
      sent: { status: 'paid', label: 'Sent' },
      failed: { status: 'overdue', label: 'Failed' },
      archived: { status: 'overdue', label: 'Archived' },
    };
    const config = map[status] || { status: 'pending', label: status };
    return <Badge status={config.status}>{config.label}</Badge>;
  };

  if (loading) {
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
        <div>
          <h1 className="text-h1">Action Queue</h1>
          <p className="text-body mt-2" style={{ color: 'var(--text-secondary)' }}>
            Review and approve AI-generated actions before sending
          </p>
        </div>

        {/* Beta Warning */}
        <div
          className="p-4 rounded-lg flex items-start gap-3"
          style={{
            background: 'var(--warning-bg)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--warning)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-small font-semibold" style={{ color: 'var(--warning)' }}>
              Review-First Mode Active
            </p>
            <p className="text-small mt-1" style={{ color: 'var(--text-secondary)' }}>
              All AI-generated actions require manual review and approval. No emails will be sent automatically.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          {(['all', 'pending_review', 'approved', 'sent'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-small font-medium transition-all duration-200 border-b-2 ${
                filterStatus === status
                  ? 'border-[var(--accent)] text-[var(--text-primary)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {status === 'all' ? 'All' : status === 'pending_review' ? 'Needs Review' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue List */}
          <div className="lg:col-span-2">
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {filteredItems.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <h3 className="text-h3 mb-2">Queue is empty</h3>
                  <p className="text-small mb-4" style={{ color: 'var(--text-secondary)' }}>
                    New actions will appear here after importing invoices
                  </p>
                  <Button variant="primary" onClick={() => window.location.href = '/invoices'}>
                    Import Invoices
                  </Button>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="p-4 cursor-pointer transition-all duration-200"
                      style={{
                        background: selectedItem?.id === item.id ? 'var(--bg-highlight)' : 'transparent',
                        borderLeft: selectedItem?.id === item.id ? '2px solid var(--accent)' : '2px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedItem?.id !== item.id) {
                          e.currentTarget.style.background = 'var(--bg-elevated)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedItem?.id !== item.id) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(item.status)}
                            {item.requires_human_review && (
                              <Badge status="warning">Review Required</Badge>
                            )}
                          </div>
                          <p className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                            {item.invoice?.invoice_number || 'N/A'} — {item.contact?.name || 'Unknown'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
                            {Math.round((item.ai_confidence || 0) * 100)}% confidence
                          </p>
                        </div>
                      </div>
                      <p className="text-small" style={{ color: 'var(--text-muted)' }}>
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div>
            <div
              className="rounded-xl p-6 sticky top-6"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {selectedItem ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-h3 mb-4">Review Email</h3>
                    {selectedItem.payload?.draft && (
                      <EmailPreview
                        draft={{
                          to: selectedItem.contact?.email || '',
                          subject: editedSubject,
                          body: editedBody,
                        }}
                        onApprove={handleApprove}
                        onEdit={(draft) => {
                          setEditedSubject(draft.subject);
                          setEditedBody(draft.body);
                          handleEdit();
                        }}
                        onSkip={handleSkip}
                        loading={isUpdating}
                      />
                    )}
                    {selectedItem.status === 'approved' && (
                      <div className="mt-4">
                        <Button variant="primary" onClick={handleSend} loading={isUpdating} className="w-full">
                          Mark as Sent
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-small" style={{ color: 'var(--text-muted)' }}>
                    Select an item to review
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
