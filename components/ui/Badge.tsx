import React from 'react';

export type BadgeStatus = 'pending' | 'sent' | 'overdue' | 'paid' | 'info' | 'success' | 'warning' | 'danger';
export type BadgeType = 'status' | 'category' | 'score';

export interface BadgeProps {
  status?: BadgeStatus;
  type?: BadgeType;
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ status = 'info', type = 'status', children, className = '' }: BadgeProps) {
  const statusColors: Record<BadgeStatus, string> = {
    pending: 'bg-[var(--status-pending)]/10 text-[var(--status-pending)]',
    sent: 'bg-[var(--status-info)]/10 text-[var(--status-info)]',
    overdue: 'bg-[var(--status-error)]/10 text-[var(--status-error)]',
    paid: 'bg-[var(--status-success)]/10 text-[var(--status-success)]',
    info: 'bg-[var(--status-info)]/10 text-[var(--status-info)]',
    success: 'bg-[var(--status-success)]/10 text-[var(--status-success)]',
    warning: 'bg-[var(--status-warning)]/10 text-[var(--status-warning)]',
    danger: 'bg-[var(--status-error)]/10 text-[var(--status-error)]',
  };

  const defaultLabels = {
    pending: 'Pending',
    sent: 'Sent',
    overdue: 'Overdue',
    paid: 'Paid',
    info: 'Info',
    success: 'Success',
    warning: 'Warning',
    danger: 'Danger',
  };

  const typeStyles = {
    status: 'px-2.5 py-0.5 text-xs font-semibold rounded-full',
    category: 'px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
    score: 'px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-[var(--bg-overlay)] border border-[var(--border-default)]',
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 transition-colors duration-200
      ${type === 'status' ? statusColors[status] : ''}
      ${typeStyles[type]}
      ${className}
    `}>
      {children || defaultLabels[status]}
    </span>
  );
}

export interface CRSBadgeProps {
  score: number;
  className?: string;
}

export function CRSBadge({ score, className = '' }: CRSBadgeProps) {
  // Color interpolation logic (red -> yellow -> green)
  const getColorClass = (s: number) => {
    if (s >= 80) return 'text-[var(--status-success)] bg-[var(--status-success)]/10 border-[var(--status-success)]/20';
    if (s >= 50) return 'text-[var(--status-warning)] bg-[var(--status-warning)]/10 border-[var(--status-warning)]/20';
    return 'text-[var(--status-error)] bg-[var(--status-error)]/10 border-[var(--status-error)]/20';
  };

  return (
    <span className={`
      inline-flex items-center justify-center px-2 py-1 rounded-lg border font-mono font-bold text-sm
      ${getColorClass(score)}
      ${className}
    `}>
      {score}
    </span>
  );
}
