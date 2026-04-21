'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

export interface ColumnMapping {
  csvColumn: string;
  paydField: string;
  autoDetected: boolean;
}

export interface ColumnMapperProps {
  csvHeaders: string[];
  onMappingComplete: (mappings: ColumnMapping[]) => void;
  onBack?: () => void;
}

const PAYD_FIELDS = [
  { value: 'name', label: 'Company Name' },
  { value: 'email', label: 'Contact Email' },
  { value: 'amount', label: 'Amount' },
  { value: 'due_date', label: 'Due Date' },
  { value: 'invoice_number', label: 'Invoice Number (Optional)' },
  { value: 'skip', label: '— Skip this column —' },
];

export function ColumnMapper({ csvHeaders, onMappingComplete, onBack }: ColumnMapperProps) {
  const [mappings, setMappings] = useState<ColumnMapping[]>(() => {
    return csvHeaders.map((header) => {
      const normalized = header.toLowerCase().trim();
      let paydField = 'skip';
      let autoDetected = false;

      if (normalized.includes('name') || normalized.includes('company')) {
        paydField = 'name';
        autoDetected = true;
      } else if (normalized.includes('email') || normalized.includes('contact')) {
        paydField = 'email';
        autoDetected = true;
      } else if (normalized.includes('amount') || normalized.includes('total') || normalized.includes('price')) {
        paydField = 'amount';
        autoDetected = true;
      } else if (normalized.includes('due') || normalized.includes('date')) {
        paydField = 'due_date';
        autoDetected = true;
      } else if (normalized.includes('invoice') || normalized.includes('number') || normalized.includes('id')) {
        paydField = 'invoice_number';
        autoDetected = true;
      }

      return {
        csvColumn: header,
        paydField,
        autoDetected,
      };
    });
  });

  const handleMappingChange = (index: number, paydField: string) => {
    const newMappings = [...mappings];
    newMappings[index] = {
      ...newMappings[index],
      paydField,
      autoDetected: false,
    };
    setMappings(newMappings);
  };

  const handleSubmit = () => {
    onMappingComplete(mappings);
  };

  const requiredFields = ['name', 'email', 'amount', 'due_date'];
  const mappedFields = new Set(mappings.map((m) => m.paydField));
  const missingRequired = requiredFields.filter((field) => !mappedFields.has(field));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-h3 mb-2">Map Your Columns</h3>
        <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
          Match your CSV columns to PayD fields. Required fields are marked with an asterisk.
        </p>
      </div>

      <div className="space-y-4">
        {mappings.map((mapping, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 rounded-lg"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {/* CSV Column */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-body" style={{ color: 'var(--text-primary)' }}>
                  {mapping.csvColumn}
                </span>
                {mapping.autoDetected && (
                  <span
                    className="px-2 py-0.5 rounded text-label"
                    style={{
                      background: 'var(--success-bg)',
                      color: 'var(--success)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                    }}
                  >
                    Auto-detected
                  </span>
                )}
              </div>
            </div>

            {/* Arrow */}
            <svg
              className="w-5 h-5 flex-shrink-0"
              style={{ color: 'var(--text-muted)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>

            {/* PayD Field Selector */}
            <div className="flex-1">
              <select
                value={mapping.paydField}
                onChange={(e) => handleMappingChange(index, e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-body"
                style={{ color: 'var(--text-primary)' }}
              >
                {PAYD_FIELDS.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                    {requiredFields.includes(field.value) ? ' *' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Validation Message */}
      {missingRequired.length > 0 && (
        <div
          className="p-4 rounded-lg"
          style={{
            background: 'var(--warning-bg)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          <p className="text-small" style={{ color: 'var(--warning)' }}>
            Missing required fields: {missingRequired.map((f) => PAYD_FIELDS.find((pf) => pf.value === f)?.label).join(', ')}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        )}
        <div className="flex gap-3 ml-auto">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Reset
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={missingRequired.length > 0}>
            Continue to Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
