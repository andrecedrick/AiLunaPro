import { describe, it, expect } from 'vitest';
import { messagePreview, PREVIEW_MAX } from '../../src/lib/contacts/messagePreview';

/*
 * Table preview of a prospect message.
 *
 * CSS ellipsis was not sufficient: it clips visually while the whole text stays
 * in the DOM and in the button's accessible name, so a screen reader would read a
 * 2000-character brief aloud for a single row. The cap must apply to the STRING.
 */

describe('messagePreview', () => {
  it('returns a short message unchanged, with no misleading ellipsis', () => {
    expect(messagePreview('Want a demo')).toBe('Want a demo');
  });

  it('never exceeds the cap, ellipsis included', () => {
    const long = 'x'.repeat(500);
    const out = messagePreview(long);
    expect(out.length).toBeLessThanOrEqual(PREVIEW_MAX + 1);   // +1 for the ellipsis
    expect(out.endsWith('…')).toBe(true);
  });

  it('caps at exactly 80 characters by default', () => {
    expect(PREVIEW_MAX).toBe(80);
    expect(messagePreview('y'.repeat(200)).slice(0, -1)).toHaveLength(80);
  });

  it('keeps a message of exactly the cap intact', () => {
    const exact = 'z'.repeat(PREVIEW_MAX);
    expect(messagePreview(exact)).toBe(exact);
  });

  it('collapses newlines so a multi-line brief cannot become a tall row', () => {
    expect(messagePreview('line one\n\nline two')).toBe('line one line two');
  });

  it('collapses runs of whitespace and trims', () => {
    expect(messagePreview('  spaced    out  ')).toBe('spaced out');
  });

  it('does not leave a trailing space before the ellipsis', () => {
    // 'aaa… ' would read as a typo; the cut point is trimmed.
    const text = `${'a'.repeat(PREVIEW_MAX - 1)} tail`;
    expect(messagePreview(text)).toBe(`${'a'.repeat(PREVIEW_MAX - 1)}…`);
  });

  it.each([undefined, ''])('renders %s as empty', v => {
    expect(messagePreview(v)).toBe('');
  });

  it('honours a custom cap', () => {
    expect(messagePreview('abcdefghij', 4)).toBe('abcd…');
  });
});
