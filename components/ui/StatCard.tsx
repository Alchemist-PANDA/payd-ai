import React from 'react';

export interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

export function StatCard({ label, value, delta, deltaType = 'neutral', icon }: StatCardProps) {
  const deltaColors = {
    positive: 'var(--success)',
    negative: 'var(--danger)',
    neutral: 'var(--text-secondary)',
  };

  return (
    <div
      className="p-6 rounded-xl transition-all duration-200 hover:border-[var(--border-default)]"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-label" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
        {icon && (
          <div style={{ color: 'var(--accent)', opacity: 0.6 }}>
            {icon}
          </div>
        )}
      </div>

      <div className="text-mono-lg mb-2" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>

      {delta && (
        <div className="text-small" style={{ color: deltaColors[deltaType] }}>
          {delta}
        </div>
      )}
    </div>
  );
}
