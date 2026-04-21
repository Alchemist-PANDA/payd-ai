'use client';

import React from 'react';

export type ActivityType = 'invoice_uploaded' | 'reminder_sent' | 'payment_received' | 'draft_approved';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
}

export interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'invoice_uploaded':
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        );
      case 'reminder_sent':
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'payment_received':
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'draft_approved':
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-small" style={{ color: 'var(--text-muted)' }}>
          No recent activity
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex gap-3 fade-in" style={{ animationDelay: `${index * 50}ms` }}>
          {getActivityIcon(activity.type)}
          <div className="flex-1 min-w-0">
            <p className="text-small" style={{ color: 'var(--text-primary)' }}>
              {activity.description}
            </p>
            <p className="text-small mt-1" style={{ color: 'var(--text-muted)' }}>
              {formatTimestamp(activity.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
