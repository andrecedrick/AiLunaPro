import { useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { useRoute } from '../context/RouteContext';
import { useRegistry } from '../context/RegistryContext';
import { filterRegistry } from '../lib/registry/filterRegistry';
import { EMPTY_FILTERS } from '../types/registry';
import type { RegistryFilters as Filters, RegistryItem } from '../types/registry';
import { RegistrySummary } from '../components/registry/RegistrySummary';
import { RegistryFilters as RegistryFiltersBar } from '../components/registry/RegistryFilters';
import { RegistryTable } from '../components/registry/RegistryTable';
import { RegistryEmptyState } from '../components/registry/RegistryEmptyState';
import { RegistryItemModal } from '../components/registry/RegistryItemModal';

type ModalState =
  | { kind: 'closed' }
  | { kind: 'add' }
  | { kind: 'edit'; itemId: string };

export function RegistryPage() {
  const { navigate } = useRoute();
  const { items, status, addItem, updateItem, deleteItem, getItem } = useRegistry();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [modal, setModal] = useState<ModalState>({ kind: 'closed' });

  const filtered = useMemo(() => filterRegistry(items, filters), [items, filters]);

  const handleSave = (
    data: Omit<RegistryItem, 'id' | 'createdAt' | 'updatedAt'>,
    mode: { kind: 'add' } | { kind: 'edit'; item: RegistryItem },
  ) => {
    if (mode.kind === 'add') {
      addItem(data);
    } else {
      updateItem(mode.item.id, data);
    }
    setModal({ kind: 'closed' });
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
    setModal({ kind: 'closed' });
  };

  const editingItem =
    modal.kind === 'edit' ? getItem(modal.itemId) : undefined;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 22,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 28,
              color: 'var(--text-primary)',
              letterSpacing: -0.5,
            }}
          >
            AI Registry
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 14,
              color: 'var(--text-muted)',
              lineHeight: 1.55,
              maxWidth: 640,
            }}
          >
            Track every AI tool used across your organization — purpose, data, oversight, and
            mitigations. The registry feeds your audits and reports.{' '}
            {/* B3: governance-side bridge to the design guide */}
            <button
              type="button"
              onClick={() => navigate({ name: 'system-builder' })}
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--violet-text)', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)', textDecoration: 'underline' }}
            >
              Designing a new system? Open the design guide →
            </button>
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setModal({ kind: 'add' })}>
          + Add tool
        </Button>
      </div>

      {/* Summary widgets — always reflect the unfiltered totals */}
      <RegistrySummary items={items} />

      {/* Filters */}
      <RegistryFiltersBar
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />

      {/* Body */}
      {status === 'loading' ? (
        <div
          style={{
            padding: '48px 0',
            textAlign: 'center',
            fontSize: 14,
            color: 'var(--text-muted)',
          }}
        >
          Loading registry…
        </div>
      ) : status === 'error' ? (
        <div
          style={{
            padding: '48px 0',
            textAlign: 'center',
            fontSize: 14,
            color: 'var(--red-text)',
          }}
        >
          Failed to load registry. Refresh to retry.
        </div>
      ) : items.length === 0 ? (
        <RegistryEmptyState
          variant="no-items"
          onAdd={() => setModal({ kind: 'add' })}
          onClearFilters={() => setFilters(EMPTY_FILTERS)}
        />
      ) : filtered.length === 0 ? (
        <RegistryEmptyState
          variant="no-matches"
          onAdd={() => setModal({ kind: 'add' })}
          onClearFilters={() => setFilters(EMPTY_FILTERS)}
        />
      ) : (
        <RegistryTable
          items={filtered}
          onRowClick={id => setModal({ kind: 'edit', itemId: id })}
        />
      )}


      {/* Modal */}
      {modal.kind === 'add' && (
        <RegistryItemModal
          mode={{ kind: 'add' }}
          onClose={() => setModal({ kind: 'closed' })}
          onSave={handleSave}
        />
      )}
      {modal.kind === 'edit' && editingItem && (
        <RegistryItemModal
          mode={{ kind: 'edit', item: editingItem }}
          onClose={() => setModal({ kind: 'closed' })}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
