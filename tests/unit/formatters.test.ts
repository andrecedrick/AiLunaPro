/**
 * Unit tests — Phase D4 formatters.
 */

import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatScore,
  formatRiskLevel,
} from '@/utils/formatters';

describe('formatDate', () => {
  it('formats an ISO string in short style by default', () => {
    const result = formatDate('2026-04-29T10:00:00.000Z');
    // Locale-dependent; assert non-empty + contains the year.
    expect(result).toContain('2026');
    expect(result).not.toBe('—');
  });

  it('accepts a Date instance', () => {
    expect(formatDate(new Date('2026-04-29'))).toContain('2026');
  });

  it('accepts a numeric epoch', () => {
    expect(formatDate(Date.parse('2026-04-29'))).toContain('2026');
  });

  it('returns the fallback for null / undefined / empty', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('')).toBe('—');
  });

  it('returns the fallback for invalid input', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('honors a custom fallback', () => {
    expect(formatDate(null, 'short', 'n/a')).toBe('n/a');
  });

  it('supports the medium style', () => {
    const result = formatDate('2026-04-29T10:00:00.000Z', 'medium');
    expect(result).toContain('2026');
  });
});

describe('formatScore', () => {
  it('formats a number as "n / 100"', () => {
    expect(formatScore(78)).toBe('78 / 100');
  });

  it('rounds non-integer scores', () => {
    expect(formatScore(78.4)).toBe('78 / 100');
    expect(formatScore(78.6)).toBe('79 / 100');
  });

  it('clamps scores below 0 and above 100', () => {
    expect(formatScore(-10)).toBe('0 / 100');
    expect(formatScore(150)).toBe('100 / 100');
  });

  it('returns "0 / 100" for non-finite values', () => {
    expect(formatScore(NaN)).toBe('0 / 100');
    expect(formatScore(Infinity)).toBe('0 / 100');
  });

  it('honors a custom max', () => {
    expect(formatScore(7, 10)).toBe('7 / 10');
  });
});

describe('formatRiskLevel', () => {
  it('returns labels for each canonical level', () => {
    expect(formatRiskLevel('low')).toBe('Low risk');
    expect(formatRiskLevel('medium')).toBe('Medium risk');
    expect(formatRiskLevel('high')).toBe('High risk');
    expect(formatRiskLevel('critical')).toBe('Critical risk');
  });

  it('also handles the legacy "minimal" value', () => {
    expect(formatRiskLevel('minimal')).toBe('Minimal risk');
  });

  it('falls back for unexpected values', () => {
    expect(formatRiskLevel('weird')).toBe('Unknown risk');
  });
});
