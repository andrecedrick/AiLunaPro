import { useEffect, useState } from 'react';
import { useReports } from '../../context/ReportsContext';
import { useRegistry } from '../../context/RegistryContext';
import { useAuth } from '../../context/AuthContext';
import { resolveLayer } from '../../lib/featureFlags';
import { fsListAudits } from '../../lib/audit/firestoreAuditService';

/**
 * KPI cards — REAL counts only (no fabricated trend deltas or progress bars).
 * Sources: submitted audits (fsListAudits), reports (useReports), AI tools
 * (useRegistry). Values reflect the active workspace.
 */
function KPIIcon({ id, color }: { id: string; color: string }) {
  const s: React.CSSProperties = { width: 22, height: 22, color };
  switch (id) {
    case 'audit':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'report':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12h6M9 16h6M9 8h2" /><rect x="4" y="3" width="16" height="18" rx="2" />
        </svg>
      );
    case 'tool':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    default:
      return null;
  }
}

export function KPICards() {
  const { session } = useAuth();
  const { reports } = useReports();
  const { items }   = useRegistry();
  const orgId = session?.orgId ?? '';
  const isFirebase = resolveLayer('audit') === 'firebase';

  const [auditCount, setAuditCount] = useState<number | null>(null);
  const [auditError, setAuditError] = useState(false);

  useEffect(() => {
    if (!isFirebase || !orgId) { setAuditCount(0); return; }
    let cancelled = false;
    setAuditError(false);
    fsListAudits(orgId)
      .then(audits => { if (!cancelled) setAuditCount(audits.filter(a => a.status === 'submitted').length); })
      .catch(() => { if (!cancelled) { setAuditCount(null); setAuditError(true); } });
    return () => { cancelled = true; };
  }, [orgId, isFirebase]);

  // value === null + !error → still loading ('…'); error → '—' + explanatory note.
  const cards = [
    { id: 'audit',  label: 'Audits submitted',  value: auditCount,    color: '#7C3AED', error: auditError },
    { id: 'report', label: 'Reports generated', value: reports.length, color: '#3B82F6', error: false },
    { id: 'tool',   label: 'AI tools registered', value: items.length,  color: '#10B981', error: false },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
      {cards.map(kpi => (
        <div
          key={kpi.id}
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--card-radius)',
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--border)',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            transition: 'background 0.2s ease, border-color 0.2s ease',
          }}
        >
          <div
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: `${kpi.color}1F`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <KPIIcon id={kpi.id} color={kpi.color} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 38, color: 'var(--text-primary)', lineHeight: 1 }}>
              {kpi.value === null ? (kpi.error ? '—' : '…') : kpi.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>
              {kpi.label}{kpi.error ? " — couldn't load" : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
