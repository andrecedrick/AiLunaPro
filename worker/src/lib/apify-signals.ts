/**
 * Apify dataset items → raw observations (cahier §26.3).
 *
 * PURE, and Apify-specific ONLY: the shape of a dataset item and how to read a
 * URL and text out of it. All AI signal detection lives in enrichment-signals.ts
 * and is shared with every other collector, so there is one vendor catalogue
 * rather than one per integration.
 */

import { mapDocument } from './enrichment-signals';
import type { RawObservation, SourceType } from './enrichment-evidence';

// Re-exported so callers and tests have a single import site for detection.
export { detectSignals, excerptAround, mapDocument, AI_VENDORS } from './enrichment-signals';
export type { VendorRule, Match, DocumentInput } from './enrichment-signals';

/** Tolerant view of an Apify dataset item — actors differ in field naming. */
export interface ApifyItem {
  url?: unknown; loadedUrl?: unknown;
  text?: unknown; markdown?: unknown; html?: unknown; title?: unknown;
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

/** Longest available textual representation of an item. */
export function itemText(item: ApifyItem): string {
  const candidates = [str(item.text), str(item.markdown), str(item.html)];
  return candidates.reduce((a, b) => (b.length > a.length ? b : a), '');
}

/** `loadedUrl` wins: it is the page actually fetched after redirects. */
export const itemUrl = (item: ApifyItem): string => str(item.loadedUrl) || str(item.url);

export interface MapOptions {
  sourceType:     SourceType;
  collectorRunId: string;
}

/** Map one Apify dataset item to raw observations. */
export function mapItem(item: ApifyItem, opts: MapOptions): RawObservation[] {
  return mapDocument({
    url: itemUrl(item), text: itemText(item),
    sourceType: opts.sourceType, collector: 'apify', collectorRunId: opts.collectorRunId,
  });
}

/** Map a whole dataset. Order follows the dataset, then detection order within an item. */
export function mapDataset(items: readonly ApifyItem[], opts: MapOptions): RawObservation[] {
  return items.flatMap(i => mapItem(i, opts));
}
