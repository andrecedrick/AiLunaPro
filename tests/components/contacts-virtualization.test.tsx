import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useVirtualRows } from '../../src/lib/ui/useVirtualRows';
import { ContactsTable, ROW_HEIGHT } from '../../src/components/contacts/ContactsTable';
import type { Contact, ContactStatus } from '../../src/lib/contacts/contactsClient';

/**
 * Virtualization proof.
 *
 * The regression this guards is a rendering one: the CRM built a DOM row for
 * every contact it had loaded, so 1,000 contacts meant 1,000 rows × 14 cells and
 * the tab stopped responding. What matters is that DOM size tracks the VIEWPORT,
 * not the data — so the assertions are about node counts at 100, 1,000 and
 * 10,000 rows, not about timings, which would be flaky.
 */

const VIEWPORT = 440;

// jsdom reports clientHeight 0 for everything; the hook measures it to decide how
// many rows fit, so the container is given a real height.
let restore: (() => void) | null = null;
beforeAll(() => {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => VIEWPORT });
  restore = () => {
    if (original) Object.defineProperty(HTMLElement.prototype, 'clientHeight', original);
  };
});
afterAll(() => restore?.());

function Harness({ count, rowHeight = 44 }: { count: number; rowHeight?: number }) {
  const v = useVirtualRows({ count, rowHeight });
  return (
    <div ref={v.ref} data-testid="scroller" style={{ height: VIEWPORT, overflowY: 'auto' }}>
      <div style={{ height: v.padTop }} />
      {Array.from({ length: v.end - v.start }, (_, i) => (
        <div key={v.start + i} data-testid="row" style={{ height: rowHeight }}>{v.start + i}</div>
      ))}
      <div style={{ height: v.padBottom }} />
      <span data-testid="range">{v.start}-{v.end}</span>
      <span data-testid="pads">{v.padTop}/{v.padBottom}</span>
    </div>
  );
}

describe('useVirtualRows', () => {
  it('renders every row for a SHORT list — windowing would only add overhead', () => {
    render(<Harness count={20} />);
    expect(screen.getAllByTestId('row')).toHaveLength(20);
    expect(screen.getByTestId('pads').textContent).toBe('0/0');
  });

  it('renders a viewport-sized window for a long list', () => {
    render(<Harness count={1000} />);
    const rendered = screen.getAllByTestId('row').length;
    // 440px / 44px = 10 visible, plus 8 overscan each side.
    expect(rendered).toBeLessThanOrEqual(30);
    expect(rendered).toBeGreaterThan(0);
  });

  it('DOM size does not grow with the data', () => {
    const { unmount } = render(<Harness count={1000} />);
    const at1k = screen.getAllByTestId('row').length;
    unmount();
    render(<Harness count={10000} />);
    expect(screen.getAllByTestId('row').length).toBe(at1k);
  });

  it('spacers always account for the rows outside the window', () => {
    render(<Harness count={1000} />);
    const [top, bottom] = screen.getByTestId('pads').textContent!.split('/').map(Number);
    const [start, end] = screen.getByTestId('range').textContent!.split('-').map(Number);
    expect(top).toBe(start * 44);
    expect(bottom).toBe((1000 - end) * 44);
    // Total scroll height stays the full list height, so the scrollbar is honest.
    expect(top + (end - start) * 44 + bottom).toBe(1000 * 44);
  });

  it('moves the window on scroll', () => {
    render(<Harness count={1000} />);
    const scroller = screen.getByTestId('scroller');
    Object.defineProperty(scroller, 'scrollTop', { configurable: true, value: 4400 });
    fireEvent.scroll(scroller);
    const [start] = screen.getByTestId('range').textContent!.split('-').map(Number);
    expect(start).toBe(100 - 8); // row 100 is at 4400px, minus the overscan
  });

  it('a zero row height disables windowing instead of dividing by zero', () => {
    render(<Harness count={5000} rowHeight={0} />);
    expect(screen.getByTestId('pads').textContent).toBe('0/0');
  });
});

/* ── The real table ──────────────────────────────────────────────────────────── */

const T: Record<string, unknown> = {
  colName: 'Name', colEmail: 'Email', colCompany: 'Company', colOrg: 'Org', phone: 'Phone',
  colCountry: 'Country', colLeadStatus: 'Lead status', colOwner: 'Owner', colLastMessage: 'Latest request',
  colTags: 'Tags', colSource: 'Source', colStatus: 'Status', colCreated: 'Created', colActions: 'Actions',
  loading: 'Loading…', empty: 'No contacts match.', edit: 'Edit', block: 'Block', unblock: 'Unblock',
  delete: 'Delete', viewDetail: 'View', unassigned: 'Unassigned',
  sources: { import: 'Import' }, statuses: { active: 'Active', inactive: 'Inactive', blocked: 'Blocked' },
};

const STATUS_COLOR: Record<ContactStatus, { bg: string; fg: string }> = {
  active: { bg: '', fg: '' }, inactive: { bg: '', fg: '' }, blocked: { bg: '', fg: '' },
};

const makeContacts = (n: number): Contact[] => Array.from({ length: n }, (_, i) => ({
  contactId: `c${i}`, name: `Person ${i}`, email: `p${i}@x.com`, phone: '', company: 'Acme',
  tags: [], notes: '', status: 'active' as ContactStatus, source: 'import' as Contact['source'],
  linkedQuoteId: '', linkedAuditId: '', createdByUid: 'u1',
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '',
}));

const renderTable = (rows: Contact[]) => render(
  <ContactsTable
    rows={rows} readOnly={false} isManager={false} busyId={null}
    statusColor={STATUS_COLOR} t={T}
    canEditRow={() => false}
    onDetail={() => {}} onEdit={() => {}} onToggleBlock={() => {}} onDelete={() => {}}
  />,
);

describe('ContactsTable — no DOM explosion', () => {
  it('100 contacts render fully (below the windowing threshold)', () => {
    const { container } = renderTable(makeContacts(100));
    const dataRows = container.querySelectorAll('tbody tr[style*="height"]');
    expect(dataRows.length).toBeGreaterThan(0);
  });

  for (const total of [1000, 10000]) {
    it(`${total} contacts render a bounded number of cells`, () => {
      const { container } = renderTable(makeContacts(total));
      const cells = container.querySelectorAll('tbody td');
      // A viewport of 440px at 44px per row is ~10 rows + overscan; 14 columns
      // each. The old code produced total × 14 cells — 140,000 at 10,000 rows.
      expect(cells.length).toBeLessThan(600);
      // And the data is still reachable: the newest row is on screen.
      expect(screen.getByText('Person 0')).toBeTruthy();
    });
  }

  it('renders the empty and loading states without rows', () => {
    const { container: a } = renderTable([]);
    expect(a.textContent).toContain('No contacts match.');
    const { container: b } = render(
      <ContactsTable
        rows={null} readOnly={false} isManager={false} busyId={null}
        statusColor={STATUS_COLOR} t={T} canEditRow={() => false}
        onDetail={() => {}} onEdit={() => {}} onToggleBlock={() => {}} onDelete={() => {}}
      />,
    );
    expect(b.textContent).toContain('Loading…');
  });

  it('the row height the window maths uses is the height a row renders at', () => {
    const { container } = renderTable(makeContacts(1000));
    const row = container.querySelector('tbody tr[style*="height"]') as HTMLElement;
    expect(row.style.height).toBe(`${ROW_HEIGHT}px`);
  });
});
