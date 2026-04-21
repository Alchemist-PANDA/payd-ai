'use client';

import React from 'react';

export interface Step {
  label: string;
  status: 'pending' | 'active' | 'complete';
}

export interface UploadStepperProps {
  steps: Step[];
}

export function UploadStepper({ steps }: UploadStepperProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          {/* Step Circle */}
          <div className="flex items-center gap-3">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-small font-medium
                transition-all duration-200
                ${step.status === 'active' ? 'bg-[var(--accent)] text-[#0A0B0D]' : ''}
                ${step.status === 'complete' ? 'bg-[var(--success)] text-[#0A0B0D]' : ''}
                ${step.status === 'pending' ? 'bg-[var(--bg-elevated)] border border-[var(--border-default)]' : ''}
              `}
              style={{
                color: step.status === 'pending' ? 'var(--text-muted)' : undefined,
              }}
            >
              {step.status === 'complete' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`text-small font-medium ${step.status === 'active' ? 'text-[var(--text-primary)]' : ''}`}
              style={{
                color: step.status === 'pending' ? 'var(--text-secondary)' : undefined,
              }}
            >
              {step.label}
            </span>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className="flex-1 h-px mx-4 transition-all duration-200"
              style={{
                background: step.status === 'complete' ? 'var(--success)' : 'var(--border-subtle)',
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
