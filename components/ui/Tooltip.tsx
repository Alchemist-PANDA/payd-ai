'use client';

import React, { useState } from 'react';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--bg-elevated)]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--bg-elevated)]',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--bg-elevated)]',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--bg-elevated)]',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`
            absolute z-[9999] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)]
            bg-[var(--bg-elevated)] border border-[var(--border-strong)]
            rounded-[var(--radius-md)] shadow-xl whitespace-nowrap
            animate-fade-in pointer-events-none
            ${positionClasses[position]}
            ${className}
          `}
        >
          {content}
          <div
            className={`
              absolute border-[6px] border-transparent
              ${arrowClasses[position]}
            `}
          />
        </div>
      )}
    </div>
  );
}
