import { Badge } from '../ui/Badge';
import { MemberMenu } from './MemberMenu';
import { ROLE_LABEL } from '../../data/mockAuth';
import type { OrgMember, UserRole } from '../../types/auth';

interface TeamTableProps {
  members: OrgMember[];
  currentUserId: string;
  canManage: boolean;
  onRoleChange: (userId: string, role: UserRole) => void;
  onRemove: (userId: string) => void;
}

function roleBadgeVariant(role: UserRole) {
  if (role === 'owner')   return 'info'    as const;
  if (role === 'admin')   return 'warning' as const;
  if (role === 'billing') return 'success' as const;
  return 'draft' as const; // member
}

function statusBadgeVariant(status: OrgMember['status']) {
  return status === 'active' ? 'completed' as const : 'in_progress' as const;
}

/** Avatar circle with initials + gradient. */
function Avatar({ initials, size = 32 }: { initials: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--brand-gradient)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: size * 0.34,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

const TH_STYLE: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
};

const TD_STYLE: React.CSSProperties = {
  padding: '12px 14px',
  fontSize: 13,
  color: 'var(--text-secondary)',
  borderBottom: '1px solid var(--row-border)',
  verticalAlign: 'middle',
};

export function TeamTable({
  members,
  currentUserId,
  canManage,
  onRoleChange,
  onRemove,
}: TeamTableProps) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        overflow: 'hidden',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--surface-2)' }}>
            <th style={TH_STYLE}>Member</th>
            <th style={TH_STYLE}>Role</th>
            <th style={TH_STYLE}>Status</th>
            <th style={{ ...TH_STYLE, whiteSpace: 'nowrap' }}>Joined / Invited</th>
            {canManage && <th style={{ ...TH_STYLE, width: 48 }} />}
          </tr>
        </thead>
        <tbody>
          {members.map(m => {
            const isSelf = m.userId === currentUserId;
            const date   = m.joinedAt ?? m.invitedAt;
            return (
              <tr
                key={m.userId}
                style={{ transition: 'background 0.12s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {/* Member */}
                <td style={TD_STYLE}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar initials={m.initials} />
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        {m.displayName}
                        {isSelf && (
                          <span
                            style={{
                              fontSize: 10,
                              background: 'var(--brand-tint-bg)',
                              color: 'var(--violet-text)',
                              padding: '1px 7px',
                              borderRadius: 20,
                              fontWeight: 600,
                            }}
                          >
                            You
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                        {m.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td style={TD_STYLE}>
                  <Badge variant={roleBadgeVariant(m.role)} label={ROLE_LABEL[m.role]} />
                </td>

                {/* Status */}
                <td style={TD_STYLE}>
                  <Badge
                    variant={statusBadgeVariant(m.status)}
                    label={m.status === 'active' ? 'Active' : 'Pending'}
                  />
                </td>

                {/* Date */}
                <td style={{ ...TD_STYLE, color: 'var(--text-muted)', fontSize: 12 }}>
                  {date
                    ? new Date(date).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })
                    : '—'}
                </td>

                {/* Actions */}
                {canManage && (
                  <td style={{ ...TD_STYLE, textAlign: 'right' }}>
                    <MemberMenu
                      member={m}
                      canManage={canManage}
                      isSelf={isSelf}
                      onRoleChange={onRoleChange}
                      onRemove={onRemove}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
