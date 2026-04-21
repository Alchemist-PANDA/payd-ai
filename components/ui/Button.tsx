import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    px-4 py-2.5 rounded-lg
    font-medium text-sm
    transition-all duration-200
    disabled:opacity-40 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]
  `;

  const variantStyles = {
    primary: `
      bg-[var(--accent)] text-[#0A0B0D]
      hover:bg-[var(--accent-dim)]
      focus:ring-[var(--accent)]
      shadow-[var(--shadow-accent)]
      font-semibold
    `,
    secondary: `
      bg-[var(--bg-elevated)] text-[var(--text-primary)]
      border border-[var(--border-default)]
      hover:bg-[var(--bg-highlight)] hover:border-[var(--border-strong)]
      focus:ring-[var(--accent)]
    `,
    ghost: `
      bg-transparent text-[var(--text-secondary)]
      hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]
      focus:ring-[var(--accent)]
    `,
    danger: `
      bg-[var(--danger)] text-white
      hover:bg-[#DC2626]
      focus:ring-[var(--danger)]
    `,
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="spin w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {loading ? 'Loading...' : children}
    </button>
  );
}
