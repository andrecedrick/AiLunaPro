import { Badge } from '../ui/Badge';
import { MemberMenu } from './MemberMenu';
import { ROLE_LABEL } from '../../data/mockAuth';
import { formatDate } from '@/utils/formatters';
import type { OrgMember, UserRole } from '../../types/auth';

interface TeamTableProps {
  members: OrgMember[];
  currentUserId: string;
  canManage: boolean;
  /** Viewer's role — gates owner-only actions. */
  viewerRole?: UserRole;
  onRoleChange: (userId: string, role: UserRole) => void;
  onRemove: (userId: string) => void;
  onDisable?: (userId: string) => void;
  onEnable?:  (userId: string) => void;
}

function roleBadgeVariant(role: UserRole) {
  if (role === 'owner')   return 'info'    as const;  // violet
  if (role === 'admin')   return 'warning' as const;  // blue
  if (role === 'billing') return 'success' as const;  // green
  if (role === 'client')  return 'draft'   as const;  // orange-ish
  return 'draft' as const;                            // member: gray
}

function statusBadgeVariant(status: OrgMember['status']) {
  if (status === 'active')   return 'completed'   as const;
  if (status === 'disabled') return 'archived'    as const;
  return 'in_progress' as const; // pending / invited
}

function statusLabel(status: OrgMember['status']) {
  if (status === 'active')   return 'Active';
  if (status === 'disabled') return 'Disabled';
  if (status === 'invited')  return 'Invited';
  return 'Pending';
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
  viewerRole,
  onRoleChange,
  onRemove,
  onDisable,
  onEnable,
}: TeamTableProps) {
  const ownerCount = members.filter(m => m.role === 'owner' && m.status === 'active').length;
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        // overflow: hidden clipped the row dropdown menu. Use clip-path to keep
        // rounded corners while allowing absolute children to escape.
        position: 'relative',
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
                    label={statusLabel(m.status)}
                  />
                </td>

                {/* Date */}
                <td style={{ ...TD_STYLE, color: 'var(--text-muted)', fontSize: 12 }}>
                  {formatDate(date)}
                </td>

                {/* Actions */}
                {canManage && (
                  <td style={{ ...TD_STYLE, textAlign: 'right' }}>
                    <MemberMenu
                      member={m}
                      canManage={canManage}
                      isSelf={isSelf}
                      viewerRole={viewerRole}
                      ownerCount={ownerCount}
                      onRoleChange={onRoleChange}
                      onRemove={onRemove}
                      onDisable={onDisable}
                      onEnable={onEnable}
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
