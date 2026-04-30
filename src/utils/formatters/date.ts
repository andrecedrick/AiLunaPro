/**
 * Date formatters — Phase D4.
 * Single source of truth for human-readable timestamps.
 *
 * Inputs are tolerant: ISO strings, Date instances, and millisecond
 * epoch numbers are all accepted. Invalid input falls back to "—".
 */

export type DateStyle = 'short' | 'medium' | 'long' | 'time' | 'datetime';

const FORMATS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  /** "Apr 29, 2026" — used in tables and report headers. */
  short: { year: 'numeric', month: 'short', day: 'numeric' },
  /** "April 29, 2026" — emphasis. */
  medium: { year: 'numeric', month: 'long', day: 'numeric' },
  /** "Wednesday, April 29, 2026" — verbose. */
  long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  /** "10:42" */
  time: { hour: '2-digit', minute: '2-digit' },
  /** "Apr 29, 2026, 10:42" */
  datetime: {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  },
};

/**
 * Format a date input as a localized string.
 * @param input     ISO string, Date, epoch ms, or null/undefined
 * @param style     preset style (default: 'short')
 * @param fallback  string returned when the input is missing/invalid
 */
export function formatDate(
  input: string | Date | number | null | undefined,
  style: DateStyle = 'short',
  fallback = '—',
): string {
  if (input === null || input === undefined || input === '') return fallback;

  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return fallback;

  return d.toLocaleDateString(undefined, FORMATS[style]);
}
