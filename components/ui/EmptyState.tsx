'use client';

import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  ctaAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`
      flex flex-col items-center justify-center p-12 text-center
      bg-[var(--bg-surface)] border-2 border-dashed border-[var(--border-subtle)]
      rounded-[var(--radius-xl)]
      ${className}
    `}>
      {icon && (
        <div className="mb-6 p-4 rounded-full bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--brand-primary)] animate-fade-in">
          {icon}
        </div>
      )}

      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
        {title}
      </h3>

      <p className="max-w-md text-[var(--text-secondary)] mb-8">
        {description}
      </p>

      {ctaLabel && ctaAction && (
        <Button variant="brand-primary" onClick={ctaAction} size="lg">
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
