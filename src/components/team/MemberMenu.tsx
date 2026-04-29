import { useEffect, useRef, useState } from 'react';
import { ROLE_LABEL } from '../../data/mockAuth';
import type { OrgMember, UserRole } from '../../types/auth';

const ROLES: UserRole[] = ['owner', 'admin', 'member', 'billing'];

interface MemberMenuProps {
  member: OrgMember;
  canManage: boolean;
  isSelf: boolean;
  onRoleChange: (userId: string, role: UserRole) => void;
  onRemove: (userId: string) => void;
}

/** ⋯ action menu shown at the end of each team-table row. */
export function MemberMenu({
  member,
  canManage,
  isSelf,
  onRoleChange,
  onRemove,
}: MemberMenuProps) {
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
          width: 28,
          height: 28,
          borderRadius: 7,
          border: '1px solid var(--border)',
          background: open ? 'var(--input-bg)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: 16,
          lineHeight: 1,
          transition: 'background 0.12s',
        }}
        aria-label="Member actions"
      >
        ···
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
            /* Only owner can assign owner; don't let users de-owner themselves */
            const disabled = role === 'owner' && member.role !== 'owner';
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

          {/* Remove — only if not self */}
          {!isSelf && (
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
        </div>
      )}
    </div>
  );
}
