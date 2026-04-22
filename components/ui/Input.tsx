'use client';

import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
}

export function Input({
  label,
  error,
  helperText,
  id: providedId,
  className = '',
  leftIcon,
  rightIcon,
  onClear,
  value,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = providedId || generatedId;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-1"
        >
          {label}
        </label>
      )}

      <div className="relative group">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent)] transition-colors">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          value={value}
          className={`
            w-full px-4 py-2.5 rounded-[var(--radius-md)]
            bg-[var(--bg-surface)]
            border border-[var(--border-default)]
            text-[var(--text-primary)]
            placeholder:text-[var(--text-disabled)]
            transition-all duration-200
            hover:border-[var(--border-strong)]
            focus:outline-none focus:border-[var(--border-accent)] focus:ring-4 focus:ring-[var(--accent-glow)]
            disabled:opacity-40 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${(rightIcon || (onClear && value)) ? 'pr-10' : ''}
            ${error ? 'border-[var(--status-error)] focus:border-[var(--status-error)] focus:ring-[var(--status-error)]/10' : ''}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />

        {onClear && value && !rightIcon && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            aria-label="Clear input"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <div id={`${inputId}-error`} role="alert" className="flex items-center gap-1.5 mt-1 ml-1 text-xs font-medium text-[var(--status-error)] animate-fade-in">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1 ml-1 text-xs text-[var(--text-secondary)]">
          {helperText}
        </p>
      )}
    </div>
  );
}
