/**
 * Custom element type declaration — Phase J1.1
 *
 * Stripe Pricing Table is loaded as a Web Component via
 * https://js.stripe.com/v3/pricing-table.js
 *
 * Allows JSX usage of <stripe-pricing-table /> without TS errors.
 */

import type { DetailedHTMLProps, HTMLAttributes } from 'react';

interface StripePricingTableAttributes
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  'pricing-table-id':   string;
  'publishable-key':    string;
  'client-reference-id'?: string;
  'customer-email'?:    string;
}

// React 19+ scopes JSX namespace under React.JSX. Older @types/react still
// uses global JSX. Declare both so build passes regardless of React version.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': StripePricingTableAttributes;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': StripePricingTableAttributes;
    }
  }
}

export {};
