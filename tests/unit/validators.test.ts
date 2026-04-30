/**
 * Unit tests — Phase D4 validator primitives.
 * Coverage target: ≥ 90 % per Phase D4 DoD.
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateOrgName,
  validateRequired,
} from '@/utils/validators';

describe('validateEmail', () => {
  it('returns "" for a well-formed address', () => {
    expect(validateEmail('user@example.com')).toBe('');
    expect(validateEmail('a.b+tag@sub.example.co')).toBe('');
  });

  it('trims whitespace before validation', () => {
    expect(validateEmail('  user@example.com  ')).toBe('');
  });

  it('rejects an empty string', () => {
    expect(validateEmail('')).toBe('Email is required');
    expect(validateEmail('   ')).toBe('Email is required');
  });

  it('rejects strings without an "@"', () => {
    expect(validateEmail('userexample.com')).toBe('Invalid email address');
  });

  it('rejects strings without a TLD', () => {
    expect(validateEmail('user@example')).toBe('Invalid email address');
  });

  it('rejects strings with internal whitespace', () => {
    expect(validateEmail('user @example.com')).toBe('Invalid email address');
  });
});

describe('validatePassword', () => {
  it('accepts an 8-character password by default', () => {
    expect(validatePassword('password')).toBe('');
  });

  it('rejects an empty password', () => {
    expect(validatePassword('')).toBe('Password is required');
  });

  it('rejects passwords shorter than the minimum', () => {
    expect(validatePassword('short')).toBe('Password must be at least 8 characters');
  });

  it('respects a custom minLength', () => {
    expect(validatePassword('abcd', 4)).toBe('');
    expect(validatePassword('abc', 4)).toBe('Password must be at least 4 characters');
  });
});

describe('validateOrgName', () => {
  it('accepts a non-empty name', () => {
    expect(validateOrgName('Acme Corp')).toBe('');
  });

  it('rejects an empty or whitespace-only name', () => {
    expect(validateOrgName('')).toBe('Organization name is required');
    expect(validateOrgName('   ')).toBe('Organization name is required');
  });
});

describe('validateRequired', () => {
  it('accepts non-empty strings', () => {
    expect(validateRequired('hello', 'Field')).toBe('');
  });

  it('rejects empty strings, including whitespace-only', () => {
    expect(validateRequired('', 'Field')).toBe('Field is required');
    expect(validateRequired('  ', 'Field')).toBe('Field is required');
  });

  it('rejects null and undefined', () => {
    expect(validateRequired(null, 'Field')).toBe('Field is required');
    expect(validateRequired(undefined, 'Field')).toBe('Field is required');
  });

  it('rejects empty arrays', () => {
    expect(validateRequired([], 'Field')).toBe('Field is required');
  });

  it('accepts non-empty arrays', () => {
    expect(validateRequired(['a'], 'Field')).toBe('');
  });

  it('embeds the field name in the error message', () => {
    expect(validateRequired('', 'Industry')).toBe('Industry is required');
  });

  it('accepts numbers and booleans (they are not empty)', () => {
    expect(validateRequired(0, 'Field')).toBe('');
    expect(validateRequired(false, 'Field')).toBe('');
  });
});
