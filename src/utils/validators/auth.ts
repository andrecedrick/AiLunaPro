/**
 * Authentication Form Validators
 *
 * Centralized validation logic for signup, login, and team invite forms.
 * Composes primitives from `./common` (Phase D4) — no inline regex.
 */

import type { FormErrors } from '@/types/form';
import { validateEmail, validatePassword, validateOrgName } from './common';

/**
 * Signup form validation
 * Validates: name, email, password, orgName
 */
export function signupValidate(
  name: string,
  email: string,
  password: string,
  orgName: string
): FormErrors {
  const errors: FormErrors = {};

  if (!name.trim()) {
    errors.name = 'Name is required';
  }

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const passwordErr = validatePassword(password);
  if (passwordErr) errors.password = passwordErr;

  const orgErr = validateOrgName(orgName);
  if (orgErr) errors.orgName = orgErr;

  return errors;
}

/**
 * Login form validation
 * Validates: email, password
 * Returns empty string if valid, error message otherwise.
 *
 * Note: We deliberately keep a single combined message here — surfacing
 * "wrong password" vs "no account" is the auth backend's job, not the form's.
 */
export function loginValidate(email: string, password: string): string {
  if (!email.trim() || !password) {
    return 'Please enter your email and password.';
  }
  return '';
}

/**
 * Team invite form validation
 * Validates: name, email
 */
export function inviteValidate(
  name: string,
  email: string
): Partial<FormErrors> {
  const errors: Partial<FormErrors> = {};

  if (!name.trim()) {
    errors.name = 'Name is required';
  }

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  return errors;
}
