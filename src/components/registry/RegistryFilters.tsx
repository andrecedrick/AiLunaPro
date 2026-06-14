import { useMemo } from 'react';
import { useLocale } from '../../context/LocaleContext';
import type { Dict } from '../../lib/locale/i18n/en';
import type { RegistryFilters as Filters } from '../../types/registry';
import { DEPARTMENTS, APPROVAL_LABEL } from '../../data/mockRegistry';

interface Props {
  filters: Filters;
  onChange: (next: Filters) => void;
  onClear: () => void;
}

function buildRiskOptions(t: Dict['registry']) {
  return [
    { value: 'all', label: t.filters.allRisks },
    { value: 'low', label: t.filters.risk.low },
    { value: 'medium', label: t.filters.risk.medium },
    { value: 'high', label: t.filters.risk.high },
    { value: 'critical', label: t.filters.risk.critical },
  ];
}

export function RegistryFilters({ filters, onChange, onClear }: Props) {
  const T = useLocale();
  const RISK_OPTIONS = useMemo(() => buildRiskOptions(T.registry), [T]);
  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  const hasActive =
    filters.search.trim().length > 0 ||
    filters.department !== 'all' ||
    filters.risk !== 'all' ||
    filters.approvalStatus !== 'all';

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: 14,
        marginBottom: 18,
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        flexWrap: 'wrap',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {/* Search */}
      <div style={{ flex: '1 1 220px', minWidth: 200, position: 'relative' }}>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            fontSize: 14,
          }}
        >
          🔍
        </span>
        <input
          type="text"
          placeholder={T.registry.filters.searchPlaceholder}
          value={filters.search}
          onChange={e => update({ search: e.target.value })}
          style={{
            width: '100%',
            padding: '8px 12px 8px 32px',
            background: 'var(--input-bg)',
            border: '1px solid var(--input-border)',
            borderRadius: 10,
            fontSize: 13,
            fontFamily: 'var(--font-body)',
            color: 'var(--text-primary)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <Select
        value={filters.department}
        onChange={v => update({ department: v })}
        options={[
          { value: 'all', label: T.registry.filters.allDepartments },
          ...DEPARTMENTS.map(d => ({ value: d, label: d })),
        ]}
      />
      <Select
        value={filters.risk}
        onChange={v => update({ risk: v })}
        options={RISK_OPTIONS}
      />
      <Select
        value={filters.approvalStatus}
        onChange={v => update({ approvalStatus: v })}
        options={[
          { value: 'all', label: T.registry.filters.allApproval },
          ...Object.entries(APPROVAL_LABEL).map(([value, label]) => ({ value, label })),
        ]}
      />

      {hasActive && (
        <button
          type="button"
          onClick={onClear}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--violet-text)',
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
            padding: '8px 4px',
            fontFamily: 'var(--font-body)',
          }}
        >
          {T.registry.filters.clear}
        </button>
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '8px 10px',
        background: 'var(--input-bg)',
        border: '1px solid var(--input-border)',
        borderRadius: 10,
        fontSize: 13,
        fontFamily: 'var(--font-body)',
        color: 'var(--text-primary)',
        outline: 'none',
        cursor: 'pointer',
        minWidth: 150,
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
