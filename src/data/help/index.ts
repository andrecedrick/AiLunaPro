/**
 * Help Center data — Phase H0.
 *
 * Re-exports HELP_SECTIONS and helpers for the HelpPage and the TOC.
 *
 * (Note: support email placeholder for future use is `service@ailunapro.com`.
 *  Currently no user-visible mailto link — wording uses "Contact your
 *  workspace owner or AiLunaPro support" instead.)
 */

import { HELP_SECTIONS, type HelpSection } from './sections';

export { HELP_SECTIONS, type HelpSection };

export const DEFAULT_SECTION_ID = 'getting-started';

export function getSectionById(id: string | null | undefined): HelpSection {
  if (!id) return HELP_SECTIONS.find(s => s.id === DEFAULT_SECTION_ID) ?? HELP_SECTIONS[0];
  const found = HELP_SECTIONS.find(s => s.id === id);
  return found ?? HELP_SECTIONS.find(s => s.id === DEFAULT_SECTION_ID) ?? HELP_SECTIONS[0];
}

export function isValidSectionId(id: string | null | undefined): boolean {
  if (!id) return false;
  return HELP_SECTIONS.some(s => s.id === id);
}
