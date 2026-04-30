/**
 * Shared form type definitions.
 * Used by validators (utils/validators/auth.ts) and form pages.
 */

/** Field-keyed validation error map. */
export type FormErrors = Partial<Record<string, string>>;
