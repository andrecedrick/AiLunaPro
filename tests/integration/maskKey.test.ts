import { describe, it, expect } from 'vitest';
import { last4, detectMode, isConfigured } from '../../worker/src/lib/maskKey';

describe('maskKey — last4', () => {
  it('returns last 4 chars of long string', () => {
    expect(last4('pk_test_abcdef123456789ABCD7H2K')).toBe('7H2K');
  });
  it('returns null for empty / undefined / null', () => {
    expect(last4('')).toBeNull();
    expect(last4(undefined)).toBeNull();
    expect(last4(null)).toBeNull();
  });
  it('returns null for strings shorter than 4 chars', () => {
    expect(last4('abc')).toBeNull();
  });
  it('trims whitespace', () => {
    expect(last4('  abcdefgh  ')).toBe('efgh');
  });
});

describe('maskKey — detectMode', () => {
  it('detects test prefix', () => {
    expect(detectMode('pk_test_abc')).toBe('test');
  });
  it('detects live prefix', () => {
    expect(detectMode('pk_live_abc')).toBe('live');
  });
  it('returns unset for missing/invalid', () => {
    expect(detectMode('')).toBe('unset');
    expect(detectMode(undefined)).toBe('unset');
    expect(detectMode(null)).toBe('unset');
    expect(detectMode('sk_test_abc')).toBe('unset'); // secret keys don't pass
    expect(detectMode('random')).toBe('unset');
  });
});

describe('maskKey — isConfigured', () => {
  it('true for non-empty string', () => {
    expect(isConfigured('x')).toBe(true);
  });
  it('false for empty/whitespace/undefined/null', () => {
    expect(isConfigured('')).toBe(false);
    expect(isConfigured('   ')).toBe(false);
    expect(isConfigured(undefined)).toBe(false);
    expect(isConfigured(null)).toBe(false);
  });
});
