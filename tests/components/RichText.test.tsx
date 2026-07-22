import { describe, it, expect } from 'vitest';
import { renderWithLocale as render } from "../utils/renderWithLocale";
import { RichText } from '../../src/components/RichText';

/* L1 — shared inline renderer. **bold** / *italic* / `code` markers become
 * styled spans and the marker characters are removed — raw markdown never shows
 * literally (the Luna-chat `**Audit**` bug). */

describe('RichText', () => {
  it('renders **bold** as <strong> with no literal asterisks', () => {
    const { container } = render(<RichText t="go to **Audit** now" />);
    expect(container.querySelector('strong')?.textContent).toBe('Audit');
    expect(container.textContent).toBe('go to Audit now');
    expect(container.textContent).not.toContain('*');
  });

  it('renders `code` as <code> with no backticks', () => {
    const { container } = render(<RichText t="open `registry` here" />);
    expect(container.querySelector('code')?.textContent).toBe('registry');
    expect(container.textContent).not.toContain('`');
  });

  it('renders *italic* as <em>', () => {
    const { container } = render(<RichText t="this is *important*" />);
    expect(container.querySelector('em')?.textContent).toBe('important');
  });

  it('passes plain text through unchanged', () => {
    const { container } = render(<RichText t="just plain text" />);
    expect(container.textContent).toBe('just plain text');
  });
});
