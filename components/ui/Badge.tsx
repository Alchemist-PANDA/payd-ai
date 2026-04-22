import React from 'react';

export type BadgeStatus = 'pending' | 'sent' | 'overdue' | 'paid' | 'info' | 'success' | 'warning' | 'danger';

export interface BadgeProps {
  status: BadgeStatus;
  children?: React.ReactNode;
}

export function Badge({ status, children }: BadgeProps) {
  const statusMap: Record<BadgeStatus, string> = {
    pending: 'badge-orange',
    sent: 'badge-blue',
    overdue: 'badge-red',
    paid: 'badge-green',
    info: 'badge-blue',
    success: 'badge-green',
    warning: 'badge-orange',
    danger: 'badge-red',
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

  return (
    <span className={`badge ${statusMap[status]}`}>
      {children || defaultLabels[status]}
    </span>
  );
}
