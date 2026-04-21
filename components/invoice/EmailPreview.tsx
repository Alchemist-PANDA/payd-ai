'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

export interface EmailDraft {
  to: string;
  subject: string;
  body: string;
}

export interface EmailPreviewProps {
  draft: EmailDraft;
  onApprove?: (draft: EmailDraft) => void;
  onEdit?: (draft: EmailDraft) => void;
  onSkip?: () => void;
  onRegenerate?: () => void;
  loading?: boolean;
}

export function EmailPreview({
  draft,
  onApprove,
  onEdit,
  onSkip,
  onRegenerate,
  loading = false,
}: EmailPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDraft, setEditedDraft] = useState(draft);

  const handleSave = () => {
    setIsEditing(false);
    onEdit?.(editedDraft);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedDraft(draft);
  };

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Email Header */}
      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-label min-w-[60px]" style={{ color: 'var(--text-secondary)' }}>
            To:
          </span>
          {isEditing ? (
            <input
              type="email"
              value={editedDraft.to}
              onChange={(e) => setEditedDraft({ ...editedDraft, to: e.target.value })}
              className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-body"
              style={{ color: 'var(--text-primary)' }}
            />
          ) : (
            <span className="text-body" style={{ color: 'var(--text-primary)' }}>
              {draft.to}
            </span>
          )}
        </div>

        <div className="flex items-start gap-3">
          <span className="text-label min-w-[60px]" style={{ color: 'var(--text-secondary)' }}>
            Subject:
          </span>
          {isEditing ? (
            <input
              type="text"
              value={editedDraft.subject}
              onChange={(e) => setEditedDraft({ ...editedDraft, subject: e.target.value })}
              className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-body"
              style={{ color: 'var(--text-primary)' }}
            />
          ) : (
            <span className="text-body" style={{ color: 'var(--text-primary)' }}>
              {draft.subject}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mb-6" style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Email Body */}
      <div className="mb-6">
        {isEditing ? (
          <textarea
            value={editedDraft.body}
            onChange={(e) => setEditedDraft({ ...editedDraft, body: e.target.value })}
            rows={12}
            className="w-full px-4 py-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-body resize-none"
            style={{
              color: 'var(--text-primary)',
              lineHeight: '1.7',
            }}
          />
        ) : (
          <div
            className="text-body whitespace-pre-wrap"
            style={{
              color: 'var(--text-primary)',
              lineHeight: '1.7',
            }}
          >
            {draft.body}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-3">
          {onRegenerate && !isEditing && (
            <Button variant="ghost" onClick={onRegenerate} loading={loading}>
              Regenerate
            </Button>
          )}
          {onSkip && !isEditing && (
            <Button variant="ghost" onClick={onSkip}>
              Skip
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit Draft
              </Button>
              <Button variant="primary" onClick={() => onApprove?.(draft)} loading={loading}>
                Approve & Send
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
