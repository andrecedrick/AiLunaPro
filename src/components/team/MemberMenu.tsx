import { useEffect, useRef, useState } from 'react';
import { ROLE_LABEL } from '../../data/mockAuth';
import type { OrgMember, UserRole } from '../../types/auth';

const ROLES: UserRole[] = ['owner', 'admin', 'billing', 'member', 'client'];

interface MemberMenuProps {
  member: OrgMember;
  canManage: boolean;
  isSelf: boolean;
  /** Current viewer's role — gates owner-only actions. */
  viewerRole?: UserRole;
  /** Total active owners — needed for "last owner" safeguard. */
  ownerCount?: number;
  onRoleChange: (userId: string, role: UserRole) => void;
  onRemove: (userId: string) => void;
  onDisable?: (userId: string) => void;
  onEnable?:  (userId: string) => void;
}

/** ⋯ action menu shown at the end of each team-table row. */
export function MemberMenu({
  member,
  canManage,
  isSelf,
  viewerRole,
  ownerCount = 1,
  onRoleChange,
  onRemove,
  onDisable,
  onEnable,
}: MemberMenuProps) {
  const viewerIsOwner = viewerRole === 'owner';
  const isLastOwner   = member.role === 'owner' && ownerCount <= 1;
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);

  /* Close on outside click. */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!canManage) return null;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: 32,
          height: 32,
          padding: 0,
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: open ? 'var(--surface-2, var(--input-bg, #f5f5f7))' : 'var(--surface)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          transition: 'background 0.12s, border-color 0.12s',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--violet)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
        aria-label="Member actions"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5"  r="1.4" />
          <circle cx="12" cy="12" r="1.4" />
          <circle cx="12" cy="19" r="1.4" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 34,
            right: 0,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            minWidth: 180,
            zIndex: 300,
            overflow: 'hidden',
          }}
        >
          {/* Role section */}
          <div
            style={{
              padding: '8px 14px 4px',
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            Change role
          </div>
          {ROLES.map(role => {
            const active = role === member.role;
            // Only owner can assign owner. Last owner cannot be demoted.
            // Admin cannot change owner.
            let disabled = false;
            if (role === 'owner' && !viewerIsOwner)            disabled = true;
            if (member.role === 'owner' && !viewerIsOwner)     disabled = true;
            if (member.role === 'owner' && isLastOwner && role !== 'owner') disabled = true;
            return (
              <button
                key={role}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (!disabled) onRoleChange(member.userId, role);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '8px 14px',
                  background: active ? 'var(--brand-soft-bg)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: 13,
                  fontFamily: 'var(--font-body)',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--violet-text)' : disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                {active && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {!active && <span style={{ width: 12 }} />}
                {ROLE_LABEL[role]}
              </button>
            );
          })}

          {/* Disable / Enable — non-self only. Admin can't touch owner. Last owner can't be disabled. */}
          {!isSelf && !(member.role === 'owner' && (isLastOwner || !viewerIsOwner)) && (
            member.status === 'disabled' ? (
              onEnable && (
                <>
                  <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Enable this member? They will regain access to the workspace.')) {
                        onEnable(member.userId);
                      }
                      setOpen(false);
                    }}
                    style={{
                      display: 'block', width: '100%', padding: '8px 14px',
                      background: 'transparent', border: 'none', textAlign: 'left',
                      fontSize: 13, fontFamily: 'var(--font-body)',
                      color: 'var(--green-text)', cursor: 'pointer',
                    }}
                  >
                    Enable member
                  </button>
                </>
              )
            ) : (
              onDisable && (
                <>
                  <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Disable this member? They will lose access to the workspace.')) {
                        onDisable(member.userId);
                      }
                      setOpen(false);
                    }}
                    style={{
                      display: 'block', width: '100%', padding: '8px 14px',
                      background: 'transparent', border: 'none', textAlign: 'left',
                      fontSize: 13, fontFamily: 'var(--font-body)',
                      color: 'var(--yellow-text)', cursor: 'pointer',
                    }}
                  >
                    Disable member
                  </button>
                </>
              )
            )
          )}

          {/* Remove — never for self. Never for last owner. Owner-only on owners. */}
          {!isSelf && !(member.role === 'owner' && (isLastOwner || !viewerIsOwner)) && (
            <>
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <button
                type="button"
                onClick={() => { onRemove(member.userId); setOpen(false); }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 14px',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: 13,
                  fontFamily: 'var(--font-body)',
                  color: 'var(--red-text)',
                  cursor: 'pointer',
                  marginBottom: 4,
                }}
              >
                Remove from team
              </button>
            </>
          )}
          {isLastOwner && (
            <div style={{
              padding: '6px 14px 8px', fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic',
            }}>
              Last owner — promote another member to owner first.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
