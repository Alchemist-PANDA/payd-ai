import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height
}: SkeletonProps) {
  const baseStyles = 'skeleton animate-pulse';

  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
      aria-live="polite"
      aria-busy="true"
    />
  );
}

// Preset skeleton components for common use cases
export function SkeletonStatCard() {
  return (
    <div
      className="p-6 rounded-xl"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <Skeleton className="w-24 h-3 mb-4" />
      <Skeleton className="w-32 h-8 mb-2" />
      <Skeleton className="w-20 h-3" />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
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

export function SkeletonCard() {
  return (
    <div
      className="p-6 rounded-xl"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="w-40 h-6 mb-2" />
          <Skeleton className="w-32 h-4" />
        </div>
        <Skeleton className="w-24 h-6" />
      </div>
      <Skeleton className="w-full h-20 mb-4" />
      <div className="flex gap-3">
        <Skeleton className="w-24 h-10" />
        <Skeleton className="w-24 h-10" />
      </div>
    </div>
  );
}
