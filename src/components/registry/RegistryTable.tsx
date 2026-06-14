import { Badge } from '../ui/Badge';
import { useLocale } from '../../context/LocaleContext';
import type { Dict } from '../../lib/locale/i18n/en';
import { formatDate } from '@/utils/formatters';
import type {
  ApprovalStatus,
  RegistryItem,
  RegistryRiskLevel,
} from '../../types/registry';

/** Maps the data enum keys to the shared enums.* dictionary keys. */
const APPROVAL_KEY: Record<ApprovalStatus, keyof Dict['enums']['approval']> = {
  approved: 'approved', pending: 'pending', 'under-review': 'underReview', rejected: 'rejected',
};

const RISK_BADGE: Record<RegistryRiskLevel, 'low' | 'medium' | 'high' | 'critical'> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  critical: 'critical',
};

const APPROVAL_BADGE: Record<ApprovalStatus, 'success' | 'warning' | 'info' | 'danger'> = {
  approved: 'success',
  pending: 'warning',
  'under-review': 'info',
  rejected: 'danger',
};

interface Props {
  items: RegistryItem[];
  onRowClick: (id: string) => void;
}

export function RegistryTable({ items, onRowClick }: Props) {
  const T = useLocale();
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        overflow: 'hidden',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
        <thead>
          <tr style={{ background: 'var(--surface-2)' }}>
            <Th>{T.registry.table.tool}</Th>
            <Th>{T.registry.table.department}</Th>
            <Th>{T.registry.table.risk}</Th>
            <Th>{T.registry.table.approval}</Th>
            <Th>{T.registry.table.oversight}</Th>
            <Th>{T.registry.table.reviewDate}</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.id}
              onClick={() => onRowClick(item.id)}
              style={{
                cursor: 'pointer',
                borderTop: idx === 0 ? 'none' : '1px solid var(--row-border)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--surface-2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Td>
                <div
                  style={{
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontSize: 13,
                  }}
                >
                  {item.toolName}
                </div>
                {item.purpose && (
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      marginTop: 3,
                      maxWidth: 380,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.purpose}
                  </div>
                )}
              </Td>
              <Td>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                  }}
                >
                  {item.department}
                </span>
              </Td>
              <Td>
                <Badge variant={RISK_BADGE[item.riskLevel]}>{T.registry.filters.risk[item.riskLevel]}</Badge>
              </Td>
              <Td>
                <Badge variant={APPROVAL_BADGE[item.approvalStatus]}>
                  {T.enums.approval[APPROVAL_KEY[item.approvalStatus]]}
                </Badge>
              </Td>
              <Td>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {T.enums.oversight[item.humanOversight]}
                </span>
              </Td>
              <Td>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {formatDate(item.reviewDate)}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: '12px 16px',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--text-muted)',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      style={{
        padding: '14px 16px',
        verticalAlign: 'middle',
      }}
    >
      {children}
    </td>
  );
}
