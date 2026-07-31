/**
 * Table preview of a prospect message.
 *
 * The table must never carry the full request. CSS ellipsis was not enough: it
 * only clips visually, so the entire text still sat in the DOM and in the
 * button's accessible name — a screen reader would read a 2000-character brief
 * aloud for one row, and copying the row copied everything.
 *
 * This truncates the STRING, so the table holds at most PREVIEW_MAX characters.
 * The full message lives only in the Contact Detail Panel.
 */

/** Hard cap on what the table may show. */
export const PREVIEW_MAX = 80;

/**
 * First line of the message, capped at `max` characters.
 *
 * Newlines collapse to spaces: a multi-line brief would otherwise render as one
 * tall row, which is the problem this exists to prevent. The ellipsis is added
 * only when text was actually removed, so a short message shows no false hint of
 * more content.
 */
export function messagePreview(text: string | undefined, max: number = PREVIEW_MAX): string {
  const flat = (text ?? '').replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max).trimEnd()}…`;
}
