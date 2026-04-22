'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';

export interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function UploadZone({ onFileSelect, accept = '.csv', maxSizeMB = 10 }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): string | null => {
    if (!file.name.endsWith('.csv')) {
      return 'Please upload a CSV file';
    }
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    return null;
  };

  const handleFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadState('error');
      setErrorMessage(error);
      setFileName(null);
      return;
    }

    setUploadState('success');
    setFileName(file.name);
    setErrorMessage(null);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Clear the input value so the same file can be selected again if needed
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center
          transition-all duration-200 cursor-pointer
          ${isDragging ? 'border-[var(--accent)] bg-[var(--accent-glow)]' : 'border-[var(--border-default)]'}
          ${uploadState === 'success' ? 'border-[var(--success)] bg-[var(--success-bg)]' : ''}
          ${uploadState === 'error' ? 'border-[var(--danger)] bg-[var(--danger-bg)]' : ''}
        `}
        style={{
          boxShadow: isDragging ? 'var(--shadow-accent)' : 'none',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(e) => {
          // Prevent double trigger if event bubbles or is handled by label/input
          if (e.target instanceof HTMLInputElement) return;
          handleBrowseClick();
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          onClick={(e) => e.stopPropagation()} // Stop propagation to prevent double-click behavior
          className="hidden"
        />

        {uploadState === 'idle' && (
          <>
            <svg
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: isDragging ? 'var(--accent)' : 'var(--text-muted)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-h3 mb-2" style={{ color: 'var(--text-primary)' }}>
              Drop your CSV here
            </p>
            <p className="text-small mb-4" style={{ color: 'var(--text-secondary)' }}>
              or{' '}
              <span className="underline" style={{ color: 'var(--accent)' }}>
                browse files
              </span>
            </p>
            <p className="text-small" style={{ color: 'var(--text-muted)' }}>
              CSV with headers: Name, Email, Amount, Due Date
            </p>
          </>
        )}

        {uploadState === 'success' && fileName && (
          <>
            <svg
              className="w-16 h-16 mx-auto mb-4 success-icon"
              style={{ color: 'var(--success)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-h3 mb-2" style={{ color: 'var(--success)' }}>
              File uploaded successfully
            </p>
            <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
              {fileName}
            </p>
          </>
        )}

        {uploadState === 'error' && (
          <>
            <svg
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: 'var(--danger)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-h3 mb-2" style={{ color: 'var(--danger)' }}>
              Upload failed
            </p>
            <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
              {errorMessage}
            </p>
          </>
        )}
      </div>

      {uploadState === 'success' && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setUploadState('idle');
              setFileName(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            Upload different file
          </Button>
        </div>
      )}
    </div>
  );
}
