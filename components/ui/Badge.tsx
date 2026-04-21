import React from 'react';

export type BadgeStatus = 'pending' | 'sent' | 'overdue' | 'paid';

export interface BadgeProps {
  status: BadgeStatus;
  children?: React.ReactNode;
}

export function Badge({ status, children }: BadgeProps) {
  const statusConfig = {
    pending: {
      bg: 'var(--warning-bg)',
      color: 'var(--warning)',
      border: 'rgba(245,158,11,0.2)',
      label: children || 'Pending',
    },
    sent: {
      bg: 'var(--info-bg)',
      color: 'var(--info)',
      border: 'rgba(59,130,246,0.2)',
      label: children || 'Sent',
    },
    overdue: {
      bg: 'var(--danger-bg)',
      color: 'var(--danger)',
      border: 'rgba(239,68,68,0.2)',
      label: children || 'Overdue',
    },
    paid: {
      bg: 'var(--success-bg)',
      color: 'var(--success)',
      border: 'rgba(34,197,94,0.2)',
      label: children || 'Paid',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-label"
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
    >
      {config.label}
    </span>
  );
}
