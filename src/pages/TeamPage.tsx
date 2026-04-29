import { useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { TeamTable } from '../components/team/TeamTable';
import { InviteModal } from '../components/team/InviteModal';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth';

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '18px 22px',
        flex: '1 1 140px',
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          color,
          letterSpacing: -1,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          marginTop: 4,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function TeamPage() {
  const { session, members, inviteMember, updateMemberRole, removeMember, currentMember } =
    useAuth();

  const [inviteOpen, setInviteOpen] = useState(false);

  const orgId = session?.orgId ?? '';

  const orgMembers = useMemo(
    () => members.filter(m => m.orgId === orgId),
    [members, orgId],
  );

  const stats = useMemo(() => {
    const total   = orgMembers.length;
    const active  = orgMembers.filter(m => m.status === 'active').length;
    const pending = orgMembers.filter(m => m.status === 'pending').length;
    const admins  = orgMembers.filter(m => m.role === 'admin' || m.role === 'owner').length;
    return { total, active, pending, admins };
  }, [orgMembers]);

  const canManage =
    currentMember?.role === 'owner' || currentMember?.role === 'admin';

  const handleInvite = (email: string, name: string, role: UserRole) => {
    inviteMember(email, name, role);
  };

  const handleRemove = (userId: string) => {
    if (confirm('Remove this member from the workspace? This cannot be undone.')) {
      removeMember(userId);
    }
  };

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
            Team
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 14,
              color: 'var(--text-muted)',
              lineHeight: 1.55,
              maxWidth: 560,
            }}
          >
            Manage who has access to{' '}
            <strong style={{ color: 'var(--text-secondary)' }}>
              {session?.org.name ?? 'your workspace'}
            </strong>{' '}
            and what they can do.
          </p>
        </div>
        {canManage && (
          <Button variant="primary" size="lg" onClick={() => setInviteOpen(true)}>
            + Invite member
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          marginBottom: 22,
        }}
      >
        <StatCard label="Total members"   value={stats.total}   color="var(--violet-text)" />
        <StatCard label="Active"          value={stats.active}  color="var(--green)" />
        <StatCard label="Pending invites" value={stats.pending} color="var(--amber)" />
        <StatCard label="Admins & owners" value={stats.admins}  color="var(--blue)" />
      </div>

      {/* Table */}
      {orgMembers.length === 0 ? (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--card-radius)',
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 14,
          }}
        >
          No members in this workspace yet.
        </div>
      ) : (
        <TeamTable
          members={orgMembers}
          currentUserId={session?.userId ?? ''}
          canManage={canManage}
          onRoleChange={(userId, role) => updateMemberRole(userId, role)}
          onRemove={handleRemove}
        />
      )}

      {/* Footer hint */}
      <p
        style={{
          margin: '14px 4px 0',
          fontSize: 11,
          color: 'var(--text-muted)',
          fontStyle: 'italic',
          lineHeight: 1.5,
        }}
      >
        Invitations are mock-only for now. Real email delivery and Firebase Auth will replace this layer in the backend phase.
      </p>

      {/* Invite modal */}
      {inviteOpen && (
        <InviteModal
          currentUserRole={currentMember?.role ?? 'member'}
          onClose={() => setInviteOpen(false)}
          onInvite={(email, name, role) => {
            handleInvite(email, name, role);
          }}
        />
      )}
    </div>
  );
}
