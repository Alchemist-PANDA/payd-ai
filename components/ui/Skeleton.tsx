'use client';

import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'stat-card' | 'card' | 'table-row';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height
}: SkeletonProps) {
  const baseStyles = 'relative overflow-hidden bg-[var(--border-subtle)]';

  // Shimmer effect
  const shimmer = `
    after:absolute after:inset-0
    after:-translate-x-full
    after:animate-[shimmer_2s_infinite]
    after:bg-gradient-to-r
    after:from-transparent after:via-[var(--border-strong)] after:to-transparent
    @media (prefers-reduced-motion: reduce) { after:hidden }
  `;

  const variantStyles = {
    text: 'h-4 rounded-[var(--radius-sm)]',
    circular: 'rounded-full',
    rectangular: 'rounded-[var(--radius-md)]',
    'stat-card': 'p-6 rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]',
    card: 'p-6 rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]',
    'table-row': 'border-b border-[var(--border-subtle)]',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'stat-card') {
    return (
      <div className={`${variantStyles['stat-card']} ${className}`} style={style}>
        <Skeleton className="w-24 h-3 mb-4" />
        <Skeleton className="w-32 h-8 mb-2" />
        <Skeleton className="w-20 h-3" />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`${variantStyles['card']} ${className}`} style={style}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <Skeleton className="w-40 h-6 mb-2" />
            <Skeleton className="w-32 h-4" />
          </div>
          <Skeleton variant="circular" className="w-10 h-10" />
        </div>
        <Skeleton className="w-full h-24 mb-6" />
        <div className="flex gap-3">
          <Skeleton className="w-24 h-10" />
          <Skeleton className="w-24 h-10" />
        </div>
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <tr className={`${variantStyles['table-row']} ${className}`}>
        <td className="px-4 py-4"><Skeleton className="w-8 h-4" /></td>
        <td className="px-4 py-4"><Skeleton className="w-32 h-4" /></td>
        <td className="px-4 py-4"><Skeleton className="w-24 h-4" /></td>
        <td className="px-4 py-4"><Skeleton className="w-20 h-4" /></td>
        <td className="px-4 py-4"><Skeleton className="w-16 h-4" /></td>
        <td className="px-4 py-4"><Skeleton className="w-16 h-6" /></td>
        <td className="px-4 py-4"><Skeleton className="w-20 h-8" /></td>
      </tr>
    );
  }

  return (
    <div
      className={`${baseStyles} ${shimmer} ${variantStyles[variant as keyof typeof variantStyles] || variantStyles.rectangular} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

// Keep exported components for backward compatibility
export const SkeletonStatCard = () => <Skeleton variant="stat-card" />;
export const SkeletonTableRow = () => <Skeleton variant="table-row" />;
export const SkeletonCard = () => <Skeleton variant="card" />;
