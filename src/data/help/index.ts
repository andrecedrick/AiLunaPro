/**
 * Help Center data — Phase H0, localized in B6.2f.
 *
 * Exposes the locale-driven section builder and locale-independent helpers
 * (id list / validation) for HelpPage and the TOC.
 *
 * (Note: support email placeholder for future use is `service@ailunapro.com`.
 *  Currently no user-visible mailto link — wording uses "Contact your
 *  workspace owner or AiLunaPro support" instead.)
 */

import { buildHelpSections, HELP_SECTION_IDS, type HelpSection } from './sections';

export { buildHelpSections, HELP_SECTION_IDS, type HelpSection };

export const DEFAULT_SECTION_ID = 'getting-started';

export function isValidSectionId(id: string | null | undefined): boolean {
  if (!id) return false;
  return (HELP_SECTION_IDS as readonly string[]).includes(id);
}
