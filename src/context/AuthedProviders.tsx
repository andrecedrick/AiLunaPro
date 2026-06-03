/**
 * AuthedProviders — bundles the data-layer context providers that depend on
 * Firestore (Audit / Reports / Registry / Billing / Tokens).
 *
 * PERF: this module is lazy-loaded by App.tsx and mounted only around
 * AUTHENTICATED content. Because App.tsx no longer statically imports these
 * providers, their Firestore imports (and the ~73 kB gz firestore chunk) stay
 * OUT of the eager boot/login bundle and load only once a signed-in view
 * mounts. No behavior change — the same providers wrap the same content.
 */
import type { ReactNode } from 'react';
import { AuditProvider } from './AuditContext';
import { ReportsProvider } from './ReportsContext';
import { RegistryProvider } from './RegistryContext';
import { BillingProvider } from './BillingContext';
import { TokensProvider } from './TokensContext';

export default function AuthedProviders({ children }: { children: ReactNode }) {
  return (
    <AuditProvider>
      <ReportsProvider>
        <RegistryProvider>
          <BillingProvider>
            <TokensProvider>
              {children}
            </TokensProvider>
          </BillingProvider>
        </RegistryProvider>
      </ReportsProvider>
    </AuditProvider>
  );
}
