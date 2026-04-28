import type { RegistryItem } from '../../types/registry';

interface Props {
  items: RegistryItem[];
}

export function RegistrySummary({ items }: Props) {
  const total = items.length;
  const approved = items.filter(i => i.approvalStatus === 'approved').length;
  const pending = items.filter(i =>
    i.approvalStatus === 'pending' || i.approvalStatus === 'under-review',
  ).length;
  const highRisk = items.filter(
    i => i.riskLevel === 'high' || i.riskLevel === 'critical',
  ).length;
  const approvedPct = total === 0 ? 0 : Math.round((approved / total) * 100);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 14,
        marginBottom: 18,
      }}
    >
      <Stat
        label="Total tools"
        value={String(total)}
        accent="var(--violet-text)"
      />
      <Stat
        label="Approved"
        value={String(approved)}
        sub={`${approvedPct}%`}
        accent="var(--green-text)"
      />
      <Stat
        label="Pending review"
        value={String(pending)}
        accent="var(--amber-text)"
      />
      <Stat
        label="High-risk"
        value={String(highRisk)}
        accent="var(--red-text)"
      />
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: 16,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          marginTop: 4,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 28,
            color: accent,
            lineHeight: 1.1,
          }}
        >
          {value}
        </span>
        {sub && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{sub}</span>
        )}
      </div>
    </div>
  );
}
