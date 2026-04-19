/**
 * Contact Utilities
 *
 * Shared utilities for contact management to ensure consistency
 * across all contact creation and matching paths.
 */

/**
 * Normalizes email address for consistent storage and matching
 *
 * @param email - Raw email address from user input
 * @returns Normalized email (lowercase, trimmed) or null if invalid/missing
 */
export function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;

  const trimmed = email.trim().toLowerCase();

  // Basic email format validation (RFC 5322 simplified)
  // Matches: user@domain.tld
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    console.warn(`[ContactUtils] Invalid email format: "${email}" - treating as no email`);
    return null;
  }

  return trimmed;
}

/**
 * Validates email format
 *
 * @param email - Email address to validate
 * @returns true if valid format, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}
