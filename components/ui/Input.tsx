import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  'aria-label'?: string; // Explicitly allow aria-label for inputs without visual labels
}

export function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  'aria-label': ariaLabel,
  ...props
}: InputProps) {
  // Generate a unique ID if none is provided but a label exists
  const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 9)}` : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-label text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-label={ariaLabel || (!label && typeof props.placeholder === 'string' ? props.placeholder : undefined)}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
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
        <span id={`${inputId}-error`} role="alert" className="text-small text-[var(--danger)]">{error}</span>
      )}
      {helperText && !error && (
        <span id={`${inputId}-helper`} className="text-small text-[var(--text-muted)]">{helperText}</span>
      )}
    </div>
  );
}
