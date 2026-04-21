import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-label text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <input
        className={`
          px-4 py-2.5 rounded-lg
          bg-[var(--bg-elevated)]
          border border-[var(--border-default)]
          text-[var(--text-primary)]
          placeholder:text-[var(--text-muted)]
          transition-all duration-200
          hover:border-[var(--border-strong)]
          focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)]
          disabled:opacity-40 disabled:cursor-not-allowed
          ${error ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger-bg)]' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-small text-[var(--danger)]">{error}</span>
      )}
      {helperText && !error && (
        <span className="text-small text-[var(--text-muted)]">{helperText}</span>
      )}
    </div>
  );
}
