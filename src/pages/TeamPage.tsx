import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { TeamTable } from '../components/team/TeamTable';
import { InviteModal } from '../components/team/InviteModal';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth';
import { ROLE } from '../types/auth';
import { resolveLayer } from '../lib/featureFlags';
import {
  apiCreateInvite,
  apiListInvites,
  apiCancelInvite,
  apiRegenerateInvite,
  apiChangeRole,
  apiRemoveMember,
  apiDisableMember,
  apiEnableMember,
  cacheInviteLink,
  readInviteLink,
  clearInviteLink,
  getIdToken,
} from '../lib/team/teamApiClient';
import { useToast } from '../hooks/useToast';
import { buildInviteLink } from '../lib/team/invitationsService';
import type { Invitation } from '../types/invitation';

type RoleFilter = 'all' | UserRole | 'pending';

const FILTER_OPTIONS: { id: RoleFilter; label: string }[] = [
  { id: 'all',     label: 'All' },
  { id: 'owner',   label: 'Owners' },
  { id: 'admin',   label: 'Admins' },
  { id: 'billing', label: 'Billing' },
  { id: 'member',  label: 'Members' },
  { id: 'client',  label: 'Clients' },
  { id: 'pending', label: 'Pending' },
];

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
  const [filter,     setFilter]     = useState<RoleFilter>('all');
  const [pendingInvites, setPendingInvites] = useState<Invitation[]>([]);
  const { showToast } = useToast();

  const orgId = session?.orgId ?? '';
  const isFirebaseLayer = resolveLayer('auth') === 'firebase';

  // Load pending invites from Firestore (firebase layer only)
  const reloadInvites = async () => {
    if (!isFirebaseLayer || !orgId) { setPendingInvites([]); return; }
    try {
      const idToken = await getIdToken();
      const list = await apiListInvites(orgId, idToken);
      // Filter pending only on client (server returns all without tokenHash)
      setPendingInvites(list.filter(i => i.status === 'pending'));
    } catch (err) {
      console.warn('[TeamPage] listInvites failed:', err);
    }
  };

  useEffect(() => { void reloadInvites(); }, [orgId, isFirebaseLayer]); // eslint-disable-line react-hooks/exhaustive-deps

  const orgMembers = useMemo(
    () => members.filter(m => m.orgId === orgId),
    [members, orgId],
  );

  const filteredMembers = useMemo(() => {
    if (filter === 'all')     return orgMembers;
    if (filter === 'pending') return orgMembers.filter(m => m.status === 'pending' || m.status === 'invited');
    return orgMembers.filter(m => m.role === filter);
  }, [orgMembers, filter]);

  const stats = useMemo(() => {
    const total   = orgMembers.length;
    const active  = orgMembers.filter(m => m.status === 'active').length;
    const pending = orgMembers.filter(m => m.status === 'pending').length;
    const admins  = orgMembers.filter(m => m.role === 'admin' || m.role === 'owner').length;
    return { total, active, pending, admins };
  }, [orgMembers]);

  const canManage = ROLE.canManageTeam(currentMember?.role);

  const handleInvite = async (email: string, name: string, role: UserRole, message?: string): Promise<string | void> => {
    if (isFirebaseLayer && orgId && session?.userId) {
      // J1.3E: worker-authoritative invite
      const idToken = await getIdToken();
      const result = await apiCreateInvite(
        { orgId, email, displayName: name, role, message },
        idToken,
      );
      const link = buildInviteLink(orgId, result.inviteId, result.rawToken);
      cacheInviteLink(result.inviteId, link);
      void reloadInvites();
      return link;
    }
    // Mock fallback
    inviteMember(email, name, role);
  };

  const handleCancelInvite = async (inviteId: string) => {
    if (!orgId) return;
    if (!confirm('Cancel this pending invite?')) return;
    try {
      const idToken = await getIdToken();
      await apiCancelInvite(orgId, inviteId, idToken);
      clearInviteLink(inviteId);
      void reloadInvites();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Cancel failed', 'error');
    }
  };

  const handleCopyInviteLink = async (inviteId: string) => {
    const link = readInviteLink(inviteId);
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
    } catch { /* ignore */ }
  };

  const handleRegenerateLink = async (inviteId: string) => {
    if (!orgId) return;
    if (!confirm('Regenerate invite link? The old link will stop working.')) return;
    try {
      const idToken = await getIdToken();
      const r = await apiRegenerateInvite(orgId, inviteId, idToken);
      const newLink = buildInviteLink(orgId, r.inviteId, r.rawToken);
      cacheInviteLink(r.inviteId, newLink);
      // Copy to clipboard immediately so admin doesn't lose it
      try { await navigator.clipboard.writeText(newLink); } catch { /* ignore */ }
      showToast('New invite link copied to clipboard.', 'success');
      void reloadInvites();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Regenerate failed', 'error');
    }
  };

  const handleRemove = (userId: string) => {
    removeMember(userId);
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

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {FILTER_OPTIONS.map(opt => {
          const active = filter === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilter(opt.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                border: active ? '2px solid var(--violet)' : '1px solid var(--border)',
                background: active ? 'rgba(124, 58, 237, 0.08)' : 'var(--surface)',
                color: active ? 'var(--violet-text)' : 'var(--text-muted)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      {filteredMembers.length === 0 ? (
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
          {orgMembers.length === 0
            ? 'No members in this workspace yet.'
            : `No members match the "${FILTER_OPTIONS.find(f => f.id === filter)?.label}" filter.`}
        </div>
      ) : (
        <TeamTable
          members={filteredMembers}
          currentUserId={session?.userId ?? ''}
          canManage={canManage}
          viewerRole={currentMember?.role}
          onRoleChange={async (userId, role) => {
            if (isFirebaseLayer && orgId) {
              try {
                const idToken = await getIdToken();
                await apiChangeRole(orgId, userId, role, idToken);
                // Reload via window event — AuthContext listener should pick up Firestore change
              } catch (err) {
                showToast(err instanceof Error ? err.message : 'Role update failed', 'error');
              }
            } else {
              updateMemberRole(userId, role);
            }
          }}
          onRemove={async (userId) => {
            if (!confirm('Remove this member from the workspace? This cannot be undone.')) return;
            if (isFirebaseLayer && orgId) {
              try {
                const idToken = await getIdToken();
                await apiRemoveMember(orgId, userId, idToken);
                showToast('Member removed.', 'success');
              } catch (err) {
                showToast(err instanceof Error ? err.message : 'Remove failed', 'error');
              }
            } else {
              handleRemove(userId);
            }
          }}
          onDisable={async (userId) => {
            if (isFirebaseLayer && orgId) {
              try {
                const idToken = await getIdToken();
                await apiDisableMember(orgId, userId, idToken);
                showToast('Member disabled.', 'success');
              } catch (err) {
                showToast(err instanceof Error ? err.message : 'Disable failed', 'error');
              }
            } else {
              showToast('Disable not available on mock layer.', 'info');
            }
          }}
          onEnable={async (userId) => {
            if (isFirebaseLayer && orgId) {
              try {
                const idToken = await getIdToken();
                await apiEnableMember(orgId, userId, idToken);
                showToast('Member enabled.', 'success');
              } catch (err) {
                showToast(err instanceof Error ? err.message : 'Enable failed', 'error');
              }
            } else {
              showToast('Enable not available on mock layer.', 'info');
            }
          }}
        />
      )}

      {/* Pending invites (firebase layer only) */}
      {isFirebaseLayer && pendingInvites.length > 0 && (
        <div style={{
          marginTop: 18, padding: 16,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10,
          }}>
            Pending invites ({pendingInvites.length})
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Email', 'Role', 'Expires', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendingInvites.map((inv, i) => {
                const cachedLink = readInviteLink(inv.id);
                return (
                  <tr key={inv.id} style={{ borderBottom: i < pendingInvites.length - 1 ? '1px solid var(--border)' : 'none', verticalAlign: 'top' }}>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: 12 }}>{inv.email}</td>
                    <td style={{ padding: '10px' }}>{inv.role}</td>
                    <td style={{ padding: '10px', fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {cachedLink ? (
                          <button
                            type="button"
                            onClick={() => void handleCopyInviteLink(inv.id)}
                            style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: '1px solid var(--violet)', background: 'transparent', color: 'var(--violet-text)', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Copy link
                          </button>
                        ) : (
                          canManage && (
                            <button
                              type="button"
                              onClick={() => void handleRegenerateLink(inv.id)}
                              style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                              Regenerate link
                            </button>
                          )
                        )}
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => void handleCancelInvite(inv.id)}
                            style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: '1px solid var(--red-text)', background: 'transparent', color: 'var(--red-text)', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      {!cachedLink && (
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic', maxWidth: 280 }}>
                          Link hidden for security. Click Regenerate link to issue a new one.
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Roles legend */}
      <div style={{
        marginTop: 18, padding: 14,
        background: 'var(--surface-2, transparent)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--text-secondary)' }}>About roles —</strong>{' '}
        <strong>Owners</strong> manage billing and workspace settings.{' '}
        <strong>Admins</strong> manage organization users.{' '}
        <strong>Billing</strong> users manage invoices and subscription.{' '}
        <strong>Members</strong> can use audit features.{' '}
        <strong>Clients</strong> have limited viewer access.
      </div>

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
          onInvite={(email, name, role, message) => handleInvite(email, name, role, message)}
        />
      )}
    </div>
  );
}
