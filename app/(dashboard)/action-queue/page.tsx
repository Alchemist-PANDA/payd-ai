'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ActionQueueService } from '../../../src/services/queue/ActionQueueService';
import { getCurrentAccount, supabase } from '../../../src/lib/supabase/client';
import { trackEvent } from '../../../src/lib/telemetry';
import { type ActionQueueItem, type ActionQueueStatus } from '../../../packages/shared/src/types/contracts';
import { AppShell } from '../../../components/layout/AppShell';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';
import { SkeletonCard } from '../../../components/ui/Skeleton';

// Lazy load EmailPreview component
const EmailPreview = dynamic(() => import('../../../components/invoice/EmailPreview').then(mod => ({ default: mod.EmailPreview })), {
  loading: () => <SkeletonCard />,
  ssr: false
});

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
          // trackEvent(account.id, 'action_queue_page_viewed');
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
      // trackEvent(accountId, 'queue_item_selected', { itemId: item.id });
    }
  };

  const handleApprove = async () => {
    if (!selectedItem || !accountId || isUpdating) return;
    setIsUpdating(true);
    try {
      await ActionQueueService.updateStatus(selectedItem.id, accountId, 'approved');
      // trackEvent(accountId, 'queue_item_approved', { itemId: selectedItem.id });
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
      // trackEvent(accountId, 'queue_item_edited', { itemId: selectedItem.id });
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
      // trackEvent(accountId, 'queue_item_sent', { itemId: selectedItem.id });
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
      // trackEvent(accountId, 'queue_item_dismissed', { itemId: selectedItem.id });
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
          <div className="spin w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto space-y-8 page-enter py-8 px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--border-subtle)] pb-8">
          <div>
            <h1 className="text-hero !text-3xl font-bold text-white tracking-tight">Action Queue</h1>
            <p className="text-body mt-2 text-secondary font-medium flex items-center gap-3">
              Welcome back, Test Validation Account <span className="text-[var(--brand-secondary)] inline-block w-2 h-2 rounded-full bg-[var(--brand-secondary)]" />
            </p>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-small text-[var(--brand-accent)] font-bold bg-[rgba(255,159,10,0.1)] px-3 py-1 rounded-full border border-[rgba(255,159,10,0.2)] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)] animate-pulse" />
                Review-First Mode Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">🔍</span>
              <input
                type="text"
                placeholder="Search clients or invoices..."
                className="bg-[#111317] border border-[#2A2F3A] rounded-full py-2.5 pl-10 pr-4 text-small text-white placeholder-secondary focus:outline-none focus:border-[var(--brand-primary)] transition-colors w-64"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'pending_review', label: 'Needs Review', count: filteredItems.length },
            { id: 'approved', label: 'Approved', count: 12 },
            { id: 'sent', label: 'Sent', count: 89 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`pb-4 text-body font-semibold transition-all relative whitespace-nowrap flex items-center gap-3 ${
                filterStatus === tab.id
                  ? 'text-white'
                  : 'text-secondary hover:text-white'
              }`}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                filterStatus === tab.id ? 'bg-[var(--brand-primary)] text-[#0A0B0E]' : 'bg-[#1F242F] text-secondary'
              }`}>
                {tab.count}
              </span>
              {filterStatus === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-[var(--brand-primary)] shadow-[0_0_12px_var(--brand-primary)]" />
              )}
            </button>
          ))}
        </div>

        {/* Spacious Card List */}
        <div className="space-y-5">
          {filteredItems.length === 0 ? (
             <div className="comfort-card p-16 text-center">
               <div className="text-5xl mb-6">✅</div>
               <h3 className="text-headline !text-2xl text-white mb-3">All caught up!</h3>
               <p className="text-body text-secondary">No actions pending your review.</p>
             </div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item.id}
                className={`comfort-card flex flex-col md:flex-row md:items-center gap-6 cursor-pointer group ${
                  selectedItem?.id === item.id ? 'border-[var(--brand-primary)] bg-[#13161C] shadow-[0_8px_24px_rgba(0,212,170,0.05)]' : ''
                }`}
                onClick={() => handleSelect(item)}
              >
                <div className="flex items-center justify-center flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="w-6 h-6 rounded-md border-[#2A2F3A] bg-[#0A0B0E] checked:bg-[var(--brand-primary)] checked:border-[var(--brand-primary)] transition-colors cursor-pointer"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-3">
                    <div className="font-mono text-body text-white uppercase tracking-tight font-bold">
                      {item.invoice?.invoice_number || 'N/A'}
                    </div>
                    <div className="text-title !text-lg text-white truncate">
                      {item.contact?.name || 'Unknown'}
                    </div>
                    <div className="hidden sm:block text-[#2A2F3A]">|</div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#111317] border border-[#2A2F3A] w-fit">
                      <div className="w-2 h-2 rounded-full bg-[var(--brand-accent)]" />
                      <span className="text-[12px] text-secondary uppercase font-bold tracking-wider">
                        {item.action_type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="text-body text-secondary truncate italic pl-1 border-l-2 border-[#2A2F3A]">
                    "{item.payload?.draft?.body_text?.substring(0, 80)}..."
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
                   <Button
                     variant="ghost"
                     className="btn-comfort !bg-[#111317] border border-[#2A2F3A] hover:border-[#4B5563] text-white"
                   >
                     Edit
                   </Button>
                   <Button
                     variant="primary"
                     className="btn-comfort shadow-[0_8px_24px_rgba(0,212,170,0.15)]"
                     onClick={(e) => { e.stopPropagation(); handleApprove(); }}
                   >
                     Approve
                   </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Batch Actions Bar (Sticky Bottom) - Shown when items are selected */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1A1D24] border border-[#2A2F3A] shadow-[0_20px_40px_rgba(0,0,0,0.8)] rounded-full px-6 py-4 flex items-center gap-6 z-50 animate-fade-up">
          <div className="text-body font-bold text-white">
            <span className="text-[var(--brand-primary)]">2</span> items selected
          </div>
          <div className="w-px h-6 bg-[#2A2F3A]"></div>
          <div className="flex gap-3">
            <Button variant="ghost" className="text-white hover:bg-[#2A2F3A]">Reject</Button>
            <Button variant="ghost" className="text-white hover:bg-[#2A2F3A]">Bulk Edit</Button>
            <Button variant="primary" className="shadow-[0_0_15px_rgba(0,212,170,0.2)]">Approve Selected</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
