import { describe, it, expect } from 'vitest';
import {
  buildHelpSections,
  HELP_SECTION_IDS,
  DEFAULT_SECTION_ID,
  isValidSectionId,
} from '../../src/data/help';
import { en } from '../../src/lib/locale/i18n/en';

/*
 * Help Center section routing — deterministic mapping used by HelpPage's
 * ?section= deep-link. Since B6.2f the content is locale-driven: sections are
 * built from the active dictionary via buildHelpSections(t). Ids stay
 * locale-independent (HELP_SECTION_IDS) and drive validation + the TOC order.
 */

const sections = buildHelpSections(en.help);
const byId = (id: string) => sections.find(s => s.id === id);

describe('help sections — routing helpers', () => {
  it('exposes the default Getting Started section', () => {
    expect(DEFAULT_SECTION_ID).toBe('getting-started');
    expect(isValidSectionId('getting-started')).toBe(true);
    expect(byId('getting-started')?.title).toBe('Getting Started');
  });

  it('includes the Analytics & Cookies section under settings', () => {
    expect(isValidSectionId('settings-analytics')).toBe(true);
    const s = byId('settings-analytics');
    expect(s?.id).toBe('settings-analytics');
    expect(s?.title).toBe('Analytics & Cookies (Optional)');
  });

  it('rejects unknown / empty / null ids (HelpPage falls back to the default)', () => {
    expect(isValidSectionId('does-not-exist')).toBe(false);
    expect(isValidSectionId('')).toBe(false);
    expect(isValidSectionId(null)).toBe(false);
    expect(isValidSectionId(undefined)).toBe(false);
  });

  it('built sections match the canonical id list, in order, with no duplicates', () => {
    const ids = sections.map(s => s.id);
    expect(ids).toEqual([...HELP_SECTION_IDS]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Analytics section title contains no vendor hostname', () => {
    const s = byId('settings-analytics');
    expect(/posthog|\.i\.posthog|\.com\b/i.test(s!.title)).toBe(false);
  });
});
