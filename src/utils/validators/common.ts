/**
 * Common validation primitives — Phase D4.
 * Single source of truth for cross-form validators.
 *
 * Each primitive returns either an empty string ("" = valid) or a localized
 * error message. Higher-level form validators compose these.
 */

/** Loose RFC-style email check. Same shape as the previous inline regex
 *  to preserve behavior; the extra anchors guard whitespace at the edges. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns "" if valid, otherwise an error message. */
export function validateEmail(email: string): string {
  const trimmed = email.trim();
  if (!trimmed) return 'Email is required';
  if (!EMAIL_RE.test(trimmed)) return 'Invalid email address';
  return '';
}

/** Returns "" if valid, otherwise an error message.
 *  Default policy: ≥ 8 characters. Tightening here propagates everywhere. */
export function validatePassword(password: string, minLength = 8): string {
  if (!password) return 'Password is required';
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  return '';
}

/** Returns "" if valid, otherwise an error message.
 *  Accepts optional fieldName to customize error message (e.g. "Workspace name"). */
export function validateOrgName(name: string, fieldName = 'Organization name'): string {
  if (!name.trim()) return `${fieldName} is required`;
  return '';
}

/**
 * Generic required-field validator. Treats whitespace-only strings as empty,
 * empty arrays as empty, and `null`/`undefined` as empty.
 *
 * @param value     value under test
 * @param fieldName label embedded in the error message
 */
export function validateRequired(
  value: unknown,
  fieldName: string,
): string {
  if (value === null || value === undefined) return `${fieldName} is required`;
  if (typeof value === 'string' && !value.trim()) {
    return `${fieldName} is required`;
  }
  if (Array.isArray(value) && value.length === 0) {
    return `${fieldName} is required`;
  }
  return '';
}
