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
import { useLocale } from '../context/LocaleContext';
import { format } from '../lib/locale/i18n';
import type { Dict } from '../lib/locale/i18n/en';

type RoleFilter = 'all' | UserRole | 'pending';

function buildFilterOptions(t: Dict['teamPage']): { id: RoleFilter; label: string }[] {
  return [
    { id: 'all',     label: t.filters.all },
    { id: 'owner',   label: t.filters.owners },
    { id: 'admin',   label: t.filters.admins },
    { id: 'billing', label: t.filters.billing },
    { id: 'member',  label: t.filters.members },
    { id: 'client',  label: t.filters.clients },
    { id: 'pending', label: t.filters.pending },
  ];
}

/* Inline rich-text: renders **bold** markers. Deterministic, no markdown lib.
 * Markers are preserved verbatim across translations. */
function RichText({ t }: { t: string }) {
  const parts = t.split(/(\*\*.+?\*\*)/g);
  return (
    <>
      {parts.map((seg, i) => {
        if (!seg) return null;
        if (seg.startsWith('**') && seg.endsWith('**')) return <strong key={i}>{seg.slice(2, -2)}</strong>;
        return <span key={i}>{seg}</span>;
      })}
    </>
  );
}

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
  const T = useLocale();
  const FILTER_OPTIONS = useMemo(() => buildFilterOptions(T.teamPage), [T]);

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
    if (!confirm(T.teamPage.confirm.cancelInvite)) return;
    try {
      const idToken = await getIdToken();
      await apiCancelInvite(orgId, inviteId, idToken);
      clearInviteLink(inviteId);
      void reloadInvites();
    } catch (err) {
      showToast(err instanceof Error ? err.message : T.teamPage.toast.cancelFailed, 'error');
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
    if (!confirm(T.teamPage.confirm.regenerateLink)) return;
    try {
      const idToken = await getIdToken();
      const r = await apiRegenerateInvite(orgId, inviteId, idToken);
      const newLink = buildInviteLink(orgId, r.inviteId, r.rawToken);
      cacheInviteLink(r.inviteId, newLink);
      // Copy to clipboard immediately so admin doesn't lose it
      try { await navigator.clipboard.writeText(newLink); } catch { /* ignore */ }
      showToast(T.teamPage.toast.newLinkCopied, 'success');
      void reloadInvites();
    } catch (err) {
      showToast(err instanceof Error ? err.message : T.teamPage.toast.regenerateFailed, 'error');
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
            {T.teamPage.header.title}
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
            {T.teamPage.header.subtitlePrefix}{' '}
            <strong style={{ color: 'var(--text-secondary)' }}>
              {session?.org.name ?? T.teamPage.header.subtitleFallbackOrg}
            </strong>{' '}
            {T.teamPage.header.subtitleSuffix}
          </p>
        </div>
        {canManage && (
          <Button variant="primary" size="lg" onClick={() => setInviteOpen(true)}>
            {T.teamPage.header.inviteButton}
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
        <StatCard label={T.teamPage.stats.totalMembers}   value={stats.total}   color="var(--violet-text)" />
        <StatCard label={T.teamPage.stats.active}          value={stats.active}  color="var(--green)" />
        <StatCard label={T.teamPage.stats.pendingInvites} value={stats.pending} color="var(--amber)" />
        <StatCard label={T.teamPage.stats.adminsAndOwners} value={stats.admins}  color="var(--blue)" />
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
            ? T.teamPage.emptyState.noMembers
            : format(T.teamPage.emptyState.noMatch, { filter: FILTER_OPTIONS.find(f => f.id === filter)?.label ?? '' })}
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
                showToast(err instanceof Error ? err.message : T.teamPage.toast.roleUpdateFailed, 'error');
              }
            } else {
              updateMemberRole(userId, role);
            }
          }}
          onRemove={async (userId) => {
            if (!confirm(T.teamPage.confirm.removeMember)) return;
            if (isFirebaseLayer && orgId) {
              try {
                const idToken = await getIdToken();
                await apiRemoveMember(orgId, userId, idToken);
                showToast(T.teamPage.toast.memberRemoved, 'success');
              } catch (err) {
                showToast(err instanceof Error ? err.message : T.teamPage.toast.removeFailed, 'error');
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
                showToast(T.teamPage.toast.memberDisabled, 'success');
              } catch (err) {
                showToast(err instanceof Error ? err.message : T.teamPage.toast.disableFailed, 'error');
              }
            } else {
              showToast(T.teamPage.toast.disableUnavailableMock, 'info');
            }
          }}
          onEnable={async (userId) => {
            if (isFirebaseLayer && orgId) {
              try {
                const idToken = await getIdToken();
                await apiEnableMember(orgId, userId, idToken);
                showToast(T.teamPage.toast.memberEnabled, 'success');
              } catch (err) {
                showToast(err instanceof Error ? err.message : T.teamPage.toast.enableFailed, 'error');
              }
            } else {
              showToast(T.teamPage.toast.enableUnavailableMock, 'info');
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
            {format(T.teamPage.pendingInvites.heading, { count: pendingInvites.length })}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {[T.teamPage.pendingInvites.tableHeaders.email, T.teamPage.pendingInvites.tableHeaders.role, T.teamPage.pendingInvites.tableHeaders.expires, T.teamPage.pendingInvites.tableHeaders.actions].map(h => (
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
                            {T.teamPage.pendingInvites.copyLink}
                          </button>
                        ) : (
                          canManage && (
                            <button
                              type="button"
                              onClick={() => void handleRegenerateLink(inv.id)}
                              style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                              {T.teamPage.pendingInvites.regenerateLink}
                            </button>
                          )
                        )}
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => void handleCancelInvite(inv.id)}
                            style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: '1px solid var(--red-text)', background: 'transparent', color: 'var(--red-text)', cursor: 'pointer' }}
                          >
                            {T.teamPage.pendingInvites.cancel}
                          </button>
                        )}
                      </div>
                      {!cachedLink && (
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic', maxWidth: 280 }}>
                          {T.teamPage.pendingInvites.linkHiddenNote}
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
        <span style={{ color: 'var(--text-secondary)' }}><RichText t={T.teamPage.rolesLegend.lead} /></span>{' '}
        <RichText t={T.teamPage.rolesLegend.owners} />{' '}
        <RichText t={T.teamPage.rolesLegend.admins} />{' '}
        <RichText t={T.teamPage.rolesLegend.billing} />{' '}
        <RichText t={T.teamPage.rolesLegend.members} />{' '}
        <RichText t={T.teamPage.rolesLegend.clients} />
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
        {T.teamPage.footerHint}
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
