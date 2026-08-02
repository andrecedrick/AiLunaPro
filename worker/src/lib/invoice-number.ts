/**
 * Sequential invoice numbering (§27 P1.1).
 *
 * An accounting-grade invoice number must be unique, sequential and gapless
 * within its series. Deriving it from the quote id — what the previous invoice
 * document did — satisfies none of those: it is not ordered, a bookkeeper cannot
 * tell whether an invoice is missing, and most EU tax authorities require a
 * continuous sequence.
 *
 * ATOMICITY IS THE WHOLE PROBLEM. Two admins finalising at the same moment must
 * not both receive `INV-2026-000042`. There is no Firestore transaction helper in
 * this codebase, so the counter is claimed with compare-and-swap on the document's
 * `updateTime`: read, increment, write-if-unchanged, retry on conflict. A loser
 * retries and takes the next number, so numbers stay unique and dense.
 *
 * The counter is per organisation and per year: each org issues its own series,
 * and the series restarts annually, which is the convention accountants expect.
 */

import { firestoreGetWithMeta, firestoreSetIfMatch, firestoreCreateIfNotExists } from './firestoreAdmin';

/**
 * Retries on a contended counter. Beyond this the caller gets a clear failure.
 *
 * Sized for real bursts, not for the average case: every simultaneous claimant
 * beyond the first needs its own round trip, so a budget of 6 starts refusing
 * invoices once about half a dozen finalisations land together. Retrying is
 * cheap; failing to issue an invoice is not.
 */
const MAX_ATTEMPTS = 16;

export const INVOICE_NUMBER_PREFIX = 'INV';
const SEQUENCE_DIGITS = 6;

const counterPath = (orgId: string, year: number) => `organizations/${orgId}/counters/invoice_${year}`;

/** `INV-2026-000042`. Zero-padded so numbers sort lexically as well as numerically. */
export function formatInvoiceNumber(year: number, sequence: number): string {
  return `${INVOICE_NUMBER_PREFIX}-${year}-${String(sequence).padStart(SEQUENCE_DIGITS, '0')}`;
}

/** Parse one back. Returns null when the string is not one of ours. */
export function parseInvoiceNumber(value: string): { year: number; sequence: number } | null {
  const m = /^INV-(\d{4})-(\d{6,})$/.exec((value ?? '').trim());
  if (!m) return null;
  return { year: Number(m[1]), sequence: Number(m[2]) };
}

export class InvoiceNumberError extends Error {
  constructor(public readonly code: 'CONTENDED' | 'STORE_FAILED') {
    super(code);
    this.name = 'InvoiceNumberError';
  }
}

/**
 * Claim the next number in the org's series for `year`.
 *
 * Returns the formatted number and its sequence. Throws `InvoiceNumberError`
 * rather than returning a duplicate or a guess: a caller must be able to abort
 * cleanly, because issuing two invoices with the same number is worse than
 * issuing none.
 */
export async function allocateInvoiceNumber(
  saJson: string, orgId: string, year: number,
): Promise<{ invoiceNumber: string; sequence: number; year: number }> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const path = counterPath(orgId, year);
    const current = await firestoreGetWithMeta(saJson, path);

    if (!current) {
      // First invoice of the year. create-if-not-exists makes the race safe: the
      // loser catches ALREADY_EXISTS and falls through to the CAS path.
      try {
        await firestoreCreateIfNotExists(saJson, path, { orgId, year, sequence: 1, updatedAt: new Date().toISOString() });
        return { invoiceNumber: formatInvoiceNumber(year, 1), sequence: 1, year };
      } catch (err) {
        if (err instanceof Error && err.message === 'ALREADY_EXISTS') continue;
        throw new InvoiceNumberError('STORE_FAILED');
      }
    }

    const previous = typeof current.data.sequence === 'number' ? current.data.sequence : 0;
    const next = previous + 1;

    try {
      await firestoreSetIfMatch(
        saJson, path,
        { orgId, year, sequence: next, updatedAt: new Date().toISOString() },
        current.updateTime,
        { merge: true },
      );
      return { invoiceNumber: formatInvoiceNumber(year, next), sequence: next, year };
    } catch (err) {
      // Someone else took this number. Re-read and try the next one.
      if (err instanceof Error && err.message === 'PRECONDITION_FAILED') continue;
      throw new InvoiceNumberError('STORE_FAILED');
    }
  }
  throw new InvoiceNumberError('CONTENDED');
}
