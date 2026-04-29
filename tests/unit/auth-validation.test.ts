import { describe, it, expect } from 'vitest';
import { signupValidate, loginValidate, inviteValidate } from '@/utils/validators/auth';

describe('Auth Validators', () => {
  describe('signupValidate', () => {
    it('returns no errors for valid signup data', () => {
      const result = signupValidate('John Doe', 'john@example.com', 'password123', 'Acme Corp');
      expect(result).toEqual({});
    });

    it('requires name', () => {
      const result = signupValidate('', 'john@example.com', 'password123', 'Acme Corp');
      expect(result.name).toBe('Name is required');
    });

    it('requires email', () => {
      const result = signupValidate('John Doe', '', 'password123', 'Acme Corp');
      expect(result.email).toBe('Email is required');
    });

    it('validates email format', () => {
      const result = signupValidate('John Doe', 'invalid-email', 'password123', 'Acme Corp');
      expect(result.email).toBe('Invalid email address');
    });

    it('requires password', () => {
      const result = signupValidate('John Doe', 'john@example.com', '', 'Acme Corp');
      expect(result.password).toBe('Password is required');
    });

    it('enforces minimum password length', () => {
      const result = signupValidate('John Doe', 'john@example.com', 'short', 'Acme Corp');
      expect(result.password).toBe('Password must be at least 8 characters');
    });

    it('requires organization name', () => {
      const result = signupValidate('John Doe', 'john@example.com', 'password123', '');
      expect(result.orgName).toBe('Organization name is required');
    });

    it('returns multiple errors when applicable', () => {
      const result = signupValidate('', '', 'short', '');
      expect(result.name).toBeDefined();
      expect(result.email).toBeDefined();
      expect(result.password).toBeDefined();
      expect(result.orgName).toBeDefined();
    });
  });

  describe('loginValidate', () => {
    it('returns empty string for valid login data', () => {
      const result = loginValidate('john@example.com', 'password123');
      expect(result).toBe('');
    });

    it('requires email', () => {
      const result = loginValidate('', 'password123');
      expect(result).toBe('Please enter your email and password.');
    });

    it('requires password', () => {
      const result = loginValidate('john@example.com', '');
      expect(result).toBe('Please enter your email and password.');
    });

    it('requires both email and password', () => {
      const result = loginValidate('', '');
      expect(result).toBe('Please enter your email and password.');
    });

    it('allows whitespace-only email to fail validation', () => {
      const result = loginValidate('   ', 'password123');
      expect(result).toBe('Please enter your email and password.');
    });
  });

  describe('inviteValidate', () => {
    it('returns no errors for valid invite data', () => {
      const result = inviteValidate('Jane Smith', 'jane@example.com');
      expect(result).toEqual({});
    });

    it('requires name', () => {
      const result = inviteValidate('', 'jane@example.com');
      expect(result.name).toBe('Name is required');
    });

    it('requires email', () => {
      const result = inviteValidate('Jane Smith', '');
      expect(result.email).toBe('Email is required');
    });

    it('validates email format', () => {
      const result = inviteValidate('Jane Smith', 'invalid-email');
      expect(result.email).toBe('Invalid email address');
    });

    it('returns multiple errors when applicable', () => {
      const result = inviteValidate('', 'invalid');
      expect(result.name).toBeDefined();
      expect(result.email).toBeDefined();
    });

    it('accepts valid emails with various domains', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.co.uk',
        'user+tag@example.org',
      ];
      validEmails.forEach(email => {
        const result = inviteValidate('Test User', email);
        expect(result.email).toBeUndefined();
      });
    });
  });
});
